import { Button, Text } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import { DefaultDialogProps } from '@/types';

interface ConfirmApiKeyDeletionDialogProps extends DefaultDialogProps {
  onConfirm: () => void;
}

export const ConfirmApiKeyDeletionDialog = ({ onConfirm, closeDialog }: ConfirmApiKeyDeletionDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    closeDialog();
  };

  return (
    <Dialog title="Delete API Key" onClose={closeDialog} role="alertdialog">
      <DialogBody display="flex" flexDir="column" gap={5}>
        <Text>
          Are you sure you want to delete this API key? This action cannot be undone and any integrations using this
          key will stop working immediately.
        </Text>
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
