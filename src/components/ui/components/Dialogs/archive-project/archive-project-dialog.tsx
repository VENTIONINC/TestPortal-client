// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Button, Text } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import { DefaultDialogProps } from '@/types';

import { useArchiveProjectBusinessLogic } from './hooks';

interface ArchiveProjectDialogProps extends DefaultDialogProps {
  projectId: string;
  archive?: boolean;
}

export const ArchiveProjectDialog = ({
  closeDialog,
  projectId,
  archive = false
}: ArchiveProjectDialogProps) => {
  const { onConfirm } = useArchiveProjectBusinessLogic(
    closeDialog,
    projectId,
    archive
  );

  return (
    <Dialog
      title={archive ? 'Archive Project' : 'Unarchive Project'}
      onClose={closeDialog}
      role="alertdialog"
    >
      <DialogBody display="flex" flexDir="column" gap={5}>
        <Text>
          {archive
            ? 'Are you sure you want to archive this project? Archived projects will be hidden from the main view but can be restored later.'
            : 'Are you sure you want to unarchive this project? The project will be restored to the main view.'}
        </Text>
      </DialogBody>

      <DialogFooter>
        <Button onClick={onConfirm} flex={1} bg="orange.500" color="white">
          {archive ? 'Archive Project' : 'Unarchive Project'}
        </Button>
        <Button onClick={closeDialog} flex={1}>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
};