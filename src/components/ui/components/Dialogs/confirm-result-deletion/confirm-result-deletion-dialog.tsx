// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Button, Text } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import { DefaultDialogProps } from '@/types';

import { useConfirmResultDeletionBusinessLogic } from './hooks';

interface ConfirmResultDeletionDialogProps extends DefaultDialogProps {
  resultId: string;
  resultRetry: number;
  specName: string;
  projectId: string;
}

export const ConfirmResultDeletionDialog = ({
  closeDialog,
  resultId,
  resultRetry,
  specName,
  projectId,
}: ConfirmResultDeletionDialogProps) => {
  const { onConfirm } = useConfirmResultDeletionBusinessLogic(closeDialog, resultId, projectId);

  return (
    <Dialog title="Delete Result" onClose={closeDialog} role="alertdialog">
      <DialogBody display="flex" flexDir="column" gap={5}>
        <Text>
          Are you sure you want to delete retry <strong>#{resultRetry}</strong> for{' '}
          <strong>{specName}</strong>?
        </Text>
        <Text>This action cannot be undone.</Text>
      </DialogBody>

      <DialogFooter>
        <Button onClick={onConfirm} flex={1} bg="red.500" color="white">
          Delete Result
        </Button>
        <Button onClick={closeDialog} flex={1}>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
