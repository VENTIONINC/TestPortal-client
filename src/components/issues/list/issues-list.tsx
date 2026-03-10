import { Button, HStack, Spinner, Text, VStack, Box, useMediaQuery } from '@chakra-ui/react';
import { FormProvider } from 'react-hook-form';
import { useDebounce } from 'use-debounce';

import { useFiltersWithUrl } from '@/hooks';
import { IssueCard } from '@/components/issues';
import { useGetIssuesWithStatsQuery } from '@/redux/apis/extendedApi';
import { initialFilters, useIssuesActions, useIssuesFilters } from '@/redux/slices/issues';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { useFilterContext } from '@/contexts/FilterContext';
import { IssueWithStats } from '@/types';
import { Filter } from '@/components/ui';

import { filterConfig } from '../configs';

export const IssuesList = () => {
  const filters = useIssuesFilters();
  const { setFilters } = useIssuesActions();
  const { showFilters } = useFilterContext();

  const selectedProjectId = useSelectedProjectId();
  const [isWideScreen] = useMediaQuery(['(min-width: 1920px)']);

  const [debouncedFilters] = useDebounce(filters, 500);
  const { data, isFetching } = useGetIssuesWithStatsQuery({ ...debouncedFilters, projectId: selectedProjectId });

  const nextPage = () => {
    if (data && filters.page < data.totalPages) {
      setFilters({ page: filters.page + 1 });
    }
  };

  const prevPage = () => {
    if (data && filters.page > 1) {
      setFilters({ page: filters.page - 1 });
    }
  };
  const { formMethods, filterProps } = useFiltersWithUrl({
    currentFilters: filters,
    initialFilters,
    onUpdateFilters: setFilters,
  });

  return (
    <FormProvider {...formMethods}>
      <HStack align="flex-start" gap={4} w="100%">
        <Filter config={filterConfig} {...filterProps} />
        <VStack flex={1} align="stretch" minW={0}>
          {isFetching && (
            <HStack ps={2}>
              <Spinner />
            </HStack>
          )}
          <Box
            display="grid"
            gridTemplateColumns={{ base: '1fr', lg: showFilters && !isWideScreen ? '1fr' : '1fr 1fr' }}
            gap={4}
            flex={1}
            w="100%"
            minW={0}
          >
            {data && data.issues?.length > 0 ? (
              data.issues.map((issue, index) => <IssueCard key={index} issue={issue as IssueWithStats} />)
            ) : (
              <Text>No issues found.</Text>
            )}
          </Box>

          {data && data.totalPages > 1 && (
            <HStack alignSelf="center">
              <Button variant="ghost" onClick={prevPage} disabled={filters.page === 1}>
                Previous
              </Button>
              <Text>
                Page {filters.page} of {data.totalPages}
              </Text>
              <Button variant="ghost" onClick={nextPage} disabled={filters.page === data.totalPages}>
                Next
              </Button>
            </HStack>
          )}
        </VStack>
      </HStack>
    </FormProvider>
  );
};
