import { useMemo } from 'react';
import { HStack, Mark, Spinner, Text, VStack } from '@chakra-ui/react';
import { useDebounce } from 'use-debounce';

import { Checkbox } from '@/components/ui';
import { ResultsFilters, ResultSpecSection, ResultsStats } from '@/components/results';
import { ResultsSelectionProvider, useResultsSelection } from '@/contexts/results-selection';
import { useGetResultsQuery } from '@/redux/apis/extendedApi';
import { useResultsActions, useSelectedDates, useResultsFilters } from '@/redux/slices/results';
import { getDatesBetween, getDateDisplayName } from '@/utils/dateUtils';
import { AnalysisCategory, BaseResult, ResultExecution, ResultSpec } from '@/types';
import { BulkActions } from '@/components/BulkActions';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { useResultsSurfaceColors } from '@/components/results/useResultsSurfaceColors';

import { DateList } from './date-list';

const toAnalysisCategory = (value?: string): AnalysisCategory | undefined => {
  if (!value) {
    return undefined;
  }

  return Object.values(AnalysisCategory).includes(value as AnalysisCategory) ? (value as AnalysisCategory) : undefined;
};

const ResultsContent = () => {
  const filters = useResultsFilters();
  const selectedDates = useSelectedDates();
  const selectedProjectId = useSelectedProjectId();

  const { selectAll, getSelectedCount, getSelectedIds } = useResultsSelection();

  const [debouncedFilters] = useDebounce(filters, 500);
  const { data, isFetching } = useGetResultsQuery({
    from: debouncedFilters.from,
    to: debouncedFilters.to,
    projectId: selectedProjectId!,
  });

  const { toggleDate } = useResultsActions();
  const { controlsBg, controlsBorder, toolbarBorder } = useResultsSurfaceColors();

  const { results, unfilteredResultsMap, activeDaysResultsIds, availableDates } = useMemo(() => {
    const allResults = data?.results || [];

    // Build unfiltered map (for stats on all days)
    const unfilteredMap = new Map<
      string,
      { spec: ResultSpec; executions: { execution: ResultExecution; results: BaseResult[] }[] }
    >();

    allResults.forEach((result) => {
      const baseResult: BaseResult = {
        id: result.id,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        reportPortalLink: result.reportPortalLink,
        retry: result.retry,
        status: result.status,
        duration: result.duration,
        startTime: result.startTime,
        specId: result.specId,
        executionId: result.executionId,
        errors: result.errors,
        analysisCategory: toAnalysisCategory(result.analysisFeedbackCategory) ?? result.analysisCategory,
        analysisConfidence: result.analysisFeedbackConfidence ?? result.analysisConfidence,
        analysisStatus: result.analysisStatus,
        analysisConclusion: result.analysisFeedbackConclusion ?? result.analysisConclusion,
        analysisFeedbackCategory: result.analysisFeedbackCategory,
        analysisFeedbackConfidence: result.analysisFeedbackConfidence,
        analysisFeedbackConclusion: result.analysisFeedbackConclusion,
        analysisErrorQuality: result.analysisErrorQuality,
        analysisErrorQualityConclusion: result.analysisErrorQualityConclusion,
      };

      const specKey = result.spec.key;
      if (unfilteredMap.has(specKey)) {
        const savedResult = unfilteredMap.get(specKey)!;
        const savedExecution = savedResult.executions.find((e) => e.execution.id === result.execution.id);

        if (savedExecution) {
          savedExecution.results.push(baseResult);
        } else {
          savedResult.executions.push({ execution: result.execution, results: [baseResult] });
        }
      } else {
        unfilteredMap.set(specKey, {
          spec: result.spec,
          executions: [{ execution: result.execution, results: [baseResult] }],
        });
      }
    });

    // Apply all filters EXCEPT date selection (for showing spec cards with all dates)
    const allDatesResults = allResults.filter((result) => {
      // Apply spec filters
      if (debouncedFilters.tag && !result.spec.tags.includes(debouncedFilters.tag)) {
        return false;
      }
      if (debouncedFilters.specId && result.spec.id !== debouncedFilters.specId) {
        return false;
      }
      if (
        debouncedFilters.specFile &&
        !result.spec.file.toLowerCase().includes(debouncedFilters.specFile.toLowerCase())
      ) {
        return false;
      }
      if (
        debouncedFilters.specName &&
        !result.spec.title.toLowerCase().includes(debouncedFilters.specName.toLowerCase())
      ) {
        return false;
      }

      // Apply execution filters
      if (debouncedFilters.environment && result.execution.environment !== debouncedFilters.environment) {
        return false;
      }
      if (debouncedFilters.type && result.execution.type !== debouncedFilters.type) {
        return false;
      }

      // Apply result filters
      if (debouncedFilters.status && result.status !== debouncedFilters.status) {
        return false;
      }
      if (debouncedFilters.errorMessage) {
        const hasMatchingError = result.errors.some((error) =>
          error.message.toLowerCase().includes(debouncedFilters.errorMessage.toLowerCase()),
        );
        if (!hasMatchingError) {
          return false;
        }
      }

      // Apply issue filters
      if (debouncedFilters.issueName) {
        const hasMatchingIssue = result.errors.some((error) =>
          error.assumptions.some((assumption) =>
            assumption.issue.name.toLowerCase().includes(debouncedFilters.issueName.toLowerCase()),
          ),
        );
        if (!hasMatchingIssue) {
          return false;
        }
      }

      // Apply review status filter
      if (debouncedFilters.reviewStatus) {
        const hasReviewedErrors = result.errors.some((error) => error.assumptions.length > 0);
        if (debouncedFilters.reviewStatus === 'reviewed' && !hasReviewedErrors) {
          return false;
        }
        if (debouncedFilters.reviewStatus === 'unreviewed' && hasReviewedErrors) {
          return false;
        }
      }

      return true;
    });

    // Apply date selection filter to get final results
    const filteredResults = allDatesResults.filter((result) => {
      const resultDate = result.startTime.split('T')[0];
      const isActiveDate = selectedDates.includes(resultDate);

      // Only show results from selected dates
      if (!isActiveDate) {
        return false;
      }

      return true;
    });

    const resultsMap = new Map<
      string,
      { spec: ResultSpec; executions: { execution: ResultExecution; results: BaseResult[] }[] }
    >();

    const activeIds: string[] = [];

    filteredResults.forEach((result) => {
      const baseResult: BaseResult = {
        id: result.id,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        reportPortalLink: result.reportPortalLink,
        retry: result.retry,
        status: result.status,
        duration: result.duration,
        startTime: result.startTime,
        specId: result.specId,
        executionId: result.executionId,
        errors: result.errors,
        analysisCategory: toAnalysisCategory(result.analysisFeedbackCategory) ?? result.analysisCategory,
        analysisConfidence: result.analysisFeedbackConfidence ?? result.analysisConfidence,
        analysisStatus: result.analysisStatus,
        analysisConclusion: result.analysisFeedbackConclusion ?? result.analysisConclusion,
        analysisFeedbackCategory: result.analysisFeedbackCategory,
        analysisFeedbackConfidence: result.analysisFeedbackConfidence,
        analysisFeedbackConclusion: result.analysisFeedbackConclusion,
        analysisErrorQuality: result.analysisErrorQuality,
        analysisErrorQualityConclusion: result.analysisErrorQualityConclusion,
      };

      const specKey = result.spec.key;
      if (resultsMap.has(specKey)) {
        const savedResult = resultsMap.get(specKey)!;
        const savedExecution = savedResult.executions.find((e) => e.execution.id === result.execution.id);

        if (savedExecution) {
          savedExecution.results.push(baseResult);
        } else {
          savedResult.executions.push({ execution: result.execution, results: [baseResult] });
        }
      } else {
        resultsMap.set(specKey, {
          spec: result.spec,
          executions: [{ execution: result.execution, results: [baseResult] }],
        });
      }

      activeIds.push(result.id);
    });

    const dates = getDatesBetween(filters.from, filters.to);
    const dateItems = dates.map((date) => ({
      date,
      name: getDateDisplayName(date),
      isActive: selectedDates.includes(date),
    }));

    return {
      results: resultsMap,
      unfilteredResultsMap: unfilteredMap,
      activeDaysResultsIds: activeIds,
      availableDates: dateItems,
    };
  }, [data?.results, selectedDates, filters.from, filters.to, debouncedFilters]);

  const handleSelectAll = () => {
    selectAll(activeDaysResultsIds);
  };

  const selectedCount = getSelectedCount();
  const selectedResults = useMemo(
    () => data?.results.filter(({ id }) => getSelectedIds().includes(id)) || [],
    [data?.results, getSelectedIds],
  );

  return (
    <HStack gap={4} w="100%" px={4} display="grid" alignItems="start" gridTemplateColumns="auto 1fr">
      <ResultsFilters as="aside" zIndex={10} />

      <VStack as="section" align="stretch" flex={1} minW={0} h="100%" overflow="hidden">
        <VStack
          align="stretch"
          p={2}
          bg={controlsBg}
          borderRadius="md"
          border="1px solid"
          borderColor={controlsBorder}
          flexShrink={0}
        >
          <DateList dateConfigs={availableDates} toggleDateConfig={toggleDate} />
          <ResultsStats />
        </VStack>

        <HStack gap={4} p={2} border="1px solid" borderColor={toolbarBorder} borderRadius="md" minH={12} flexShrink={0}>
          <Checkbox
            checked={activeDaysResultsIds.length !== 0 && selectedCount === activeDaysResultsIds.length}
            onCheckedChange={handleSelectAll}
          >
            Select all
          </Checkbox>
          <Text textStyle="sm">
            Shown <Mark fontWeight={600}>{activeDaysResultsIds.length}</Mark>. Selected{' '}
            <Mark fontWeight={600}>{selectedCount}</Mark>
          </Text>
          <BulkActions selectedResults={selectedResults} />
          {isFetching && <Spinner />}
        </HStack>

        <VStack
          align="stretch"
          gap={4}
          flex={1}
          overflowY="auto"
          overflowX="hidden"
          css={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'var(--chakra-colors-gray-100)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'var(--chakra-colors-gray-300)',
              borderRadius: '4px',
              '&:hover': {
                background: 'var(--chakra-colors-gray-400)',
              },
            },
          }}
        >
          <>
            {Array.from(results.entries()).map(([specKey, { spec, executions }]) => {
              const unfilteredExecutions = unfilteredResultsMap.get(specKey)?.executions || [];
              return (
                <ResultSpecSection
                  key={spec.id}
                  spec={spec}
                  executions={executions}
                  allExecutions={unfilteredExecutions}
                />
              );
            })}
          </>
        </VStack>
      </VStack>
    </HStack>
  );
};

export const ResultsList = () => {
  return (
    <ResultsSelectionProvider>
      <ResultsContent />
    </ResultsSelectionProvider>
  );
};
