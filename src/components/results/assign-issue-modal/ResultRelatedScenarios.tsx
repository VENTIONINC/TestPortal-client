// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState, type ReactNode } from 'react';
import { Box, Button, Flex, Heading, Spinner, Stack, Text, VStack } from '@chakra-ui/react';

import { MarkdownPreview } from '@/components/ui/components/MarkdownPreview';
import {
  useLazyGetResultDetailWithRelatedScenariosQuery,
  type RelatedTestScenarioSummary,
} from '@/redux/apis/generatedResultDetailApi';

interface ResultRelatedScenariosProps {
  resultId: string;
  projectId: string;
  isActive: boolean;
}

const getErrorStatus = (error: unknown) => {
  if (error && typeof error === 'object' && 'status' in error) return error.status;
  return undefined;
};

export const ResultRelatedScenarios = ({ resultId, projectId, isActive }: ResultRelatedScenariosProps) => {
  const scopeKey = `${projectId}:${resultId}`;
  const [selected, setSelected] = useState<{ scopeKey: string; scenarioId?: string }>({ scopeKey });
  const [fetchResultDetail, query] = useLazyGetResultDetailWithRelatedScenariosQuery();
  const isCurrentScope = query.originalArgs?.resultId === resultId && query.originalArgs.projectId === projectId;
  const result = isCurrentScope && query.currentData?.id === resultId ? query.currentData : undefined;
  const selectedScenarioId = selected.scopeKey === scopeKey ? selected.scenarioId : undefined;
  const selectedScenario = result?.relatedTestScenarios.find((scenario) => scenario.id === selectedScenarioId);
  const error = isCurrentScope ? query.error : undefined;
  const errorStatus = getErrorStatus(error);

  useEffect(() => {
    setSelected({ scopeKey });
  }, [scopeKey]);

  useEffect(() => {
    if (isActive) void fetchResultDetail({ resultId, projectId });
  }, [fetchResultDetail, isActive, projectId, resultId]);

  if (!isActive) return null;

  if (errorStatus === 404) {
    return <StateMessage message="This Result is unavailable in the selected project." />;
  }

  if (error) {
    return (
      <StateMessage
        message="Couldn’t load related Test Scenarios."
        isError
        action={(
          <Button size="sm" variant="outline" loading={query.isFetching} onClick={() => void fetchResultDetail({ resultId, projectId })}>
            Retry
          </Button>
        )}
      />
    );
  }

  if (!result && (!isCurrentScope || query.isLoading || query.isFetching || query.isUninitialized)) {
    return (
      <VStack role="status" aria-live="polite" h="full" justify="center" gap={3} p={6}>
        <Spinner color="blue.500" />
        <Text color="text.secondary">Loading related Test Scenarios…</Text>
      </VStack>
    );
  }

  if (!result) {
    return <StateMessage message="This Result is unavailable in the selected project." />;
  }

  if (!Array.isArray(result.relatedTestScenarios)) {
    return (
      <StateMessage
        message="Related Test Scenarios are unavailable for this Result."
        isError
        action={(
          <Button size="sm" variant="outline" loading={query.isFetching} onClick={() => void fetchResultDetail({ resultId, projectId })}>
            Retry
          </Button>
        )}
      />
    );
  }

  if (selectedScenario) {
    return <ScenarioContent scenario={selectedScenario} onReturn={() => setSelected({ scopeKey })} />;
  }

  if (result.relatedTestScenarios.length === 0) {
    return <StateMessage message="No Test Scenarios are linked to this Result’s Spec." />;
  }

  return (
    <Stack h="full" minH={0} gap={4} p={{ base: 4, md: 6 }} overflowY="auto">
      <Heading as="h2" size="md">Related Test Scenarios</Heading>
      <VStack align="stretch" gap={2}>
        {result.relatedTestScenarios.map((scenario) => (
          <Button
            key={scenario.id}
            variant="outline"
            h="auto"
            minH="44px"
            justifyContent="flex-start"
            textAlign="start"
            whiteSpace="normal"
            onClick={() => setSelected({ scopeKey, scenarioId: scenario.id })}
          >
            <VStack align="start" gap={0}>
              <Text>{scenario.scenarioKey ? `${scenario.scenarioKey} · ${scenario.title}` : `N/A · ${scenario.title}`}</Text>
            </VStack>
          </Button>
        ))}
      </VStack>
    </Stack>
  );
};

const ScenarioContent = ({
  scenario,
  onReturn,
}: {
  scenario: RelatedTestScenarioSummary;
  onReturn: () => void;
}) => (
  <Flex h="full" minH={0} direction="column" gap={3} p={{ base: 4, md: 6 }}>
    <Button alignSelf="flex-start" size="sm" variant="ghost" onClick={onReturn}>
      Back to Test Scenarios
    </Button>
    <Box flex="1" minH={0} overflowY="auto">
      <Stack gap={4}>
        <Heading as="h2" size="md">{scenario.title}</Heading>
        <Text color="text.secondary">Scenario key: {scenario.scenarioKey ?? 'N/A'}</Text>
        {scenario.details?.trim() && <Text whiteSpace="pre-wrap">{scenario.details}</Text>}
        <MarkdownPreview content={scenario.contentMd} />
      </Stack>
    </Box>
  </Flex>
);

const StateMessage = ({
  message,
  isError = false,
  action,
}: {
  message: string;
  isError?: boolean;
  action?: ReactNode;
}) => (
  <Flex h="full" minH={0} direction="column" align="center" justify="center" gap={3} p={6}>
    <Text role={isError ? 'alert' : 'status'} textAlign="center" color={isError ? 'red.600' : 'text.secondary'}>
      {message}
    </Text>
    {action}
  </Flex>
);
