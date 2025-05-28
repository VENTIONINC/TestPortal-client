import { Button, Heading, HStack, Mark, Text, VStack } from '@chakra-ui/react';

import { IssuesFilters } from '@/components/issues/filters';
import { useIssueFilters } from '@/hooks/useIssueFilters';
import { useIssuesQuery } from '@/hooks/useIssuesQuery';

export const Issues = () => {
  const { filters, updateFilters } = useIssueFilters();

  const { data } = useIssuesQuery(filters);

  const nextPage = () => {
    if (data && filters.page < data.totalPages) {
      updateFilters({ page: filters.page + 1 });
    }
  };

  const prevPage = () => {
    if (data && filters.page > 1) {
      updateFilters({ page: filters.page - 1 });
    }
  };

  return (
    <HStack align="flex-start" gap={4}>
      <IssuesFilters filters={filters} updateFilters={updateFilters} as="aside" />

      <VStack flex={1} align="flex-start">
        <Heading textStyle="3xl">Issues</Heading>
        <VStack flex={1} align="flex-start" w="100%">
          {data && data?.issues?.length > 0 ? (
            data.issues.map((issue, index) => (
              <VStack
                key={index}
                align="flex-start"
                w="100%"
                bg="gray.100"
                border="1px solid"
                borderColor="gray.400"
                borderRadius="md"
                p={4}
              >
                <Text fontWeight={600}>{issue.name}</Text>
                <Text>
                  <Mark fontWeight={600}>Category:</Mark> {issue.category}
                </Text>
                <Text>
                  <Mark fontWeight={600}>Description:</Mark> {issue.description}
                </Text>
                <Text>
                  <Mark fontWeight={600}>Created At:</Mark> {new Date(issue.createdAt).toLocaleDateString()}
                </Text>
              </VStack>
            ))
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
