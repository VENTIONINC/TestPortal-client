// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { LuFolder, LuLink } from 'react-icons/lu';
import { Link } from 'react-router';

import { TagChips } from '@/components/test-scenarios/tags';
import type { ActiveUserDirectoryEntry, ManualTestRunScenarioRead } from '@/redux/apis/generatedApi';
import { PATHS } from '@/types/paths';

import { AssigneePicker, shortName } from '../AssigneePicker';
import { resultLabels } from '../manualRunResults';
import { resultColors } from './resultColors';

const ticketLabel = (value: string) => {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (!host.includes('youtrack') && !host.startsWith('yt-') && !host.endsWith('.myjetbrains.com')) return value;
    const match = url.pathname.match(/^\/issue\/([A-Za-z][A-Za-z0-9_]*-\d+)(?:\/([^/]+))?\/?$/i);
    if (!match) return value;
    const title = match[2] ? decodeURIComponent(match[2]).replace(/[-_]+/g, ' ').trim() : '';
    return [match[1], title].filter(Boolean).join(' ');
  } catch {
    return value;
  }
};

interface ManualRunScenarioSidebarProps {
  scenario: ManualTestRunScenarioRead;
  users: ActiveUserDirectoryEntry[];
  assigneeDisabled: boolean;
  sourceStatus: 'loading' | 'unavailable' | 'error' | 'available';
  onChangeAssignee: (id: string | null) => void;
}

export function ManualRunScenarioSidebar({
  scenario,
  users,
  assigneeDisabled,
  sourceStatus,
  onChangeAssignee,
}: ManualRunScenarioSidebarProps) {
  return (
    <VStack
      align="stretch"
      gap={5}
      borderLeftWidth={{ base: 0, lg: '1px' }}
      borderColor="border"
      pl={{ base: 0, lg: 6 }}
      fontSize="sm"
    >
      <Box>
        <Text fontSize="xs" color="fg.muted" mb={1}>
          Assignee
        </Text>
        <AssigneePicker
          triggerHeight="40px"
          scenario={scenario}
          users={users}
          disabled={assigneeDisabled}
          onOpen={() => {}}
          onChange={onChangeAssignee}
        />
      </Box>
      <Box>
        <Text fontSize="xs" color="fg.muted" mb={1}>
          Folder
        </Text>
        <HStack display="inline-flex" bg="bg.subtle" px={2} py={1} borderRadius="md" gap={1.5}>
          <LuFolder aria-hidden="true" />
          <Text>{scenario.folderPath || 'No folder'}</Text>
        </HStack>
      </Box>
      <Box>
        <Text fontSize="xs" color="fg.muted" mb={1}>
          Priority
        </Text>
        <Text
          as="span"
          textTransform="capitalize"
          bg={
            scenario.priority === 'high'
              ? 'status.attention.bg'
              : scenario.priority === 'medium'
                ? 'status.total.bg'
                : 'status.neutral.bg'
          }
          color={scenario.priority === 'high' ? 'orange.fg' : scenario.priority === 'medium' ? 'blue.fg' : 'fg.muted'}
          px={2}
          py={0.5}
          borderRadius="full"
          fontSize="xs"
        >
          {scenario.priority}
        </Text>
      </Box>
      <Box>
        <Text fontSize="xs" color="fg.muted" mb={1}>Tags</Text>
        <TagChips tags={scenario.tags ?? []} emptyLabel="No tags" />
      </Box>
      <Box>
        <Text fontSize="xs" color="fg.muted" mb={1}>
          Requirement or ticket
        </Text>
        {scenario.requirementContext.length ? (
          scenario.requirementContext.map((item, i) => (
            <Box key={`${item.reference}-${i}`} minW={0}>
              {item.url && /^https?:\/\//i.test(item.url) ? (
                <HStack asChild color="blue.500" gap={1} minW={0} maxW="100%">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    title={item.reference === item.url ? ticketLabel(item.url) : `${item.reference} ${item.title}`}
                  >
                    <LuLink aria-hidden="true" style={{ flexShrink: 0 }} />
                    <Text as="span" minW={0} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {item.reference === item.url ? ticketLabel(item.url) : `${item.reference} ${item.title}`}
                    </Text>
                  </a>
                </HStack>
              ) : (
                <Text overflowWrap="anywhere">
                  {item.reference} {item.title}
                </Text>
              )}
            </Box>
          ))
        ) : (
          <Text>—</Text>
        )}
      </Box>
      <Box>
        <Text fontSize="xs" color="fg.muted" mb={1}>
          Scenario
        </Text>
        <Text color="fg.muted">Steps as saved when the scenario was added to the run.</Text>
        {(sourceStatus === 'error' || sourceStatus === 'unavailable') && (
          <Text color="fg.muted" mt={1}>
            {sourceStatus === 'unavailable'
              ? 'The source scenario is no longer available.'
              : 'Could not check the source scenario. Try again later.'}
          </Text>
        )}
        {sourceStatus === 'available' && (
          <Text color="blue.500" mt={1}>
            <Link
              to={PATHS.TEST_SCENARIO_DETAILS.replace(':scenarioId', encodeURIComponent(scenario.sourceScenarioId))}
            >
              Open in Scenarios
            </Link>
          </Text>
        )}
      </Box>
      <Box>
        <Text fontSize="xs" color="fg.muted" mb={1}>
          Results in this run
        </Text>
        {scenario.resultHistory.length === 0 ? (
          <Text color="fg.muted">No results yet</Text>
        ) : (
          <Box maxH="240px" overflowY="auto" tabIndex={0} role="region" aria-label="Results in this run history">
            {scenario.resultHistory.map((entry) => (
              <HStack key={entry.id} mb={2} gap={1} align="start">
                <Text
                  color={entry.result === 'untested' ? 'gray.200' : `${resultColors[entry.result]}.500`}
                  aria-hidden="true"
                >
                  ●
                </Text>
                <Box minW={0}>
                  <Text>
                    {resultLabels[entry.result]} · {new Date(entry.resultAt).toLocaleString()}
                  </Text>
                  {entry.resultBy?.name && <Text color="fg.muted">by {shortName(entry.resultBy.name)}</Text>}
                </Box>
              </HStack>
            ))}
          </Box>
        )}
      </Box>
    </VStack>
  );
}
