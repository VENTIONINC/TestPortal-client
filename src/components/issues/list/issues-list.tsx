import { Button, Heading, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { useDebounce } from 'use-debounce';

import { IssueCard, IssuesFilters } from '@/components/issues';
import { useGetIssuesWithStatsQuery } from '@/redux/apis/extendedApi';
import { useIssuesActions, useIssuesFilters } from '@/redux/slices/issues';
import { IssueWithStats } from '@/types';

export const IssuesList = () => {
  const filters = useIssuesFilters();

  const { setFilters } = useIssuesActions();

  const [debouncedFilters] = useDebounce(filters, 500);
  const { data, isFetching } = useGetIssuesWithStatsQuery(debouncedFilters);

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

  return (
    <HStack align="flex-start" gap={4} w="100%">
      <IssuesFilters as="aside" />

      <VStack flex={1} align="stretch">
        <HStack ps={6}>
          <Heading textStyle="3xl">Issues</Heading>
          {isFetching && <Spinner />}
        </HStack>
        <VStack flex={1} gap={4}>
          {data && data.issues?.length > 0 ? (
            data.issues.map((issue, index) => <IssueCard key={index} issue={issue as IssueWithStats} />)
          ) : (
            <Text>No issues found.</Text>
          )}
        </VStack>

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
  );
};
