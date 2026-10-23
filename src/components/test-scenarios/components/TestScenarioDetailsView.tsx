// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Grid, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';

import { ContextMenuButton, Link, Wrap } from '@/components/ui';
import type { TestScenario } from '@/redux/apis/generatedApi';
import { PATHS } from '@/types/paths';
import { getManualTestRunScenarioHistoryPath } from '@/components/manual-test-runs/utils/paths';

import type { TestScenarioContextMenuHandler } from '../hooks/useTestScenarioContextMenu';

export interface TestScenarioDetailsViewProps {
  scenario: TestScenario;
  onContextMenu: TestScenarioContextMenuHandler;
  onStartManualRun?: (trigger: HTMLButtonElement) => void;
  isStartingManualRun?: boolean;
}

const safeIssueUrl = (value: string | null) => {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === 'http:' || url.protocol === 'https:' ? value : null; } catch { return null; }
};

const orderedSteps = (scenario: TestScenario) =>
  [...scenario.steps].sort((left, right) => left.position - right.position);

export const TestScenarioDetailsView = ({
  scenario,
  onContextMenu,
  onStartManualRun,
  isStartingManualRun = false,
}: TestScenarioDetailsViewProps) => {
  const scenarioKey = scenario.scenarioKey?.trim();
  const steps = orderedSteps(scenario);
  const issueUrl = safeIssueUrl(scenario.relatedIssueUrl);

  return (
    <VStack align="stretch" gap={6} mx={{ base: 4, md: 6 }} my={4}>
      <HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
        <HStack align="center" gap={2}>
          <Link
            href={PATHS.TEST_SCENARIOS}
            aria-label="Return to Test Scenarios"
            title="Return to Test Scenarios"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            p={2}
            borderRadius="md"
            color="text.active"
            _hover={{ bg: 'bg.subtle' }}
          >
            <FiArrowLeft size={18} aria-hidden="true" />
          </Link>
          <VStack align="start" gap={0}>
            <Heading size="lg">{scenario.title}</Heading>
            {scenarioKey && <Text color="text.secondary">Scenario key: {scenarioKey}</Text>}
          </VStack>
        </HStack>
        <HStack gap={2}>
          {onStartManualRun && (
            <Button
              type="button"
              onClick={(event) => onStartManualRun(event.currentTarget)}
              loading={isStartingManualRun}
              disabled={isStartingManualRun}
            >
              Start manual run
            </Button>
          )}
          <Link href={getManualTestRunScenarioHistoryPath(scenario.id)}>Run history</Link>
          <ContextMenuButton
            aria-label={`Actions for ${scenario.title}`}
            onClick={(event) => onContextMenu(event, scenario)}
          />
        </HStack>
      </HStack>

      <Wrap w="100%" p={{ base: 4, md: 6 }}>
        <VStack align="stretch" w="100%" gap={6}>
          <VStack align="stretch" gap={4}>
            <Box
              as="li"
              key={'scenario-fields'}
              listStyle="none"
              py={3}
              borderColor="border.main"
              _last={{ borderBottomWidth: '1px' }}
            >
              <Heading size="md">Scenario fields</Heading>
            </Box>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={{ base: 4, md: 6 }}>
              {([['Details', scenario.details], ['Priority', scenario.priority ? ({ low: 'Low', medium: 'Medium', high: 'High' })[scenario.priority] : null]] as const).map(([label, value]) => (
                <Box key={label} minW={0}><Text fontWeight="semibold" mb={1}>{label}</Text><Text whiteSpace="pre-wrap" overflowWrap="anywhere" color="text.secondary">{value ?? 'No value'}</Text></Box>
              ))}
              <Box minW={0}>
                <Text fontWeight="semibold" mb={1}>Related issue URL</Text>
                {issueUrl ? <Link href={issueUrl} target="_blank" rel="noopener noreferrer" overflowWrap="anywhere">{scenario.relatedIssueUrl}</Link> : <Text color="text.secondary" overflowWrap="anywhere">{scenario.relatedIssueUrl ?? 'No value'}</Text>}
              </Box>
            </Grid>
          </VStack>
          <VStack align="stretch" gap={4} pt={5}>
            <Heading size="md" pb={3} borderBottomWidth="1px" borderColor="border.main">
              Test setup
            </Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={{ base: 4, md: 6 }}>
              {([['Preconditions', scenario.preconditions], ['Test data', scenario.testData]] as const).map(([label, value]) => (
                <Box key={label} minW={0}><Text fontWeight="semibold" mb={1}>{label}</Text><Text whiteSpace="pre-wrap" overflowWrap="anywhere" color="text.secondary">{value ?? 'No value'}</Text></Box>
              ))}
            </Grid>
          </VStack>

          <VStack align="stretch" gap={3} pt={5}>
            <Heading id="scenario-steps-heading" size="md">
              Scenario steps{steps.length > 0 ? ` (${steps.length})` : ''}
            </Heading>
            {steps.length === 0 ? (
              <Text color="text.muted">No steps saved.</Text>
            ) : (
              <VStack as="ol" aria-labelledby="scenario-steps-heading" align="stretch" gap={0} m={0} p={0}>
                {steps.map((step, index) => (
                  <Box
                    as="li"
                    key={step.id}
                    listStyle="none"
                    py={5}
                    borderTopWidth="1px"
                    borderColor="border.main"
                    _last={{ borderBottomWidth: '0' }}
                  >
                    <Box position="relative">
                      <Box
                        aria-hidden="true"
                        position="absolute"
                        left={0}
                        top={5.5}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        w="34px"
                        h="34px"
                        borderRadius="full"
                        bg="bg.active"
                        borderWidth="1px"
                        borderColor="border.main"
                        color="text.active"
                        fontWeight="semibold"
                        fontSize="sm"
                      >
                        {index + 1}
                      </Box>
                      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={{ base: 3, md: 6 }}>
                        <Box minW={0} maxW="68ch" pl={12}>
                          <Text fontWeight="semibold" mb={1}>
                            Action
                          </Text>
                          <Text whiteSpace="pre-wrap" overflowWrap="anywhere" color="text.secondary" lineHeight="1.65">
                            {step.action}
                          </Text>
                        </Box>
                        <Box minW={0} maxW="68ch" pl={{ base: 12, md: 0 }}>
                          <Text fontWeight="semibold" mb={1}>
                            Expected result
                          </Text>
                          <Text whiteSpace="pre-wrap" overflowWrap="anywhere" color="text.secondary" lineHeight="1.65">
                            {step.expectedResult ?? 'No expected result'}
                          </Text>
                        </Box>
                      </Grid>
                    </Box>
                  </Box>
                ))}
              </VStack>
            )}
          </VStack>
        </VStack>
      </Wrap>
    </VStack>
  );
};
