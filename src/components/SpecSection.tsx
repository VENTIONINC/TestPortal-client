import { memo, useEffect, useMemo, useState } from 'react';
import { Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { LuSquareUserRound, LuTag } from 'react-icons/lu';

import type { DateConfig } from '@/utils/dateRange';
import { toCleanTitle } from '@/utils/date-time.converter';
import { BaseResult, ResultExecution, ResultSpec } from '@/types';

import { DateToggle } from './DateToggle';
import { ExecutionCard } from './ExecutionCard';

interface SpecSectionProps {
  spec: ResultSpec;
  executions: { execution: ResultExecution; results: BaseResult[] }[];
  dateConfigs: DateConfig[];
}

export const SpecSection = memo(({ spec, executions, dateConfigs: globalDateConfigs }: SpecSectionProps) => {
  const [dateConfigs, setDateConfigs] = useState(globalDateConfigs);

  const dateFilters = useMemo(() => {
    return dateConfigs.map((focus) => {
      const statuses = executions
        .filter(({ results }) => results.some((result) => result.startTime.split('T')[0] === focus.date))
        .flatMap(({ results }) => results.map((result) => result.status));

      return {
        yyyy_mm_dd: focus.date,
        stats: statuses,
        isActive: focus.isActive,
        display: focus.name,
      };
    });
  }, [dateConfigs, executions]);

  const filteredExecutions = useMemo(() => {
    const activeDates = dateConfigs.filter((day) => day.isActive).map(({ date }) => date);

    return executions
      .filter(({ results }) => results.some((result) => activeDates.includes(result.startTime.split('T')[0])))
      .sort((a, b) => new Date(b.execution.createdAt).getTime() - new Date(a.execution.createdAt).getTime());
  }, [executions, dateConfigs]);

  const handleDateToggle = (dayFilter: { yyyy_mm_dd: string }) => {
    setDateConfigs((prevConfigs) =>
      prevConfigs.map((d) => (d.date === dayFilter.yyyy_mm_dd ? { ...d, isActive: !d.isActive } : d)),
    );
  };

  useEffect(() => {
    setDateConfigs(globalDateConfigs);
  }, [globalDateConfigs]);

  if (!dateFilters.some((day) => day.stats.length !== 0 && day.isActive)) {
    return null;
  }

  return (
    <VStack align="stretch" p={2} bg="gray.100" shadow="md" borderRadius="md">
      <HStack>
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
          <Text>{spec.key}</Text>
          <Text>{spec.file}</Text>

          <Flex ms="auto" gap={2}>
            {spec.tags?.map((tag) => (
              <HStack key={tag} px={2} border="1px solid" borderColor="gray.300" borderRadius="sm" textStyle="sm">
                <LuTag size={12} />
                {tag}
              </HStack>
            ))}
          </Flex>
        </Flex>

        <div className="row spec-meta" style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* {issueAnnotations.length > 0 && (
            <div className="col issue-links" style={{ display: 'flex', alignItems: 'center' }}>
              {issueAnnotations.map((annotation: Annotation, index: number) => (
                <a
                  key={index}
                  href={annotation.description}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="issue-link"
                  style={{ marginRight: '0.5rem', fontSize: '0.9em' }}
                >
                  <img
                    src="https://icongr.am/clarity/link.svg?size=10&color=currentColor"
                    alt="link icon"
                    className="icon"
                    style={{ marginRight: '0.2rem' }}
                  />
                  Jira Issue {issueAnnotations.length > 1 ? index + 1 : ''}
                </a>
              ))}
            </div>
          )} */}

          <HStack align="center" textStyle="sm">
            <LuSquareUserRound size={16} />
            {toCleanTitle(spec.title)}
          </HStack>
        </div>
      </VStack>

      {filteredExecutions.map(({ execution, results }) => (
        <ExecutionCard key={execution.id} execution={execution} results={results} />
      ))}
    </VStack>
  );
});
