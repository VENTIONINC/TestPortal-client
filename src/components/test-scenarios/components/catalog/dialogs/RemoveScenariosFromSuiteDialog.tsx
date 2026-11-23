// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Button, Text, VStack } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import type { DefaultDialogProps } from '@/types';

import type { SuiteMembershipUndo } from '../types';
import { useCatalogConfirmation } from './hooks/useCatalogConfirmation';

export interface RemoveScenariosFromSuiteDialogProps extends DefaultDialogProps {
  suiteId: string;
  scenarioIds: string[];
  onRemove: (suiteId: string, scenarioIds: string[]) => Promise<SuiteMembershipUndo>;
  onRemoved: (undo: SuiteMembershipUndo) => void;
}

export const RemoveScenariosFromSuiteDialog = ({
  suiteId,
  scenarioIds,
  onRemove,
  onRemoved,
  closeDialog,
}: RemoveScenariosFromSuiteDialogProps) => {
  const count = scenarioIds.length;
  const { error, isSubmitting, onCancel, onConfirm } = useCatalogConfirmation(
    () => onRemove(suiteId, scenarioIds),
    closeDialog,
    onRemoved,
  );

  return (
    <Dialog
      title={`Remove ${count} scenario${count === 1 ? '' : 's'} from suite`}
      onClose={onCancel}
      closeOnEscape={!isSubmitting}
      closeOnInteractOutside={!isSubmitting}
      closeTriggerProps={{ disabled: isSubmitting }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onConfirm();
        }}
      >
        <DialogBody>
          <VStack align="stretch" gap={4}>
            <Text color="text.secondary">The selected scenarios will remain in the project and other suites.</Text>
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
          <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
            Remove {count} scenario{count === 1 ? '' : 's'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
