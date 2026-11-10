// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Grid, Heading, HStack, IconButton, Table, Text, VStack } from '@chakra-ui/react';
import { FiEdit, FiFolder, FiLink, FiX } from 'react-icons/fi';

import { ContextMenuButton, Link } from '@/components/ui';
import type { TestScenario } from '@/redux/apis/generatedApi';

import type { TestScenarioContextMenuHandler } from '../hooks/useTestScenarioContextMenu';
import type { ScenarioOperationReport } from '../utils';
import { SuitePicker } from './SuitePicker';

export interface TestScenarioDetailsViewProps {
  scenario: TestScenario;
  folderName?: string;
  backLabel?: string;
  backPath: string;
  projectId: string;
  onEdit: () => void;
  onContextMenu: TestScenarioContextMenuHandler;
  onAddSuiteComplete: (report: ScenarioOperationReport) => void;
  suiteError?: string;
  onRemoveSuite: (suiteId: string) => void;
  removingSuiteIds: string[];
  originKind?: 'scenarios' | 'suites';
}

const safeIssueUrl = (value: string | null) => {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === 'http:' || url.protocol === 'https:' ? value : null; } catch { return null; }
};

const issueLinkLabel = (value: string) => {
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  if (!host.includes('youtrack') && !host.startsWith('yt-') && !host.endsWith('.myjetbrains.com')) return value;
  const match = url.pathname.match(/^\/issue\/([A-Za-z][A-Za-z0-9_]*-\d+)(?:\/([^/]+))?\/?$/i);
  if (!match) return value;
  try {
    const title = match[2] ? decodeURIComponent(match[2]).replace(/[-_]+/g, ' ').trim() : '';
    return [match[1], title].filter(Boolean).join(' ');
  } catch { return match[1]; }
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
  backLabel,
  backPath,
  projectId,
  onEdit,
  onContextMenu,
  onAddSuiteComplete,
  suiteError,
  onRemoveSuite,
  removingSuiteIds,
  originKind = 'scenarios',
}: TestScenarioDetailsViewProps) => {
  const scenarioKey = scenario.scenarioKey?.trim();
  const steps = orderedSteps(scenario);
  const issueUrl = safeIssueUrl(scenario.relatedIssueUrl);

  const priorityLabel = scenario.priority ? ({ low: 'Low', medium: 'Medium', high: 'High' })[scenario.priority] : 'No priority';
  const createdBy = authorLabel(scenario.createdBy?.name);
  const updatedBy = authorLabel(scenario.updatedBy?.name);
  const dateLabel = (value?: string | null) => value ? new Date(value).toLocaleDateString('en-US') : 'Unknown';

  return (
    <VStack align="stretch" gap={0} mx={{ base: 3, md: 6 }} my={4}>
      <HStack justify="space-between" align="center" gap={4} flexWrap="wrap" pb={4}>
        <HStack as="nav" aria-label="Breadcrumb" gap={2} minW={0} flex="1" wrap="wrap" fontSize="md" color="text.secondary">
          <Button asChild variant="ghost" size="xs" fontSize="md" fontWeight="normal" color="text.secondary" _hover={{ bg: 'transparent', textDecoration: 'underline' }}>
            <Link
              href={`/test-management?${new URLSearchParams({ projectId, ...(originKind === 'suites' ? { tab: 'suites' } : {}) })}`}
              aria-label={backLabel && backLabel !== 'All scenarios' ? undefined : `Back to ${backLabel || folderName || 'Test Scenarios'}`}
            >
              {originKind === 'suites' ? 'Suites' : 'Scenarios'}
            </Link>
          </Button>
          {backLabel && backLabel !== 'All scenarios' && <><Text>›</Text><Button asChild variant="ghost" size="xs" fontSize="md" fontWeight="normal" color="text.secondary" _hover={{ bg: 'transparent', textDecoration: 'underline' }}><Link href={backPath} aria-label={`Back to ${backLabel}`}>{backLabel}</Link></Button></>}
          <Text>›</Text><Text color="text.primary">{scenarioKey || 'Scenario'}</Text>
        </HStack>
        <HStack gap={2} alignSelf="center">
          <Button colorPalette="blue" onClick={onEdit}><FiEdit />Edit</Button>
          <ContextMenuButton
            variant="outline" size="md" bg="bg.card" color="text.primary" borderColor="border.main" css={{ "& svg": { transform: "rotate(90deg)" } }}
            aria-label={`Actions for ${scenario.title}`}
            onClick={(event) => onContextMenu(event, scenario)}
          />
        </HStack>
      </HStack>

      <Grid templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 300px' }} gap={6} alignItems="start" p={{ base: 4, md: 6 }} bg="bg.card" borderRadius="xl" shadow="sm">
        <VStack data-testid="scenario-detail-main" align="stretch" minW={0} gap={6}>
          <VStack align="start" gap={2} minW={0} pl={{ base: 0, md: "48px" }}>
            <Heading size="xl" fontWeight="semibold" overflowWrap="anywhere">{scenario.title}</Heading>
            {scenario.details && <Text fontSize="sm" color="text.secondary" whiteSpace="pre-wrap" overflowWrap="anywhere">{scenario.details}</Text>}
          </VStack>
          <VStack align="stretch" gap={4} pl={{ base: 0, md: "48px" }}>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={{ base: 4, md: 0 }}>
              {([['Preconditions', scenario.preconditions], ['Test data', scenario.testData]] as const).map(([label, value]) => (
                <Box key={label} minW={0} pr={{ base: 0, md: 6 }}><Text fontSize="sm" fontWeight="semibold" mb={1}>{label}</Text><Text fontSize="sm" whiteSpace="pre-wrap" overflowWrap="anywhere">{value?.trim() ? value : 'No value'}</Text></Box>
              ))}
            </Grid>
          </VStack>

          <VStack align="stretch" gap={2}>
            {steps.length === 0 && <Heading size="sm">Steps</Heading>}
            {steps.length === 0 ? (
              <Text color="text.muted">No steps saved.</Text>
            ) : (
              <>
              <Box display={{ base: 'none', md: 'block' }}>
                <Table.Root size="sm" minW="100%" css={{ tableLayout: 'fixed' }}>
                  <Table.Header fontSize="xs" color="text.secondary"><Table.Row><Table.ColumnHeader w="48px" textAlign="center" px={0}>#</Table.ColumnHeader><Table.ColumnHeader px={0} pr={6} fontWeight="normal">Steps</Table.ColumnHeader><Table.ColumnHeader px={0} fontWeight="normal">Expected result</Table.ColumnHeader></Table.Row></Table.Header>
                  <Table.Body>{steps.map((step, index) => <Table.Row key={step.id}>
                    <Table.Cell textAlign="center" px={0} verticalAlign="top">{index + 1}</Table.Cell>
                    <Table.Cell px={0} pr={6} verticalAlign="top" whiteSpace="pre-wrap" overflowWrap="anywhere">{step.action}</Table.Cell>
                    <Table.Cell px={0} verticalAlign="top" whiteSpace="pre-wrap" overflowWrap="anywhere">{step.expectedResult?.trim() || 'No expected result'}</Table.Cell>
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
        <VStack data-testid="scenario-detail-sidebar" align="stretch" gap={6} minW={0} borderLeftWidth={{ base: 0, lg: '1px' }} borderColor="border.main" pl={{ base: 0, lg: 6 }}>
          <Box><Text fontSize="14px" mb={2}>Folder</Text><Link href={`/test-management?${new URLSearchParams({ projectId, folderId: scenario.folderId ?? 'unfiled' })}`} display="inline-flex" alignItems="center" gap={1.5} bg="bg.subtle" px={2} py={1} borderRadius="md" maxW="100%" overflowWrap="anywhere"><FiFolder aria-hidden="true" />{folderName || 'No folder'}</Link></Box>
          <Box><Text fontSize="14px" mb={2}>Priority</Text><Text as="span" bg={scenario.priority === 'high' ? 'status.attention.bg' : scenario.priority === 'medium' ? 'status.total.bg' : 'status.neutral.bg'} px={2} py={0.5} borderRadius="full" fontSize="xs">{priorityLabel}</Text></Box>
          <Box><Text fontSize="14px" mb={2}>Suites</Text>
            <HStack wrap="wrap" gap={2} align="start">
              {(scenario.suites ?? []).map((suite) => <HStack key={suite.id} bg="blue.subtle" color="blue.fg" borderRadius="full" pl={2} pr={1} py={0.5} gap={1}>
                <Link href={`/test-management?${new URLSearchParams({ projectId, tab: 'suites', suiteId: suite.id })}`} fontSize="sm">{suite.name}</Link><IconButton size="2xs" minW="auto" h="auto" p={0.5} variant="ghost" aria-label={`Remove ${suite.name} suite`} loading={removingSuiteIds.includes(suite.id)} onClick={() => onRemoveSuite(suite.id)}><FiX /></IconButton>
              </HStack>)}
            <SuitePicker compact projectId={projectId} selectedIds={[scenario.id]} onComplete={(report) => onAddSuiteComplete(report)} />
            {scenario.suites?.length === 0 && <Text fontSize="sm" color="text.secondary" mt={2}>No suites yet.</Text>}
            </HStack>
            {suiteError && <Text role="alert" fontSize="sm" color="fg.error" mt={2}>{suiteError}</Text>}
          </Box>
          <Box><Text fontSize="14px" mb={2}>Requirement or ticket</Text>
            {issueUrl ? <Link href={issueUrl} target="_blank" rel="noopener noreferrer" color="blue.500" fontSize="sm" display="flex" alignItems="center" gap={1} minW={0} maxW="100%" title={issueLinkLabel(issueUrl)}><Box as={FiLink} aria-hidden="true" boxSize="14px" flexShrink={0} /><Text as="span" minW={0} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{issueLinkLabel(issueUrl)}</Text></Link> : <Text color="text.secondary" overflowWrap="anywhere">{scenario.relatedIssueUrl || 'No value'}</Text>}
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
