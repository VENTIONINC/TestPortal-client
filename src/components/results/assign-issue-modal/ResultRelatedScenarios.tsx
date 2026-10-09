// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { Box, Button, Flex, Heading, HStack, Input, Spinner, Stack, Text, VStack } from '@chakra-ui/react';

import { MarkdownPreview } from '@/components/ui/components/MarkdownPreview';
import type { RelatedTestScenarioSummary } from '@/redux/apis/resultDetailApi';
import type { TestScenarioSummary } from '@/redux/apis/scenarioManagementApi';

import { scenarioLabel, useResultScenarioManagement, type ScenarioManagementFeedback } from './useResultScenarioManagement';

export const ResultRelatedScenarios = ({ resultId, projectId, isActive }: { resultId: string; projectId: string; isActive: boolean }) => {
  const management = useResultScenarioManagement({ resultId, projectId, isActive });
  const {
    mode, result, error, errorStatus, resultQuery, selectedScenario, confirmScenario,
    searchInput, appliedSearch, page, selectedCandidateId, feedback, isBusy, pickerQuery, candidates,
    linkedIds, totalPages, linkButtonRef, isCurrentScope, coverageNeedsRefresh,
  } = management;

  if (!isActive) return null;

  if (errorStatus === 404) {
    return <StateMessage message="This Result is unavailable in the selected project." />;
  }

  if (error && !result) {
    return (
      <StateMessage
        message="Couldn’t load related Test Scenarios."
        isError
        action={
          <Button size="sm" variant="outline" loading={resultQuery.isFetching} onClick={() => void management.fetchResultDetail()}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!result && (resultQuery.isLoading || resultQuery.isFetching || resultQuery.isUninitialized || !isCurrentScope)) {
    return (
      <VStack role="status" aria-live="polite" h="full" justify="center" gap={3} p={6}>
        <Spinner color="blue.500" />
        <Text color="text.secondary">Loading related Test Scenarios…</Text>
      </VStack>
    );
  }

  if (!result || !Array.isArray(result.relatedTestScenarios) || !result.spec?.id) {
    return (
      <StateMessage
        message="Related Test Scenarios are unavailable for this Result."
        isError
        action={<Button size="sm" variant="outline" loading={resultQuery.isFetching} onClick={() => void management.fetchResultDetail()}>Retry</Button>}
      />
    );
  }

  if (mode === 'inspect' && selectedScenario) {
    return <ScenarioContent scenario={selectedScenario} onReturn={management.returnToList} />;
  }

  if (mode === 'unlink' && confirmScenario) {
    return (
      <Stack h="full" minH={0} gap={4} p={{ base: 4, md: 6 }} overflowY="auto">
        <Button alignSelf="flex-start" size="sm" variant="ghost" onClick={management.cancelUnlink}>Back to Test Scenarios</Button>
        <Heading as="h2" size="md">Unlink Test Scenario?</Heading>
        <Text>{scenarioLabel(confirmScenario)} will be removed from coverage for all past and future Results of this Spec.</Text>
        <Text color="text.secondary">The scenario, Spec, execution history and issues will be preserved.</Text>
        {feedback && <FeedbackMessage feedback={feedback} onRefresh={management.retryRefresh} />}
        <HStack>
          <Button variant="outline" onClick={management.cancelUnlink} disabled={isBusy}>Cancel</Button>
          <Button colorPalette="red" onClick={() => void management.submitUnlink()} loading={isBusy} disabled={coverageNeedsRefresh}>Unlink</Button>
        </HStack>
      </Stack>
    );
  }

  if (mode === 'picker') {
    return (
      <Stack h="full" minH={0} gap={4} p={{ base: 4, md: 6 }} overflowY="auto">
        <Button alignSelf="flex-start" size="sm" variant="ghost" onClick={management.cancelPicker}>Back to Test Scenarios</Button>
        <Heading as="h2" size="md">Link Test Scenario</Heading>
        <Text color="text.secondary">Links apply to all past and future Results of this Spec and show its current coverage. Search by title or scenario key; details are shown but are not searched.</Text>
        <form onSubmit={management.applySearch}>
          <HStack align="end">
            <Box flex="1">
              <label htmlFor="scenario-catalog-search" style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Search title or scenario key</label>
              <Input id="scenario-catalog-search" value={searchInput} onChange={(event) => management.setSearchInput(event.target.value)} />
            </Box>
            <Button type="submit" variant="outline">Search</Button>
          </HStack>
        </form>
        {feedback && <FeedbackMessage feedback={feedback} onRefresh={management.retryRefresh} />}
        {pickerQuery.isLoading || (!pickerQuery.currentData && pickerQuery.isFetching) ? (
          <VStack role="status" aria-live="polite" p={6}><Spinner /><Text>Loading Test Scenarios…</Text></VStack>
        ) : pickerQuery.isError ? (
          <StateMessage message="Couldn’t load Test Scenarios." isError action={<Button size="sm" variant="outline" loading={pickerQuery.isFetching} onClick={() => void pickerQuery.refetch()}>Retry</Button>} />
        ) : pickerQuery.currentData && pickerQuery.currentData.total === 0 ? (
          <StateMessage message={appliedSearch ? 'No Test Scenarios match this search.' : 'This project has no Test Scenarios yet.'} />
        ) : pickerQuery.currentData && candidates.length === 0 ? (
          <StateMessage message="There are no Test Scenarios on this page." action={<Button size="sm" variant="outline" onClick={() => management.setPage(1)}>Return to page 1</Button>} />
        ) : (
          <>
            <VStack align="stretch" gap={2}>
              {candidates.map((scenario) => (
                <CandidateRow
                  key={scenario.id}
                  scenario={scenario}
                  isLinked={linkedIds.has(scenario.id)}
                  isSelected={selectedCandidateId === scenario.id}
                  onSelect={() => management.selectCandidate(scenario.id)}
                />
              ))}
            </VStack>
            <HStack justify="space-between">
              <Text fontSize="sm" color="text.secondary">Page {pickerQuery.currentData?.page ?? page} of {Math.max(totalPages, 1)} · {pickerQuery.currentData?.total ?? 0} scenarios</Text>
              <HStack>
                <Button size="sm" variant="outline" disabled={page <= 1 || pickerQuery.isFetching} onClick={() => management.setPage((current) => current - 1)}>Previous</Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages || pickerQuery.isFetching} onClick={() => management.setPage((current) => current + 1)}>Next</Button>
              </HStack>
            </HStack>
            <HStack>
              <Button variant="outline" onClick={management.cancelPicker}>Cancel</Button>
              <Button onClick={() => void management.submitLink()} disabled={!selectedCandidateId || linkedIds.has(selectedCandidateId) || coverageNeedsRefresh} loading={isBusy}>Link selected scenario</Button>
            </HStack>
          </>
        )}
      </Stack>
    );
  }

  return (
    <Stack h="full" minH={0} gap={4} p={{ base: 4, md: 6 }} overflowY="auto">
      <Flex justify="space-between" align="start" gap={3}>
        <Box>
          <Heading as="h2" size="md">Related Test Scenarios</Heading>
          <Text mt={1} color="text.secondary">Coverage applies to all past and future Results of this Spec.</Text>
        </Box>
        <Button ref={linkButtonRef} size="sm" onClick={management.enterPicker}>Link Test Scenario</Button>
      </Flex>
      {feedback && <FeedbackMessage feedback={feedback} onRefresh={management.retryRefresh} />}
      {error && <FeedbackMessage feedback={{ kind: 'error', message: 'Coverage refresh failed. The list may be out of date.', canRefresh: true }} onRefresh={management.retryRefresh} />}
      {result.relatedTestScenarios.length === 0 ? (
        <Text role="status" color="text.secondary">No Test Scenarios are linked to this Result’s Spec.</Text>
      ) : (
        <VStack align="stretch" gap={2}>
          {result.relatedTestScenarios.map((scenario) => (
            <HStack key={scenario.id} align="stretch" gap={2}>
              <Button flex="1" variant="outline" h="auto" minH="44px" justifyContent="flex-start" textAlign="start" whiteSpace="normal" onClick={() => management.inspectScenario(scenario.id)}>
                {scenarioLabel(scenario)}
              </Button>
              <Button
                ref={(element) => management.registerUnlinkButton(scenario.id, element)}
                aria-label={`Unlink ${scenarioLabel(scenario)}`}
                size="sm"
                variant="outline"
                onClick={() => management.openUnlinkConfirmation(scenario)}
              >Unlink</Button>
            </HStack>
          ))}
        </VStack>
      )}
    </Stack>
  );
};

const CandidateRow = ({
  scenario,
  isLinked,
  isSelected,
  onSelect,
}: {
  scenario: TestScenarioSummary;
  isLinked: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <Button
    variant={isSelected ? 'subtle' : 'outline'}
    h="auto"
    minH="56px"
    justifyContent="flex-start"
    textAlign="start"
    whiteSpace="normal"
    disabled={isLinked}
    aria-pressed={isSelected}
    aria-label={`${scenario.scenarioKey ?? 'N/A'} · ${scenario.title}${isLinked ? ', Already linked' : ''}`}
    onClick={onSelect}
  >
    <VStack align="start" gap={0}>
      <Text>{scenario.scenarioKey ?? 'N/A'} · {scenario.title}{isLinked ? ' · Already linked' : ''}</Text>
      {scenario.details?.trim() && <Text fontSize="sm" color="text.secondary" fontWeight="normal">{scenario.details}</Text>}
    </VStack>
  </Button>
);

const ScenarioContent = ({ scenario, onReturn }: { scenario: RelatedTestScenarioSummary; onReturn: () => void }) => (
  <Flex h="full" minH={0} direction="column" gap={3} p={{ base: 4, md: 6 }}>
    <Button alignSelf="flex-start" size="sm" variant="ghost" onClick={onReturn}>Back to Test Scenarios</Button>
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

const FeedbackMessage = ({ feedback, onRefresh }: { feedback: ScenarioManagementFeedback; onRefresh: () => void }) => (
  <VStack align="stretch" role={feedback.kind === 'error' ? 'alert' : 'status'} p={3} borderWidth="1px" borderColor={feedback.kind === 'error' ? 'red.500' : 'green.500'} rounded="md">
    <Text>{feedback.message}</Text>
    {feedback.canRefresh && <Button alignSelf="start" size="sm" variant="outline" onClick={onRefresh}>Refresh coverage</Button>}
  </VStack>
);

const StateMessage = ({ message, isError = false, action }: { message: string; isError?: boolean; action?: ReactNode }) => (
  <Flex h="full" minH={0} direction="column" align="center" justify="center" gap={3} p={6}>
    <Text role={isError ? 'alert' : 'status'} textAlign="center" color={isError ? 'red.600' : 'text.secondary'}>{message}</Text>
    {action}
  </Flex>
);
