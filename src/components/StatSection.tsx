import { memo, useState } from 'react';
import { Collapsible, HStack, Mark, Spinner, Text, VStack } from '@chakra-ui/react';
import { LuArrowBigRight } from 'react-icons/lu';
import { useDebounce } from 'use-debounce';

import { useGetApiV1ResultsStatsQuery } from '@/redux/apis/generatedApi';
import { useResultsActions } from '@/redux/slices/results';
import { getIssueCategoryStyle } from '@/utils';
import { DateConfig } from '@/utils/dateRange';
import { IssueCategory } from '@/types';

interface StatSectionProps {
  dateConfigs: DateConfig[];
}

export const StatSection = memo(({ dateConfigs }: StatSectionProps) => {
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const { setFilters } = useResultsActions();

  const [debouncedDateConfigs] = useDebounce(dateConfigs, 200);
  const { data: statistics, isFetching } = useGetApiV1ResultsStatsQuery({
    dates: debouncedDateConfigs.filter(({ isActive }) => isActive).map(({ date }) => date),
  });

  const handleFilterChange = (name: string, value: string) => {
    setFilters({ [name]: value, page: 1 });
  };

  if (!statistics || statistics.byStatusTotal === 0) {
    return (
      <Text alignSelf="center" color="gray.500">
        No statistics to display.
      </Text>
    );
  }

  return (
    <Collapsible.Root onOpenChange={() => setIsStatsOpen(!isStatsOpen)}>
      <Collapsible.Trigger asChild>
        <HStack flex={1} w="100%" cursor="pointer" _hover={{ bg: 'gray.200' }} borderRadius="sm">
          <LuArrowBigRight
            size={16}
            style={{
              transform: isStatsOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
          <Text fontWeight={500}>
            Total: {statistics.byStatusTotal} | <Mark color="green.600">Passed: {statistics.byStatus.passed}</Mark> |{' '}
            <Mark color="red.600">Failed: {statistics.byStatus.failed}</Mark> |{' '}
            <Mark color="yellow.600">Skipped: {statistics.byStatus.skipped}</Mark> |{' '}
            <Mark color="orange.600">Timed Out: {statistics.byStatus.timedOut}</Mark>
          </Text>

          {isFetching && <Spinner size="sm" />}
        </HStack>
      </Collapsible.Trigger>

      <Collapsible.Content>
        <HStack gap={4} textStyle="md" mt={2} ms={2}>
          <Text>Specs: {statistics.entityCounts.specs}</Text>
          <Text>Results: {statistics.entityCounts.results}</Text>
          <Text>Executions: {statistics.entityCounts.executions}</Text>
          <Text>Issues: {statistics.entityCounts.issues}</Text>
          <Text>Errors: {statistics.entityCounts.errors}</Text>
          <Text>Assumptions: {statistics.entityCounts.assumptions}</Text>
        </HStack>

        <HStack align="flex-start" mt={2}>
          {statistics.topErrors.length > 0 && (
            <TopSection
              results={statistics.topErrors}
              label="errors"
              onClick={(message) => handleFilterChange('errorMessage', message)}
            />
          )}
          {statistics.topIssues.length > 0 && (
            <VStack flex={1} align="stretch">
              <TopSection
                results={statistics.topIssues}
                label="issues"
                onClick={(message) => handleFilterChange('issueName', message)}
              />
              <VStack align="stretch" bg="white" p={2} borderRadius="md">
                <Text fontWeight={700}>Issue Categories</Text>
                <HStack>
                  {Object.values(IssueCategory).map((category) => {
                    const { Icon, color } = getIssueCategoryStyle(category);

                    return (
                      <HStack
                        key={category}
                        border="1px solid"
                        borderColor={color}
                        borderRadius="md"
                        color={color}
                        px={1}
                      >
                        <Icon size={16} color="currentColor" />
                        <Text textStyle="sm" color="black">
                          {category}
                        </Text>
                      </HStack>
                    );
                  })}
                </HStack>
              </VStack>
            </VStack>
          )}
        </HStack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
});

interface TopSectionProps {
  results: { title: string; count: number }[];
  label: string;
  onClick: (message: string) => void;
}

const TopSection = ({ results, label, onClick }: TopSectionProps) => {
  return (
    <VStack align="stretch" bg="white" p={2} borderRadius="md" flex={1}>
      <Text fontWeight={700}>
        Top {results.length} {label}
      </Text>
      {results.map(({ title, count }, index) => (
        <HStack
          key={title}
          textStyle="md"
          borderBottom={index === results.length - 1 ? 'none' : '1px solid'}
          borderColor="gray.200"
        >
          <Text fontWeight={700} color="gray.700">
            {count}x
          </Text>
          <Text onClick={() => onClick(title)} lineClamp={1} cursor="pointer" _hover={{ textDecoration: 'underline' }}>
            {title}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
};
