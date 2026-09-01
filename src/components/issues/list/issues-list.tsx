// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo } from 'react';
import { HStack, Text, VStack, Box, useMediaQuery } from '@chakra-ui/react';
import { FormProvider } from 'react-hook-form';

import { normalizeExecutionTypeFilters, useExecutionTypeOptions, useFiltersWithUrl } from '@/hooks';
import { IssueCard, IssueCardSkeleton } from '@/components/issues';
import { useGetIssuesWithStatsQuery } from '@/redux/apis/extendedApi';
import { initialFilters, useIssuesActions, useIssuesFilters } from '@/redux/slices/issues';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { useFilterContext } from '@/contexts/FilterContext';
import { IssueWithStats, ResultCategory } from '@/types';
import { GetApiV2IssuesWithStatsApiArg } from '@/redux/apis/generatedApi';
import { Filter, Pagination } from '@/components/ui';

import { filterConfig } from '../configs';

interface IssuesQueryFilterValues extends Record<string, string> {
  projectId: string;
  page: string;
  category: string;
  name: string;
  type: string;
  statFrom: string;
  statTo: string;
}

export const buildIssuesQueryParams = (
  filters: IssuesQueryFilterValues,
): GetApiV2IssuesWithStatsApiArg => ({
  projectId: filters.projectId,
  page: Number(filters.page) || 1,
  category: Object.values(ResultCategory).includes(filters.category as ResultCategory)
    ? filters.category as ResultCategory
    : undefined,
  name: filters.name || undefined,
  type: filters.type && filters.type !== 'all' ? filters.type : undefined,
  statFrom: filters.statFrom || undefined,
  statTo: filters.statTo || undefined,
});
export const IssuesList = () => {
  const filters = useIssuesFilters();
  const { setFilters } = useIssuesActions();
  const { showFilters } = useFilterContext();

  const selectedProjectId = useSelectedProjectId();
  const [isWideScreen] = useMediaQuery(['(min-width: 1920px)']);

  const { formMethods, filterProps } = useFiltersWithUrl({
    currentFilters: filters,
    initialFilters,
    onUpdateFilters: setFilters,
    normalizeFilters: normalizeExecutionTypeFilters,
  });

  const handleInvalidExecutionType = useCallback(
    (type: 'all') => {
      filterProps.onApplyFilters({ ...filterProps.filters, type });
    },
    [filterProps],
  );
  const { options: executionTypeOptions, isLoading: areExecutionTypesLoading, effectiveType } =
    useExecutionTypeOptions({
    projectId: selectedProjectId ?? '',
    selectedType: filterProps.filters.type || 'all',
    onInvalidType: handleInvalidExecutionType,
  });

  const dynamicFilterConfig = useMemo(
    () =>
      filterConfig.map((section) =>
        section.title === 'Execution filters'
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.name === 'type'
                  ? { ...field, options: executionTypeOptions, disabled: areExecutionTypesLoading }
                  : field,
              ),
            }
          : section,
      ),
    [areExecutionTypesLoading, executionTypeOptions],
  );

  const issuesQueryParams = useMemo(
    () =>
      buildIssuesQueryParams({
        projectId: selectedProjectId,
        page: filterProps.filters.page,
        category: filterProps.filters.category,
        name: filterProps.filters.name,
        type: effectiveType,
        statFrom: filterProps.filters.statFrom,
        statTo: filterProps.filters.statTo,
      }),
    [
      selectedProjectId,
      filterProps.filters.page,
      filterProps.filters.category,
      filterProps.filters.name,
      effectiveType,
      filterProps.filters.statFrom,
      filterProps.filters.statTo,
    ],
  );

  const { data, isFetching } = useGetIssuesWithStatsQuery(issuesQueryParams);

  return (
    <FormProvider {...formMethods}>
      <HStack align="flex-start" gap={4} w="100%">
        <Filter config={dynamicFilterConfig} {...filterProps} />
        <VStack flex={1} align="stretch" minW={0} py={6} pr={4}>
          <Box
            display="grid"
            gridTemplateColumns={{ base: '1fr', lg: showFilters && !isWideScreen ? '1fr' : '1fr 1fr' }}
            gap={4}
            flex={1}
            w="100%"
            minW={0}
          >
            {isFetching ? (
              Array.from({ length: 10 }).map((_, index) => <IssueCardSkeleton key={index} />)
            ) : data && data.issues?.length > 0 ? (
              data.issues.map((issue, index) => <IssueCard key={index} issue={issue as IssueWithStats} />)
            ) : (
              <Text>No issues found.</Text>
            )}
          </Box>

          {data && data.totalPages > 1 && (
            <HStack alignSelf="center" py={2}>
              <Pagination
                currentPage={Number(filters.page) || 1}
                totalPages={data.totalPages}
                onPageChange={(page) => setFilters({ page })}
                variant={showFilters && !isWideScreen ? 'simple' : 'full'}
                size="sm"
              />
            </HStack>
          )}
        </VStack>
      </HStack>
    </FormProvider>
  );
};
