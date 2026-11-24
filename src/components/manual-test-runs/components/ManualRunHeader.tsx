// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { RefObject } from 'react';
import { Badge, Box, Button, Flex, Heading, HStack, IconButton, Menu, Portal, Text } from '@chakra-ui/react';
import { FiCheckCircle, FiEdit, FiFlag, FiInfo, FiMoreHorizontal, FiRotateCcw, FiTrash2 } from 'react-icons/fi';

import type { ManualTestRunRead, ManualTestRunScenarioResult } from '@/redux/apis/generatedApi';
import { orange_300 } from '@/theme/colors/palette';

import { MANUAL_RUN_RESULT } from '../constants';
import { resultLabels } from './manualRunResults';

const dateLabel = (date?: string | null) => (date ? new Date(date).toLocaleString() : '—');

interface ManualRunHeaderProps {
  run: ManualTestRunRead;
  completed: boolean;
  counts: Record<ManualTestRunScenarioResult, number>;
  marked: number;
  writesBlocked: boolean;
  completionTriggerRef: RefObject<HTMLButtonElement | null>;
  onComplete: (trigger: HTMLButtonElement) => void;
  onReopen: () => void;
  onManageScenarios: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ManualRunHeader = ({
  run,
  completed,
  counts,
  marked,
  writesBlocked,
  completionTriggerRef,
  onComplete,
  onReopen,
  onManageScenarios,
  onEdit,
  onDelete,
}: ManualRunHeaderProps) => {
  return (
    <>
      <HStack justify="space-between" align="start" wrap="wrap">
        <Box>
          <HStack>
            <Heading size="md" fontSize="18px">
              {run.title}
            </Heading>
            <Badge
              colorPalette={completed ? 'green' : 'blue'}
              bg={completed ? 'green.subtle' : 'blue.subtle'}
              color={completed ? 'green.fg' : undefined}
              borderWidth="0"
              borderRadius="full"
              px={3}
              py={0}
              fontSize="xs"
              fontWeight="medium"
              textTransform="none"
            >
              {completed ? 'Completed' : 'In Progress'}
            </Badge>
          </HStack>
          <Text color="fg.muted" fontSize="xs" mt={1}>
            {[run.browser, run.operatingSystem, run.device, run.apiEnvironment, run.build ? `build ${run.build}` : null]
              .filter(Boolean)
              .join(' · ') || 'Environment not set'}{' '}
            · Started {dateLabel(run.startedAt)} by {run.executedBy?.name ?? 'Unknown user'}
          </Text>
        </Box>
        <HStack>
          {!completed && (
            <Button size="sm" h="40px" variant="outline" disabled={writesBlocked} onClick={onManageScenarios}>
              Manage scenarios
            </Button>
          )}
          {completed ? (
            <Button size="sm" h="40px" variant="outline" disabled={writesBlocked} onClick={onReopen}>
              <FiRotateCcw aria-hidden="true" /> Reopen
            </Button>
          ) : (
            <Button
              ref={completionTriggerRef}
              size="sm"
              h="40px"
              variant="outline"
              disabled={writesBlocked}
              onClick={(event) => onComplete(event.currentTarget)}
            >
              <FiFlag /> Complete run
            </Button>
          )}
          <Menu.Root positioning={{ placement: 'bottom-end' }}>
            <Menu.Trigger asChild>
              <IconButton size="sm" h="40px" w="40px" variant="outline" aria-label="Run actions">
                <FiMoreHorizontal aria-hidden="true" />
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content minW="210px" bg="bg.panel" p={1}>
                  <Menu.Item
                    value="edit"
                    disabled={completed || writesBlocked}
                    title={completed ? 'Reopen the run before editing its details.' : undefined}
                    onClick={onEdit}
                  >
                    <FiEdit aria-hidden="true" />
                    Edit run details
                  </Menu.Item>
                  <Menu.Separator />
                  <Menu.Item value="delete" color="fg.error" disabled={writesBlocked} onClick={onDelete}>
                    <FiTrash2 aria-hidden="true" />
                    Delete run
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </HStack>
      </HStack>
      {completed && (
        <HStack role="status" borderRadius="md" bg="green.subtle" color="green.fg" p={3} align="start">
          <Box as={FiCheckCircle} flexShrink={0} mt="0.5" aria-hidden="true" />
          <Text fontSize="sm">
            Completed
            {run.completedAt
              ? ` ${new Date(run.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
              : ''}
            {run.completedBy?.name ? ` by ${run.completedBy.name}` : ''}.
            {run.skippedAtCompletion > 0 &&
              ` ${run.skippedAtCompletion} untested ${run.skippedAtCompletion === 1 ? 'scenario was' : 'scenarios were'} marked Skipped.`}{' '}
            The results are locked; reopen the run to change them.
          </Text>
        </HStack>
      )}
      {!completed && run.hasBeenReopened && marked === run.scenarios.length && run.scenarios.length > 0 && (
        <HStack role="status" borderRadius="md" bg="blue.subtle" color="blue.fg" minH="46px" px={4} py={2}>
          <Box as={FiRotateCcw} boxSize="14px" flexShrink={0} aria-hidden="true" />
          <Text fontSize="14px">
            <Text as="span" fontWeight="medium">
              Run reopened.
            </Text>{' '}
            Results are editable again. Complete the run when you’re done.
          </Text>
        </HStack>
      )}
      {!completed && !run.hasBeenReopened && marked === run.scenarios.length && run.scenarios.length > 0 && (
        <HStack role="status" borderRadius="md" bg="blue.subtle" color="blue.fg" minH="46px" px={4} py={2}>
          <Box as={FiInfo} boxSize="14px" flexShrink={0} aria-hidden="true" />
          <Text fontSize="14px">
            All scenarios are marked. Complete the run to finish it: its results are then locked until you reopen it.
          </Text>
        </HStack>
      )}
      <Box position="absolute" w="1px" h="1px" overflow="hidden" clipPath="inset(50%)">
        {(
          [
            MANUAL_RUN_RESULT.PASSED,
            MANUAL_RUN_RESULT.FAILED,
            MANUAL_RUN_RESULT.BLOCKED,
            MANUAL_RUN_RESULT.SKIPPED,
            MANUAL_RUN_RESULT.UNTESTED,
          ] as const
        ).map((key) => (
          <Text key={key}>
            {resultLabels[key]} {counts[key]}
          </Text>
        ))}
      </Box>
      <Flex
        role="img"
        aria-label={`Run progress: ${marked} of ${run.scenarios.length} marked`}
        h="1.5"
        borderRadius="full"
        overflow="hidden"
        bg="bg.subtle"
      >
        {counts.passed > 0 && <Box flex={counts.passed} bg="green.500" />}
        {counts.failed > 0 && <Box flex={counts.failed} bg="red.500" />}
        {counts.blocked > 0 && <Box flex={counts.blocked} bg={orange_300} />}
        {counts.skipped > 0 && <Box flex={counts.skipped} bg="gray.500" />}
        {counts.untested > 0 && <Box flex={counts.untested} bg="gray.200" />}
      </Flex>
    </>
  );
};
