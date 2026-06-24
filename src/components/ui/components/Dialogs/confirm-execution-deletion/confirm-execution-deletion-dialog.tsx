// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Button, Text } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import { DefaultDialogProps } from '@/types';

import { useConfirmExecutionDeletionBusinessLogic } from './hooks';

interface ConfirmExecutionDeletionDialogProps extends DefaultDialogProps {
  executionId: string;
  executionName: string;
  projectId: string;
}

export const ConfirmExecutionDeletionDialog = ({
  closeDialog,
  executionId,
  executionName,
  projectId,
}: ConfirmExecutionDeletionDialogProps) => {
  const { onConfirm } = useConfirmExecutionDeletionBusinessLogic(closeDialog, executionId, projectId);

  return (
    <Dialog title="Delete Execution" onClose={closeDialog} role="alertdialog">
      <DialogBody display="flex" flexDir="column" gap={5}>
        <Text>
          Are you sure you want to delete the execution <strong>{executionName}</strong>?
        </Text>
        <Text>This action cannot be undone.</Text>
      </DialogBody>

      <DialogFooter>
        <Button onClick={onConfirm} flex={1} bg="red.500" color="white">
          Delete Execution
        </Button>
        <Button onClick={closeDialog} flex={1}>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
