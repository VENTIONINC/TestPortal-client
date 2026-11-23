// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, chakra, HStack, Input, Text, VStack } from '@chakra-ui/react';
import { FiPlay } from 'react-icons/fi';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import type { ManualTestRunEnvironmentProperty, ManualTestRunScenarioRead } from '@/redux/apis/generatedApi';

import { useSelectScenariosDialog } from '../ManageScenariosDialog';
import { ManualRunEnvironmentEditor } from './ManualRunEnvironmentEditor';
import { ManualRunScenarioSummary } from './ManualRunScenarioSummary';

interface ManualRunDetailsDialogProps {
  projectId: string;
  pickerScopeKey?: string;
  mode: 'new' | 'edit';
  name: string;
  onNameChange: (value: string) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  environment: ManualTestRunEnvironmentProperty[];
  onEnvironmentChange: (items: ManualTestRunEnvironmentProperty[]) => void;
  existing?: ManualTestRunScenarioRead[];
  sourceSuiteName?: string;
  sourceRunTitle?: string;
  saving: boolean;
  saveBlocked?: boolean;
  removedResultsCount?: number;
  error?: string;
  onClose: () => void;
  onSubmit: () => void;
}

export function ManualRunDetailsDialog({
  projectId,
  pickerScopeKey,
  mode,
  name,
  onNameChange,
  selectedIds,
  onSelectionChange,
  environment,
  onEnvironmentChange,
  existing = [],
  sourceSuiteName,
  sourceRunTitle,
  saving,
  saveBlocked,
  removedResultsCount = 0,
  error,
  onClose,
  onSubmit,
}: ManualRunDetailsDialogProps) {
  const openSelectScenarios = useSelectScenariosDialog(projectId, pickerScopeKey);
  const hasWarning = removedResultsCount > 0;
  const isNew = mode === 'new';

  const handleChangeScenarios = (trigger: HTMLButtonElement) => {
    openSelectScenarios({
      existing,
      initialIds: selectedIds,
      onSelectionChange,
      finalFocusEl: () => (trigger.isConnected ? trigger : null),
    });
  };

  const handleClose = () => {
    if (!saving) onClose();
  };

  return (
    <Dialog
      title={isNew ? 'New manual run' : 'Edit run details'}
      onClose={handleClose}
      closeOnEscape={!saving}
      closeOnInteractOutside={!saving}
      closeTriggerProps={{ disabled: saving }}
      contentProps={{ bg: 'bg.panel', maxW: '740px', w: 'calc(100vw - 2rem)', maxH: '90vh' }}
      headerProps={{ borderBottomWidth: '1px', borderColor: 'border.main', p: 6 }}
    >
      <DialogBody p={6}>
        <chakra.fieldset disabled={saving} minW={0}>
          <VStack align="stretch" gap={5}>
            <Box>
              <Text fontSize="sm" color="fg.muted" mb={1}>
                Run name
              </Text>
              <Input
                aria-label="Run name"
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                autoFocus
              />
            </Box>
            <ManualRunScenarioSummary
              projectId={projectId}
              selectedIds={selectedIds}
              existing={existing}
              sourceSuiteName={sourceSuiteName}
              onChange={handleChangeScenarios}
            />
            <ManualRunEnvironmentEditor
              projectId={projectId}
              environment={environment}
              onEnvironmentChange={onEnvironmentChange}
              sourceRunTitle={isNew ? sourceRunTitle : undefined}
            />
            {hasWarning && (
              <Box role="alert" bg="yellow.subtle" color="orange.fg" p={3} borderRadius="md">
                Removing these scenarios will also remove {removedResultsCount} saved results. Save these changes?
              </Box>
            )}
            {error && (
              <Text role="alert" color="fg.error">
                {error}
              </Text>
            )}
          </VStack>
        </chakra.fieldset>
      </DialogBody>
      <DialogFooter borderTopWidth="1px" borderColor="border.main" px={6} py={5}>
        <HStack w="full" justify="space-between" flexWrap="wrap">
          {isNew ? (
            <Text color="fg.muted" fontSize="sm">
              {selectedIds.length} scenarios, all start as Untested
            </Text>
          ) : (
            <Box />
          )}
          <HStack>
            <Button variant="ghost" disabled={saving} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorPalette="blue"
              disabled={saving || saveBlocked || !name.trim() || !selectedIds.length}
              loading={saving}
              onClick={onSubmit}
            >
              {isNew && <FiPlay />}
              {isNew ? 'Start run' : hasWarning ? 'Remove results and save' : 'Save changes'}
            </Button>
          </HStack>
        </HStack>
      </DialogFooter>
    </Dialog>
  );
}
