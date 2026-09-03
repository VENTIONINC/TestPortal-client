// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo } from 'react';
import { Box, Heading, HStack, Table, Text, VStack } from '@chakra-ui/react';

import { Alert, Pagination, Skeleton, Wrap } from '@/components/ui';

import type { TestScenarioPagination, TestScenarioSummary } from '../types';

export interface TestScenarioCatalogViewProps {
  scenarios: TestScenarioSummary[];
  pagination: TestScenarioPagination;
  isLoading: boolean;
  error?: unknown;
  onPageChange: (page: number) => void;
}

const formatScenarioDate = (timestamp: string) => new Date(timestamp).toLocaleString('en-US');

const TABLE_CELL_PADDING = { px: 4, py: 3 } as const;

const LoadingState = () => (
  <VStack align="stretch" gap={4} aria-label="Loading Test Scenarios">
    <Text color="text.secondary">Loading Test Scenarios...</Text>
    <Box overflowX="auto">
      <Table.Root size="sm" variant="outline" minW="600px">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader {...TABLE_CELL_PADDING}>Title</Table.ColumnHeader>
            <Table.ColumnHeader {...TABLE_CELL_PADDING}>Created</Table.ColumnHeader>
            <Table.ColumnHeader {...TABLE_CELL_PADDING}>Updated</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {[1, 2, 3].map((index) => (
            <Table.Row key={index}>
              <Table.Cell {...TABLE_CELL_PADDING}>
                <Skeleton h="5" loading={true} />
              </Table.Cell>
              <Table.Cell {...TABLE_CELL_PADDING}>
                <Skeleton h="5" loading={true} />
              </Table.Cell>
              <Table.Cell {...TABLE_CELL_PADDING}>
                <Skeleton h="5" loading={true} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  </VStack>
);

const ErrorState = () => (
  <Alert.Root status="error" role="alert">
    <Alert.Indicator />
    <Alert.Content>
      <Alert.Title>Failed to load Test Scenarios</Alert.Title>
      <Alert.Description>Please try again in a moment.</Alert.Description>
    </Alert.Content>
  </Alert.Root>
);

const EmptyState = () => (
  <VStack py={8}>
    <Text color="text.muted">No Test Scenarios are available for this project.</Text>
  </VStack>
);

const ScenarioTable = ({ scenarios }: { scenarios: TestScenarioSummary[] }) => (
  <Box overflowX="auto">
    <Table.Root size="sm" variant="outline" minW="600px">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader {...TABLE_CELL_PADDING}>Title</Table.ColumnHeader>
          <Table.ColumnHeader {...TABLE_CELL_PADDING}>Created</Table.ColumnHeader>
          <Table.ColumnHeader {...TABLE_CELL_PADDING}>Updated</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {scenarios.map((scenario) => (
          <Table.Row key={scenario.id} data-testid={`test-scenario-${scenario.id}`}>
            <Table.Cell {...TABLE_CELL_PADDING}>
              <Text fontWeight="medium" color="text.main">
                {scenario.title}
              </Text>
            </Table.Cell>
            <Table.Cell {...TABLE_CELL_PADDING} color="text.secondary">
              {formatScenarioDate(scenario.createdAt)}
            </Table.Cell>
            <Table.Cell {...TABLE_CELL_PADDING} color="text.secondary">
              {formatScenarioDate(scenario.updatedAt)}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  </Box>
);

const PaginationSummary = ({ pagination }: { pagination: TestScenarioPagination }) => {
  const firstItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const lastItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <HStack justify="flex-end" align="center" gap={4} flexWrap="wrap" w="100%">
      <Text color="text.secondary" fontSize="sm" textAlign="right">
        Showing {firstItem}-{lastItem} of {pagination.total} Test Scenarios
      </Text>
    </HStack>
  );
};

export const TestScenarioCatalogView = memo(function TestScenarioCatalogView({
  scenarios,
  pagination,
  isLoading,
  error,
  onPageChange,
}: TestScenarioCatalogViewProps) {
  return (
    <Wrap my={4} mx={6} p={4}>
      <VStack align="stretch" gap={4} w="100%">
        <VStack align="start" gap={2}>
          <Heading fontSize="lg">Test Scenarios</Heading>
          <Text color="text.secondary">
            Browse the Markdown Test Scenarios available in the selected project.
          </Text>
        </VStack>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState />
        ) : scenarios.length === 0 ? (
          <EmptyState />
        ) : (
          <VStack align="stretch" gap={4}>
            <ScenarioTable scenarios={scenarios} />
            {pagination.totalPages > 1 && (
              <Box as="nav" aria-label="Test Scenario pagination">
                <HStack justify="center" py={2}>
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={onPageChange}
                  />
                </HStack>
              </Box>
            )}
            <PaginationSummary pagination={pagination} />
          </VStack>
        )}
      </VStack>
    </Wrap>
  );
});
