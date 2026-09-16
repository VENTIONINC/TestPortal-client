// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { Alert, Button, Text, VStack } from '@chakra-ui/react';

import type { TestScenario } from '@/redux/apis/generatedApi';

export const TestScenarioLoadingState = () => (
  <VStack align="center" gap={3} minH="300px" justify="center">
    <Text color="text.secondary">Loading Test Scenario...</Text>
  </VStack>
);

export const TestScenarioUnavailableState = ({ onBack }: { onBack: () => void }) => (
  <VStack align="center" gap={4} minH="300px" justify="center" px={4}>
    <Text color="text.main" fontSize="lg">
      Test Scenario unavailable
    </Text>
    <Text color="text.secondary">This Test Scenario is not available in the selected project.</Text>
    <Button variant="outline" onClick={onBack}>
      Return to Test Scenarios
    </Button>
  </VStack>
);

export const TestScenarioErrorState = ({ onRetry, onBack }: { onRetry: () => void; onBack: () => void }) => (
  <VStack align="stretch" gap={4} minH="300px" justify="center" px={4}>
    <Alert.Root status="error" role="alert">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>Failed to load Test Scenario</Alert.Title>
        <Alert.Description>Please try again in a moment.</Alert.Description>
      </Alert.Content>
    </Alert.Root>
    <VStack gap={2}>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
      <Button variant="ghost" onClick={onBack}>
        Return to Test Scenarios
      </Button>
    </VStack>
  </VStack>
);

export interface TestScenarioDetailStateViewProps {
  scenario?: TestScenario;
  isLoading: boolean;
  isUnavailable: boolean;
  isError: boolean;
  onRetry: () => void;
  onBack: () => void;
  children: (scenario: TestScenario) => ReactNode;
}

export const TestScenarioDetailStateView = ({
  scenario,
  isLoading,
  isUnavailable,
  isError,
  onRetry,
  onBack,
  children,
}: TestScenarioDetailStateViewProps) => {
  if (isLoading) return <TestScenarioLoadingState />;
  if (!scenario && isUnavailable) return <TestScenarioUnavailableState onBack={onBack} />;
  if (!scenario && isError) return <TestScenarioErrorState onRetry={onRetry} onBack={onBack} />;
  if (!scenario) return null;

  return children(scenario);
};
