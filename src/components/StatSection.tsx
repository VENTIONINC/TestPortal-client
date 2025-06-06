import { memo, useMemo } from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';

import { useGetResultsQuery } from '@/redux/apis/extendedApi';
import { FilterParamsState } from '@/hooks/useFilterParams';
import { DateConfig } from '@/utils/dateRange';
import { Result, ResultSpec, ResultExecution, ResultErrorAssumption, ResultError, Issue } from '@/types';

const MAX_MESSAGE_LENGTH = 100;

interface StatsData {
  byStatus: {
    passed: number;
    failed: number;
    skipped: number;
    timedOut: number;
    [key: string]: number; // For other statuses if any
  };
  byModels: {
    specs: number;
    results: number;
    executions: number;
    issues: number;
    errors: number;
    assumptions: number;
  };
  byErrors: { [errorMessage: string]: number };
  byIssueNames: { [issueName: string]: number };
  byIssueCategories: { [issueCategory: string]: number };
}

interface StatSectionProps {
  filterParams: FilterParamsState;
  dateConfigs: DateConfig[];
}

export const StatSection = memo(({ filterParams, dateConfigs }: StatSectionProps) => {
  const { data } = useGetResultsQuery({
    status: filterParams.status,
    from: filterParams.from,
    to: filterParams.to,
    page: filterParams.page,
  });

  const stats: StatsData = useMemo(() => {
    const activeDates = new Set(dateConfigs.filter((day) => day.isActive).map(({ date }) => date));
    const results = (data?.results || []).filter((result) => activeDates.has(result.startTime.split('T')[0]));

    const specMap = new Map<string | number, ResultSpec>();
    const executionMap = new Map<string | number, ResultExecution>();
    const errorMap = new Map<string | number, ResultError>();
    const assumptionMap = new Map<string | number, ResultErrorAssumption>();
    const resultMap = new Map<string | number, Result>();
    const issueMap = new Map<string | number, Issue>();

    const newStats: StatsData = {
      byStatus: { passed: 0, failed: 0, skipped: 0, timedOut: 0 },
      byModels: {
        specs: 0,
        results: 0,
        executions: 0,
        issues: 0,
        errors: 0,
        assumptions: 0,
      },
      byErrors: {},
      byIssueNames: {},
      byIssueCategories: {},
    };

    if (!results) return newStats;

    for (const result of results) {
      if (result.status) {
        newStats.byStatus[result.status] = (newStats.byStatus[result.status] || 0) + 1;
      }

      if (!specMap.has(result.spec.id)) specMap.set(result.spec.id, result.spec);
      if (!executionMap.has(result.execution.id)) executionMap.set(result.execution.id, result.execution);
      if (!resultMap.has(result.id)) resultMap.set(result.id, result);

      result.errors?.forEach((error) => {
        const errorKey = error.id || error.message;
        if (!errorMap.has(errorKey)) errorMap.set(errorKey, error);

        const errorMessage = error.message || 'Unknown Error';
        newStats.byErrors[errorMessage] = (newStats.byErrors[errorMessage] || 0) + 1;

        error.assumptions?.forEach((assumption) => {
          const assumptionKey = assumption.id || Math.random().toString();
          if (!assumptionMap.has(assumptionKey)) assumptionMap.set(assumptionKey, assumption);

          if (assumption.issue) {
            const issue = assumption.issue;
            if (!issueMap.has(issue.id)) issueMap.set(issue.id, issue);

            const issueName = issue.name || 'Unknown Issue Name';
            newStats.byIssueNames[issueName] = (newStats.byIssueNames[issueName] || 0) + 1;

            const issueCategory = issue.category || 'Unknown Category';
            newStats.byIssueCategories[issueCategory] = (newStats.byIssueCategories[issueCategory] || 0) + 1;
          }
        });
      });
    }

    newStats.byModels.specs = specMap.size;
    newStats.byModels.results = resultMap.size;
    newStats.byModels.executions = executionMap.size;
    newStats.byModels.issues = issueMap.size;
    newStats.byModels.errors = errorMap.size;
    newStats.byModels.assumptions = assumptionMap.size;

    return newStats;
  }, [data?.results, dateConfigs]);

  const topErrors = useMemo(() => {
    return Object.entries(stats.byErrors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [stats.byErrors]);

  const topIssues = useMemo(() => {
    return Object.entries(stats.byIssueNames)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [stats.byIssueNames]);

  const summaryText = useMemo(() => {
    return Object.entries(stats.byStatus)
      .map(([key, value]) => `Total ${key}: ${value}`)
      .join(' | ');
  }, [stats.byStatus]);

  if (!data?.results || data?.results.length === 0) {
    return (
      <Text alignSelf="center" textStyle="md" color="gray.500" mt={2}>
        No active results to display stats for.
      </Text>
    );
  }

  return (
    <Box as="details">
      <Box as="summary" mt={2} cursor="pointer" _hover={{ bg: 'gray.200' }}>
        {summaryText}
      </Box>

      <HStack gap={4} textStyle="md" mt={2} ms={2}>
        <Text>
          Specs: <span>{stats.byModels.specs}</span>
        </Text>
        <Text>
          Results: <span>{stats.byModels.results}</span>
        </Text>
        <Text>
          Executions: <span>{stats.byModels.executions}</span>
        </Text>
        <Text>
          Issues: <span>{stats.byModels.issues}</span>
        </Text>
        <Text>
          Errors: <span>{stats.byModels.errors}</span>
        </Text>
        <Text>
          Assumptions: <span>{stats.byModels.assumptions}</span>
        </Text>
      </HStack>

      <HStack align="flex-start" mt={2}>
        {topErrors.length > 0 && <TopSection results={topErrors} label="errors" />}
        {topIssues.length > 0 && <TopSection results={topIssues} label="issues" />}
      </HStack>
    </Box>
  );
});

const TopSection = ({ results, label }: { results: [string, number][]; label: string }) => {
  return (
    <VStack align="stretch" bg="white" p={2} borderRadius="md" flex={1}>
      <Text fontWeight={700}>
        Top {results.length} {label}
      </Text>
      {results.map(([errorMsg, count], index) => (
        <HStack
          key={errorMsg}
          textStyle="md"
          borderBottom={index === results.length - 1 ? 'none' : '1px solid'}
          borderColor="gray.200"
        >
          <Text fontWeight={700} color="gray.700">
            {count}x
          </Text>
          <Text>{errorMsg.length > MAX_MESSAGE_LENGTH ? `${errorMsg.slice(0, MAX_MESSAGE_LENGTH)}...` : errorMsg}</Text>
        </HStack>
      ))}
    </VStack>
  );
};
