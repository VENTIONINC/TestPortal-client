// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ComponentProps } from 'react';
import { Box, Button, HStack, IconButton, Portal, Text } from '@chakra-ui/react';
import { FiMinusCircle, FiPlay, FiTrash2, FiX } from 'react-icons/fi';

import { Tooltip } from '@/components/ui';

import { SuitePicker } from '../SuitePicker';

type BulkSuitePickerProps = Extract<ComponentProps<typeof SuitePicker>, { projectId: string }>;
export type SuitePickerCompletion = BulkSuitePickerProps['onComplete'];

interface CatalogBulkActionsProps {
  selectedIds: string[];
  total: number;
  allMatchingSelected: boolean;
  inSuite: boolean;
  isSuitesTab: boolean;
  isScenariosTab: boolean;
  projectId?: string;
  isResolvingSelection: boolean;
  isExecutingOperation: boolean;
  isAddingToSuite: boolean;
  onSelectAllMatching: () => void;
  handleRunSelected: () => Promise<void>;
  onSuitePickerBusyChange: NonNullable<BulkSuitePickerProps['onBusyChange']>;
  onSuitePickerComplete: SuitePickerCompletion;
  onDeleteSelected: () => void;
  onRemoveFromSuite: () => void;
  clearSelection: () => void;
}

export const CatalogBulkActions = ({
  selectedIds,
  total,
  allMatchingSelected,
  inSuite,
  isSuitesTab,
  isScenariosTab,
  projectId,
  isResolvingSelection,
  isExecutingOperation,
  isAddingToSuite,
  onSelectAllMatching,
  handleRunSelected,
  onSuitePickerBusyChange,
  onSuitePickerComplete,
  onDeleteSelected,
  onRemoveFromSuite,
  clearSelection,
}: CatalogBulkActionsProps) => (
  <Portal>
    <HStack
      position="fixed"
      left="50%"
      bottom={{ base: 3, md: 5 }}
      transform="translateX(-50%)"
      zIndex="popover"
      flexWrap={{ base: 'wrap', sm: 'nowrap' }}
      justify="center"
      gap={{ base: 1, sm: 2 }}
      px={{ base: 2, sm: 3 }}
      py={2}
      maxW="calc(100vw - 24px)"
      color="white"
      borderRadius="lg"
      boxShadow="0 8px 28px rgba(0, 0, 0, 0.28)"
      aria-label="Bulk scenario actions"
      role="toolbar"
      bg={inSuite ? 'gray.900' : 'black'}
      _dark={{ bg: 'gray.900', color: 'white' }}
    >
      <Text
        as="span"
        display="inline-flex"
        alignItems="center"
        h="8"
        px={1}
        fontSize="sm"
        lineHeight="1.2"
        fontWeight="semibold"
        whiteSpace="nowrap"
      >
        {selectedIds.length} selected
      </Text>
      {!allMatchingSelected && selectedIds.length < total && (
        <Button
          size="sm"
          variant="ghost"
          color="blue.300"
          disabled={isResolvingSelection || isExecutingOperation}
          onClick={onSelectAllMatching}
          _dark={{ color: 'blue.700' }}
          _hover={{ bg: 'whiteAlpha.200' }}
        >
          Select all {total}
        </Button>
      )}
      <Box aria-hidden="true" h="6" borderStartWidth="1px" borderColor="whiteAlpha.400" mx={1} />
      {(isSuitesTab || isScenariosTab) && (
        <Tooltip
          content={`Start a manual run with the ${selectedIds.length === 1 ? 'selected scenario' : `${selectedIds.length} selected scenarios`}`}
          openDelay={500}
          closeDelay={0}
          contentProps={{ maxW: '240px' }}
        >
          <Button
            size="sm"
            variant="ghost"
            color="white"
            disabled={isExecutingOperation || isResolvingSelection}
            loading={isExecutingOperation}
            onClick={() => void handleRunSelected()}
            _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
            _active={{ bg: 'whiteAlpha.300', color: 'white' }}
            _focusVisible={{ outline: '2px solid', outlineColor: 'blue.300', outlineOffset: '2px' }}
          >
            <FiPlay aria-hidden="true" />
            Run selected
          </Button>
        </Tooltip>
      )}
      {isScenariosTab && projectId && (
        <SuitePicker
          key={projectId}
          projectId={projectId}
          selectedIds={selectedIds}
          disabled={isExecutingOperation || isAddingToSuite}
          onBusyChange={onSuitePickerBusyChange}
          onComplete={onSuitePickerComplete}
        />
      )}
      {isScenariosTab && (
        <Button
          size="sm"
          variant="ghost"
          disabled={isExecutingOperation || isAddingToSuite}
          onClick={onDeleteSelected}
          color="red.300"
          _dark={{ color: 'red.600' }}
          _hover={{ bg: 'whiteAlpha.200' }}
        >
          <FiTrash2 aria-hidden="true" />
          Delete
        </Button>
      )}
      {inSuite && (
        <Tooltip
          content="Unlink from this suite. The scenarios stay in the catalog."
          openDelay={500}
          closeDelay={0}
          contentProps={{ maxW: '240px' }}
        >
          <Button
            size="sm"
            variant="ghost"
            disabled={isExecutingOperation || isAddingToSuite}
            onClick={onRemoveFromSuite}
            color="red.300"
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            <FiMinusCircle aria-hidden="true" />
            Remove from suite
          </Button>
        </Tooltip>
      )}
      <Tooltip content="Clear selection" openDelay={500} closeDelay={0} contentProps={{ maxW: '240px' }}>
        <IconButton
          size="sm"
          variant="ghost"
          aria-label="Clear selection"
          disabled={isExecutingOperation || isAddingToSuite}
          onClick={clearSelection}
          color="inherit"
          _hover={{ bg: 'whiteAlpha.200' }}
        >
          <FiX />
        </IconButton>
      </Tooltip>
    </HStack>
  </Portal>
);

interface CatalogUndoNotificationProps {
  label: string;
  message: string;
  isUndoing: boolean;
  onUndo: () => Promise<void>;
}

export const CatalogUndoNotification = ({ label, message, isUndoing, onUndo }: CatalogUndoNotificationProps) => (
  <Portal>
    <HStack
      role="status"
      aria-label={label}
      position="fixed"
      bottom={{ base: 3, md: 5 }}
      left="50%"
      transform="translateX(-50%)"
      zIndex={1500}
      justify="space-between"
      gap={5}
      width="max-content"
      maxW="calc(100vw - 32px)"
      bg="#1f1f23"
      color="white"
      borderRadius="md"
      boxShadow="lg"
      px={4}
      py={2}
    >
      <Text fontSize="sm" lineHeight="short" flex="1">
        {message}
      </Text>
      <Button size="sm" variant="plain" color="#b7c6ff" flexShrink={0} disabled={isUndoing} onClick={onUndo}>
        {isUndoing ? 'Undoing…' : 'Undo'}
      </Button>
    </HStack>
  </Portal>
);
