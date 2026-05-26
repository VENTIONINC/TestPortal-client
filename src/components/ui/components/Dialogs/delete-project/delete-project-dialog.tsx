// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Button, Text } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import { DefaultDialogProps } from '@/types';

import { useDeleteProjectBusinessLogic } from './hooks';

interface DeleteProjectDialogProps extends DefaultDialogProps {
  projectId: string;
}

export const DeleteProjectDialog = ({
  closeDialog,
  projectId,
}: DeleteProjectDialogProps) => {
  const { onConfirm } = useDeleteProjectBusinessLogic(closeDialog, projectId);

  return (
    <Dialog
      title="Delete Project"
      onClose={closeDialog}
      role="alertdialog"
    >
      <DialogBody display="flex" flexDir="column" gap={5}>
        <Text>
          Are you sure you want to delete this project? This action is permanent and cannot be undone. All associated data will be permanently removed.
        </Text>
      </DialogBody>

      <DialogFooter>
        <Button onClick={onConfirm} flex={1} bg="red.500" color="white">
          Delete Project
        </Button>
        <Button onClick={closeDialog} flex={1}>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
