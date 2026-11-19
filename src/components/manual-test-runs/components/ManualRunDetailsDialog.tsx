// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { Box, Button, HStack, Input, Text, VStack } from '@chakra-ui/react';
import { FiPlay } from 'react-icons/fi';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import type { ManualTestRunEnvironmentProperty, ManualTestRunScenarioRead } from '@/redux/apis/generatedApi';

import { ManageScenariosDialog } from './ManageScenariosDialog';
import { ManualRunEnvironmentEditor } from './ManualRunEnvironmentEditor';
import { ManualRunScenarioSummary } from './ManualRunScenarioSummary';

export const normalizeEnvironment = (items: ManualTestRunEnvironmentProperty[]) =>
  items
    .filter(
      (item, index) =>
        item.name.trim() &&
        item.value.trim() &&
        items.findIndex((row) => row.name.trim().toLowerCase() === item.name.trim().toLowerCase()) === index,
    )
    .map((item) => ({ name: item.name.trim(), value: item.value.trim() }));

type ManualRunDetailsDialogProps = {
  projectId: string;
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
  warning?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: () => void;
};

export function ManualRunDetailsDialog({
  projectId,
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
  warning,
  error,
  onClose,
  onSubmit,
}: ManualRunDetailsDialogProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const handleSaveScenarios = (ids: string[]) => {
    onSelectionChange(ids);
    setPickerOpen(false);
  };

  return (
    <>
      <Dialog
        title={mode === 'new' ? 'New manual run' : 'Edit run details'}
        onClose={onClose}
        contentProps={{ bg: 'bg.panel', maxW: '740px', w: 'calc(100vw - 2rem)', maxH: '90vh' }}
        headerProps={{ borderBottomWidth: '1px', borderColor: 'border.main', p: 6 }}
      >
        <DialogBody p={6}>
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
              onChange={() => setPickerOpen(true)}
            />
            <ManualRunEnvironmentEditor
              projectId={projectId}
              environment={environment}
              onEnvironmentChange={onEnvironmentChange}
              sourceRunTitle={mode === 'new' ? sourceRunTitle : undefined}
            />
            {warning && (
              <Box role="alert" bg="yellow.subtle" color="orange.fg" p={3} borderRadius="md">
                Removing these scenarios will also remove{' '}
                {
                  existing.filter((item) => !selectedIds.includes(item.sourceScenarioId) && item.result !== 'untested')
                    .length
                }{' '}
                saved results. Save these changes?
              </Box>
            )}
            {error && (
              <Text role="alert" color="fg.error">
                {error}
              </Text>
            )}
          </VStack>
        </DialogBody>
        <DialogFooter borderTopWidth="1px" borderColor="border.main" px={6} py={5}>
          <HStack w="full" justify="space-between" flexWrap="wrap">
            {mode === 'new' ? (
              <Text color="fg.muted" fontSize="sm">
                {selectedIds.length} scenarios, all start as Untested
              </Text>
            ) : (
              <Box />
            )}
            <HStack>
              <Button variant="ghost" disabled={saving} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorPalette="blue"
                disabled={saving || !name.trim() || !selectedIds.length}
                loading={saving}
                onClick={onSubmit}
              >
                {mode === 'new' && <FiPlay />}
                {mode === 'new' ? 'Start run' : warning ? 'Remove results and save' : 'Save changes'}
              </Button>
            </HStack>
          </HStack>
        </DialogFooter>
      </Dialog>
      {pickerOpen && (
        <ManageScenariosDialog
          projectId={projectId}
          runTitle={name}
          existing={existing}
          initialIds={selectedIds}
          pickerMode
          saving={false}
          onClose={() => setPickerOpen(false)}
          onSave={handleSaveScenarios}
        />
      )}
    </>
  );
}
