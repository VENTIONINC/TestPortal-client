// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Grid, Heading, HStack, IconButton, Table, Text, VStack } from '@chakra-ui/react';
import { FiArrowLeft, FiEdit, FiFolder, FiLink, FiX } from 'react-icons/fi';

import { ContextMenuButton, Link } from '@/components/ui';
import type { TestScenario } from '@/redux/apis/generatedApi';

import type { TestScenarioContextMenuHandler } from '../hooks/useTestScenarioContextMenu';
import type { ScenarioOperationReport } from '../utils';
import { SuitePicker } from './SuitePicker';

export interface TestScenarioDetailsViewProps {
  scenario: TestScenario;
  folderName?: string;
  backPath: string;
  projectId: string;
  onEdit: () => void;
  onContextMenu: TestScenarioContextMenuHandler;
  onAddSuiteComplete: (report: ScenarioOperationReport) => void;
  suiteError?: string;
  onRemoveSuite: (suiteId: string) => void;
  removingSuiteIds: string[];
}

const safeIssueUrl = (value: string | null) => {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === 'http:' || url.protocol === 'https:' ? value : null; } catch { return null; }
};

const authorLabel = (name?: string | null) => {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!parts.length) return 'Unknown';
  return parts.length === 1 ? parts[0] : `${parts[0]} ${Array.from(parts[parts.length - 1])[0].toLocaleUpperCase()}.`;
};

const orderedSteps = (scenario: TestScenario) =>
  [...scenario.steps].sort((left, right) => left.position - right.position);

