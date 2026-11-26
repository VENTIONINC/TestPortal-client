// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Button, Skeleton, Table, Text, VStack } from '@chakra-ui/react';

import { Alert } from '@/components/ui';

export const CatalogLoadError = () => (
  <Alert.Root status="error" role="alert">
    <Alert.Indicator />
    <Alert.Content>
      <Alert.Title>Failed to load Test Scenarios</Alert.Title>
      <Alert.Description>Please try again in a moment.</Alert.Description>
    </Alert.Content>
  </Alert.Root>
);

interface CatalogTableEmptyStateProps {
  searchActive?: boolean;
  emptySuite?: boolean;
  emptyFolder?: boolean;
  suiteView?: boolean;
  onAddScenarios?: () => void;
  onCreateScenario?: () => void;
}

export const CatalogTableEmptyState = ({
  searchActive = false,
  emptySuite = false,
  emptyFolder = false,
  suiteView = false,
  onAddScenarios,
}: CatalogTableEmptyStateProps) => (
  <VStack py={8} gap={3}>
    <Text color="text.muted">
      {emptySuite
        ? 'No scenarios in this suite yet'
        : emptyFolder
          ? 'No scenarios in this folder yet'
          : searchActive
            ? suiteView
              ? 'No scenarios in this suite match the search and filters'
              : 'No scenarios match the current folder, search and filters'
            : 'No Test Scenarios are available for this project.'}
    </Text>
    {emptySuite && onAddScenarios && (
      <Button size="sm" variant="outline" onClick={onAddScenarios}>
        Add scenarios
      </Button>
    )}
  </VStack>
);

export const CatalogLoadingRow = ({ columnCount }: { columnCount: number }) => (
  <Table.Row>
    {Array.from({ length: columnCount }, (_, index) => (
      <Table.Cell key={index}>
        {index === 0 && (
          <Text srOnly role="status">
            Searching scenarios…
          </Text>
        )}
        <Skeleton height="14px" width="100%" />
      </Table.Cell>
    ))}
  </Table.Row>
);
