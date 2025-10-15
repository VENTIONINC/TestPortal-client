import { Button, Text } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import { DefaultDialogProps } from '@/types';

import { useArchiveProjectBusinessLogic } from './hooks';

interface ArchiveProjectDialogProps extends DefaultDialogProps {
  projectId: string;
}

export const ArchiveProjectDialog = ({ 
  closeDialog, 
  projectId
}: ArchiveProjectDialogProps) => {
  const { onConfirm } = useArchiveProjectBusinessLogic(
    closeDialog, 
    projectId
  );

  return (
    <Dialog title="Archive Project" onClose={closeDialog} role="alertdialog">
      <DialogBody display="flex" flexDir="column" gap={5}>
        <Text>
          Are you sure you want to archive this project? 
          Archived projects will be hidden from the main view but can be restored later.
        </Text>
      </DialogBody>

      <DialogFooter>
        <Button onClick={onConfirm} flex={1} bg="orange.500" color="white">
          Archive Project
        </Button>
        <Button onClick={closeDialog} flex={1}>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
};