export const TestScenarioDetailsView = ({
  scenario,
  folderName,
  backPath,
  projectId,
  onEdit,
  onContextMenu,
  onAddSuiteComplete,
  suiteError,
  onRemoveSuite,
  removingSuiteIds,
}: TestScenarioDetailsViewProps) => {
  const scenarioKey = scenario.scenarioKey?.trim();
  const steps = orderedSteps(scenario);
  const issueUrl = safeIssueUrl(scenario.relatedIssueUrl);

  const priorityLabel = scenario.priority ? ({ low: 'Low', medium: 'Medium', high: 'High' })[scenario.priority] : 'No priority';
  const createdBy = authorLabel(scenario.createdBy?.name);
  const updatedBy = authorLabel(scenario.updatedBy?.name);
  const dateLabel = (value?: string | null) => value ? new Date(value).toLocaleDateString('en-US') : 'Unknown';

  return (
    <VStack align="stretch" gap={0} mx={{ base: 3, md: 6 }} my={4} p={{ base: 4, md: 6 }} bg="bg.card" borderRadius="xl" minH="calc(100vh - 130px)">
      <HStack justify="space-between" align="end" gap={4} flexWrap="wrap" pb={4} borderBottomWidth="1px" borderColor="border.main">
        <VStack align="start" gap={3} minW={0} flex="1">
          <Link
            href={backPath}
            aria-label={`Back to ${folderName || 'Test Scenarios'}`}
            title={`Back to ${folderName || 'Test Scenarios'}`}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            h="5"
            minW={0}
            p={0}
            textDecoration="none"
            fontSize="sm"
            gap={2}
            color="text.secondary"
            _hover={{ bg: 'bg.subtle' }}
          >
            <FiArrowLeft size={16} aria-hidden="true" style={{ width: 16, height: 16, flex: '0 0 16px' }} />
            <Text fontSize="sm">Back to {folderName || 'Test Scenarios'}</Text>
          </Link>
          <HStack gap={2} flexWrap="wrap">
            {scenarioKey && <Text bg="bg.section" px={2} py={1} borderRadius="sm" fontSize="sm">{scenarioKey}</Text>}
            <HStack fontSize="sm" color="text.secondary" gap={1}><FiFolder aria-hidden="true" /><Text>{folderName || 'No folder'}</Text></HStack>
            <Text bg={scenario.priority === 'high' ? 'status.attention.bg' : scenario.priority === 'medium' ? 'status.total.bg' : 'status.neutral.bg'} color="text.secondary" px={2} py={0.5} borderRadius="full" fontSize="xs">{priorityLabel}</Text>
          </HStack>
          <VStack align="start" gap={1}>
            <Heading size="xl" fontWeight="semibold">{scenario.title}</Heading>
            {scenario.details && <Text fontSize="sm" color="text.secondary">{scenario.details}</Text>}
          </VStack>
        </VStack>
        <HStack gap={2} alignSelf="center">
          <Button colorPalette="blue" onClick={onEdit}><FiEdit />Edit</Button>
          <ContextMenuButton
            variant="outline" bg="transparent" color="text.primary" borderColor="border.main"
            aria-label={`Actions for ${scenario.title}`}
            onClick={(event) => onContextMenu(event, scenario)}
          />
        </HStack>
      </HStack>

      <Grid templateColumns={{ base: 'minmax(0, 1fr)', xl: 'minmax(0, 1fr) 220px' }} gap={{ base: 6, xl: 6 }} alignItems="start" pt={5}>
        <VStack align="stretch" minW={0} gap={6}>
          <VStack align="stretch" gap={4}>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={{ base: 4, md: 6 }}>
              {([['Preconditions', scenario.preconditions], ['Test data', scenario.testData]] as const).map(([label, value]) => (
                <Box key={label} minW={0}><Text fontSize="sm" fontWeight="semibold" mb={1}>{label}</Text><Text fontSize="sm" whiteSpace="pre-wrap" overflowWrap="anywhere">{value?.trim() ? value : 'No value'}</Text></Box>
              ))}
            </Grid>
          </VStack>

          <VStack align="stretch" gap={2}>
            <Heading id="scenario-steps-heading" size="sm">Steps <Text as="span" fontSize="sm" color="text.secondary">{steps.length}</Text></Heading>
            {steps.length === 0 ? (
              <Text color="text.muted">No steps saved.</Text>
            ) : (
              <>
              <Box display={{ base: 'none', md: 'block' }} borderWidth="1px" borderColor="border.main" borderRadius="lg" overflow="hidden">
                <Table.Root size="sm" minW="100%" css={{ tableLayout: 'fixed' }}>
                  <Table.Header fontSize="xs" color="text.secondary"><Table.Row bg="bg.subtle"><Table.ColumnHeader w="48px">#</Table.ColumnHeader><Table.ColumnHeader>Action</Table.ColumnHeader><Table.ColumnHeader>Expected result</Table.ColumnHeader></Table.Row></Table.Header>
                  <Table.Body>{steps.map((step, index) => <Table.Row key={step.id}>
                    <Table.Cell>{index + 1}</Table.Cell>
                    <Table.Cell whiteSpace="pre-wrap" overflowWrap="anywhere">{step.action}</Table.Cell>
                    <Table.Cell whiteSpace="pre-wrap" overflowWrap="anywhere">{step.expectedResult?.trim() || 'No expected result'}</Table.Cell>
                  </Table.Row>)}</Table.Body>
                </Table.Root>
              </Box>
              <VStack data-testid="scenario-mobile-steps" as="ol" display={{ base: 'flex', md: 'none' }} align="stretch" gap={0} m={0} p={0} borderWidth="1px" borderColor="border.main" borderRadius="md">
                {steps.map((step, index) => <Box as="li" key={step.id} listStyle="none" p={3} borderBottomWidth={index < steps.length - 1 ? '1px' : undefined} borderColor="border.main">
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>Step {index + 1}</Text>
                  <Text fontSize="sm" fontWeight="medium">Action</Text>
                  <Text whiteSpace="pre-wrap" overflowWrap="anywhere" mb={2}>{step.action}</Text>
                  <Text fontSize="sm" fontWeight="medium">Expected result</Text>
                  <Text whiteSpace="pre-wrap" overflowWrap="anywhere">{step.expectedResult?.trim() || 'No expected result'}</Text>
                </Box>)}
              </VStack>
              </>
            )}
          </VStack>
        </VStack>
        <VStack align="stretch" gap={6} minW={0}>
          <Box><Text fontSize="14px" mb={2}>Suites</Text>
            <HStack wrap="wrap" gap={2}>
              {(scenario.suites ?? []).map((suite) => <HStack key={suite.id} bg="blue.subtle" color="blue.fg" borderRadius="full" pl={2} pr={1} py={0.5} gap={1}>
                <Text fontSize="sm">{suite.name}</Text><IconButton size="2xs" minW="auto" h="auto" p={0.5} variant="ghost" aria-label={`Remove ${suite.name} suite`} loading={removingSuiteIds.includes(suite.id)} onClick={() => onRemoveSuite(suite.id)}><FiX /></IconButton>
              </HStack>)}
              <SuitePicker compact projectId={projectId} selectedIds={[scenario.id]} onComplete={(report) => onAddSuiteComplete(report)} />
            </HStack>
            {scenario.suites?.length === 0 && <Text fontSize="sm" color="text.secondary" mt={2}>No suites yet.</Text>}
            {suiteError && <Text role="alert" fontSize="sm" color="fg.error" mt={2}>{suiteError}</Text>}
          </Box>
          <Box><Text fontSize="14px" mb={2}>Requirement or ticket</Text>
            {issueUrl ? <Link href={issueUrl} target="_blank" rel="noopener noreferrer" color="blue.500" fontSize="sm" overflowWrap="anywhere" display="inline-flex" alignItems="start" gap={1}><FiLink aria-hidden="true" />{scenario.relatedIssueUrl}</Link> : <Text color="text.secondary" overflowWrap="anywhere">{scenario.relatedIssueUrl || 'No value'}</Text>}
          </Box>
          <Box><Text fontSize="14px" mb={2}>History</Text>
            <Text fontSize="sm" color="text.secondary">Updated {dateLabel(scenario.updatedAt)} by {updatedBy}</Text>
            <Text fontSize="sm" color="text.secondary">Created {dateLabel(scenario.createdAt)} by {createdBy}</Text>
          </Box>
        </VStack>
      </Grid>
    </VStack>
  );
};
