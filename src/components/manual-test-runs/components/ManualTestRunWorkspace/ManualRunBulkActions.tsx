// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, HStack, IconButton, Text } from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';

import { Tooltip } from '@/components/ui';
import type { ManualTestRunScenarioResult } from '@/redux/apis/generatedApi';
import { orange_300 } from '@/theme/colors/palette';

import { MANUAL_RUN_RESULT } from '../../constants';
import { BulkAssigneePicker } from '../BulkAssigneePicker';
import { RESULTS, resultExplanations, resultLabels } from '../manualRunResults';

type MarkedResult = (typeof RESULTS)[number];

const resultColors: Record<MarkedResult, string> = {
  [MANUAL_RUN_RESULT.PASSED]: 'green.500',
  [MANUAL_RUN_RESULT.FAILED]: 'red.500',
  [MANUAL_RUN_RESULT.BLOCKED]: orange_300,
  [MANUAL_RUN_RESULT.SKIPPED]: 'gray.400',
};

interface ManualRunBulkActionsProps {
  selectedCount: number;
  filteredCount: number;
  canSelectAll: boolean;
  writesBlocked: boolean;
  users: Array<{ id: string; name: string }>;
  resultActions: Array<{ result: MarkedResult; nextResult: ManualTestRunScenarioResult }>;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onLoadUsers: () => void;
  onResultChange: (result: ManualTestRunScenarioResult) => void;
  onAssigneeChange: (assigneeId: string | null) => void;
}

export const ManualRunBulkActions = ({
  selectedCount,
  filteredCount,
  canSelectAll,
  writesBlocked,
  users,
  resultActions,
  onSelectAll,
  onClearSelection,
  onLoadUsers,
  onResultChange,
  onAssigneeChange,
}: ManualRunBulkActionsProps) => {
  const resultButtons = resultActions.map(({ result, nextResult }) => {
    const willReset = nextResult === MANUAL_RUN_RESULT.UNTESTED;
    const label = resultLabels[result];
    const action = willReset
      ? 'Click to reset all selected scenarios to Untested.'
      : `Click to mark all selected scenarios as ${label}.`;

    return {
      result,
      nextResult,
      label,
      tooltip: `${resultExplanations[result]} ${action}`,
      ariaLabel: willReset ? 'Reset selected scenarios to Untested' : `Mark selected ${label}`,
      color: resultColors[result],
    };
  });

  return (
    <HStack
      role="toolbar"
      aria-label="Bulk scenario actions"
      alignSelf="center"
      position="sticky"
      bottom={2}
      zIndex={2}
      bg="gray.900"
      color="white"
      px={3}
      py={2}
      borderRadius="lg"
      boxShadow="lg"
      gap={1}
      maxW="100%"
      overflowX="auto"
      flexShrink={0}
    >
      <Text fontSize="sm" fontWeight="medium" whiteSpace="nowrap" px={2}>
        {selectedCount} selected
      </Text>
      {canSelectAll && (
        <Button size="sm" variant="ghost" color="blue.300" disabled={writesBlocked} onClick={onSelectAll}>
          Select all {filteredCount}
        </Button>
      )}
      <Text fontSize="sm" color="gray.400" px={2} borderLeftWidth="1px" borderColor="gray.600">
        Mark as
      </Text>
      {resultButtons.map(({ result, nextResult, label, tooltip, ariaLabel, color }) => (
        <Tooltip key={result} openDelay={500} closeDelay={0} contentProps={{ maxW: '240px' }} content={tooltip}>
          <Button
            size="xs"
            variant="ghost"
            color="white"
            _hover={{ bg: 'gray.700', color: 'white' }}
            _active={{ bg: 'gray.600', color: 'white' }}
            flexShrink={0}
            disabled={writesBlocked}
            aria-label={ariaLabel}
            onClick={() => onResultChange(nextResult)}
          >
            <Box w="2" h="2" borderRadius="full" bg={color} />
            {label}
          </Button>
        </Tooltip>
      ))}
      <Box h="24px" borderLeftWidth="1px" borderColor="gray.600" mx={1} flexShrink={0} />
      <BulkAssigneePicker
        count={selectedCount}
        users={users}
        disabled={writesBlocked}
        onOpen={onLoadUsers}
        onChange={onAssigneeChange}
      />
      <IconButton
        size="sm"
        variant="ghost"
        color="white"
        _hover={{ bg: 'gray.700', color: 'white' }}
        _active={{ bg: 'gray.600', color: 'white' }}
        aria-label="Clear selection"
        onClick={onClearSelection}
      >
        <FiX aria-hidden="true" />
      </IconButton>
    </HStack>
  );
};
