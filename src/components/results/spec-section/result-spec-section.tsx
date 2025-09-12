import { memo, useMemo } from 'react';
import { Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { LuFileText, LuTag } from 'react-icons/lu';

import { ClipboardCopyText } from '@/components/ui';
import { ResultsExecutionCard } from '@/components/results';
import { useResultsActions, useSelectedDates } from '@/redux/slices/results';
import { getDateDisplayName } from '@/utils/dateUtils';
import { toCleanTitle } from '@/utils/date-time.converter';
import { BaseResult, ResultExecution, ResultSpec } from '@/types';
import { useCurrentUser } from '@/hooks/useCurrentUser';

import { DateToggle } from './date-toggle';
import { serializeExecution } from './helpers';

interface ResultSpecSectionProps {
  spec: ResultSpec;
  executions: { execution: ResultExecution; results: BaseResult[] }[];
}

export const ResultSpecSection = memo(({ spec, executions }: ResultSpecSectionProps) => {
  const selectedDates = useSelectedDates();
  const user = useCurrentUser();

  const { updateFilters, toggleDate } = useResultsActions();

  const dateFilters = useMemo(() => {
    const allResultDates = executions
      .flatMap(({ results }) => results.map((result) => result.startTime.split('T')[0]))
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort();

    return allResultDates.map((date) => {
      const statuses = executions
        .filter(({ results }) => results.some((result) => result.startTime.split('T')[0] === date))
        .flatMap(({ results }) => results.map((result) => result.status));

      return {
        yyyy_mm_dd: date,
        stats: statuses,
        isActive: selectedDates.includes(date),
        display: getDateDisplayName(date),
      };
    });
  }, [selectedDates, executions]);

  const filteredExecutions = useMemo(() => {
    return executions
      .filter(({ results }) => results.some((result) => selectedDates.includes(result.startTime.split('T')[0])))
      .sort((a, b) => new Date(b.execution.createdAt).getTime() - new Date(a.execution.createdAt).getTime());
  }, [executions, selectedDates]);

  const handleDateToggle = (dayFilter: { yyyy_mm_dd: string }) => {
    toggleDate(dayFilter.yyyy_mm_dd);
  };

  const handleTagClick = (tag: string) => {
    updateFilters({ tag });
  };

  if (!dateFilters.some((day) => day.stats.length !== 0 && day.isActive)) {
    return null;
  }

  return (
    <VStack align="stretch" p={2} bg="gray.100" shadow="md" borderRadius="md">
      <HStack overflowX="auto" pb={2}>
        {dateFilters.map((day) => (
          <DateToggle key={day.yyyy_mm_dd} day={day} toggleHandler={handleDateToggle} />
        ))}
      </HStack>

      <VStack
        gap={1}
        align="stretch"
        bg="white"
        py={2}
        px={4}
        border="1px solid"
        borderColor="gray.300"
        borderRadius="md"
      >
        <Flex gap={4} textStyle="sm">
          <ClipboardCopyText value={spec.key}>{spec.key}</ClipboardCopyText>
          <ClipboardCopyText value={spec.file}>{spec.file}</ClipboardCopyText>

          <Flex ms="auto" flexWrap="wrap" gap={2}>
            {spec.tags?.map((tag) => (
              <HStack
                key={tag}
                px={2}
                border="1px solid"
                borderColor="gray.300"
                borderRadius="sm"
                onClick={() => handleTagClick(tag)}
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
              >
                <LuTag size={12} />
                <Text textStyle="sm">{tag}</Text>
              </HStack>
            ))}
          </Flex>
        </Flex>

        <div className="row spec-meta" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <HStack align="center" textStyle="sm">
            <LuFileText size={16} />
            <ClipboardCopyText value={toCleanTitle(spec.title)}>{toCleanTitle(spec.title)}</ClipboardCopyText>
          </HStack>
        </div>
      </VStack>

      {filteredExecutions.map(({ execution, results }) => {
        const serizedExecution = serializeExecution(execution, user);

        return <ResultsExecutionCard key={execution.id} results={results} {...serizedExecution} />;
      })}
    </VStack>
  );
});
