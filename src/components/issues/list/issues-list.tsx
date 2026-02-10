import { Button, Heading, HStack, Spinner, Text, VStack, Box, useMediaQuery } from '@chakra-ui/react';
import { useDebounce } from 'use-debounce';

import { IssueCard, IssuesFilters } from '@/components/issues';
import { useGetIssuesWithStatsQuery } from '@/redux/apis/extendedApi';
import { useIssuesActions, useIssuesFilters } from '@/redux/slices/issues';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { IssueWithStats } from '@/types';

interface IssuesListProps {
  showFilters?: boolean;
}

export const IssuesList = ({ showFilters = true }: IssuesListProps) => {
  const filters = useIssuesFilters();
  const selectedProjectId = useSelectedProjectId();
  const [isWideScreen] = useMediaQuery(['(min-width: 1920px)']);

  const { setFilters } = useIssuesActions();

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

  return (
    <HStack align="flex-start" gap={4} w="100%">
      <Box
        width={showFilters ? '360px' : '0px'}
        opacity={showFilters ? 1 : 0}
        overflow="hidden"
        transition="all 0.3s ease-in-out"
        flexShrink={0}
      >
        <IssuesFilters as="aside" width="360px" />
      </Box>
      <VStack flex={1} align="stretch" minW={0}>
        <HStack ps={2}>{isFetching && <Spinner />}</HStack>
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
  );
};
