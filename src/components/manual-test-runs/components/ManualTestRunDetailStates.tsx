// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Alert, Button, Text, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import type { ManualTestRunRead } from '@/redux/apis/generatedApi';

export const ManualTestRunLoadingState = () => (
  <VStack align="center" gap={3} minH="300px" justify="center">
    <Text color="text.secondary">Loading Manual Test Run...</Text>
  </VStack>
);

export const ManualTestRunUnavailableState = ({ onBack }: { onBack: () => void }) => (
  <VStack align="center" gap={4} minH="300px" justify="center" px={4}>
    <Text fontSize="lg">Manual Test Run unavailable</Text>
    <Text color="text.secondary">This run is not available in the selected project.</Text>
    <Button variant="outline" onClick={onBack}>Return to Test Scenarios</Button>
  </VStack>
);

export const ManualTestRunErrorState = ({ onRetry, onBack }: { onRetry: () => void; onBack: () => void }) => (
  <VStack align="stretch" gap={4} minH="300px" justify="center" px={4}>
    <Alert.Root status="error" role="alert">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>Failed to load Manual Test Run</Alert.Title>
        <Alert.Description>Please try again in a moment.</Alert.Description>
      </Alert.Content>
    </Alert.Root>
    <VStack gap={2}>
      <Button variant="outline" onClick={onRetry}>Try again</Button>
      <Button variant="ghost" onClick={onBack}>Return to Test Scenarios</Button>
    </VStack>
  </VStack>
);

export interface ManualTestRunDetailStateViewProps {
  run?: ManualTestRunRead;
  isLoading: boolean;
  isUnavailable: boolean;
  isError: boolean;
  onRetry: () => void;
  onBack: () => void;
  children: (run: ManualTestRunRead) => ReactNode;
}

export const ManualTestRunDetailStateView = ({
  run,
  isLoading,
  isUnavailable,
  isError,
  onRetry,
  onBack,
  children,
}: ManualTestRunDetailStateViewProps) => {
  if (isLoading) return <ManualTestRunLoadingState />;
  if (!run && isUnavailable) return <ManualTestRunUnavailableState onBack={onBack} />;
  if (!run && isError) return <ManualTestRunErrorState onRetry={onRetry} onBack={onBack} />;
  if (!run) return null;
  return children(run);
};
