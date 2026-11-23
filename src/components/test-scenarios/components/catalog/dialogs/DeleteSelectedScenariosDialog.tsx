// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Button, Text, VStack } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import type { DefaultDialogProps } from '@/types';

import type { ScenarioOperationReport } from '../../../utils';
import { useCatalogConfirmation } from './hooks/useCatalogConfirmation';

export interface DeleteSelectedScenariosDialogProps extends DefaultDialogProps {
  scenarioIds: string[];
  onDelete: (scenarioIds: string[]) => Promise<ScenarioOperationReport>;
  onDeleted: (report: ScenarioOperationReport) => void;
}

export const DeleteSelectedScenariosDialog = ({
  scenarioIds,
  onDelete,
  onDeleted,
  closeDialog,
}: DeleteSelectedScenariosDialogProps) => {
  const count = scenarioIds.length;
  const { error, isSubmitting, onCancel, onConfirm } = useCatalogConfirmation(
    () => onDelete(scenarioIds),
    closeDialog,
    onDeleted,
  );

  return (
    <Dialog
      title={`Delete ${count} selected scenario${count === 1 ? '' : 's'}?`}
      onClose={onCancel}
      closeOnEscape={!isSubmitting}
      closeOnInteractOutside={!isSubmitting}
      closeTriggerProps={{ disabled: isSubmitting }}
    >
      <DialogBody>
        <VStack align="stretch" gap={4}>
          <Text>
            This permanently deletes the selected scenarios. Only scenarios in this confirmed selection will be deleted.
          </Text>
          {error && (
            <Text role="alert" color="fg.error">
              {error}
            </Text>
          )}
        </VStack>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="ghost" disabled={isSubmitting} onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          colorPalette="red"
          loading={isSubmitting}
          disabled={isSubmitting}
          onClick={() => void onConfirm()}
        >
          Delete {count} scenarios
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
