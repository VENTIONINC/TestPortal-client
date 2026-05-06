import { HStack, Text, VStack, Box, useMediaQuery } from '@chakra-ui/react';
import { FormProvider } from 'react-hook-form';

import { useFiltersWithUrl } from '@/hooks';
import { IssueCard, IssueCardSkeleton } from '@/components/issues';
import { useGetIssuesWithStatsQuery } from '@/redux/apis/extendedApi';
import { initialFilters, useIssuesActions, useIssuesFilters } from '@/redux/slices/issues';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { useFilterContext } from '@/contexts/FilterContext';
import { IssueWithStats } from '@/types';
import { Filter, Pagination } from '@/components/ui';

import { filterConfig } from '../configs';

export const IssuesList = () => {
  const filters = useIssuesFilters();
  const { setFilters } = useIssuesActions();
  const { showFilters } = useFilterContext();

  const selectedProjectId = useSelectedProjectId();
  const [isWideScreen] = useMediaQuery(['(min-width: 1920px)']);

  const { data, isFetching } = useGetIssuesWithStatsQuery({ ...filters, projectId: selectedProjectId });

  const { formMethods, filterProps } = useFiltersWithUrl({
    currentFilters: filters,
    initialFilters,
    onUpdateFilters: setFilters,
  });

  return (
    <FormProvider {...formMethods}>
      <HStack align="flex-start" gap={4} w="100%">
        <Filter config={filterConfig} {...filterProps} />
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
                currentPage={filters.page}
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
