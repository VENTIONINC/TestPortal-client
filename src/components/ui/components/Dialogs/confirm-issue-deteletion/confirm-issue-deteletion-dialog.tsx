// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Button, Text } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import { DefaultDialogProps } from '@/types';

interface ConfirmIssueDeletionDialogProps extends DefaultDialogProps {
  onConfirm: () => void;
}

export const ConfirmIssueDeletionDialog = ({ onConfirm, closeDialog }: ConfirmIssueDeletionDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    closeDialog();
  };

  return (
    <Dialog title="Delete Issue" onClose={closeDialog} role="alertdialog">
      <DialogBody display="flex" flexDir="column" gap={5}>
        <Text>Are you sure you want to delete this issue? It will also delete all assumptions associated with it.</Text>
      </DialogBody>

      <DialogFooter>
        <Button onClick={handleConfirm} flex={1} bg="red.500">
          Confirm
        </Button>
        <Button onClick={closeDialog} flex={1}>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
