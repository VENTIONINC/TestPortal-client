// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Button, Text, VStack } from '@chakra-ui/react';

import { Alert, Dialog, DialogBody, DialogFooter, toaster } from '@/components/ui';
import { useDeleteCustomSkillMutation } from '@/redux/apis/extendedApi';
import type { DefaultDialogProps } from '@/types';
import { extractApiError } from '@/utils/apiErrors';

export interface DeleteSkillDialogProps extends DefaultDialogProps {
  skillId: string;
  skillTitle: string;
  onDeleted: () => void;
}

export const DeleteSkillDialog = ({ closeDialog, skillId, skillTitle, onDeleted }: DeleteSkillDialogProps) => {
  const [apiError, setApiError] = useState<string>();
  const [deleteSkill, { isLoading }] = useDeleteCustomSkillMutation();

  const handleConfirm = async () => {
    if (isLoading) return;

    setApiError(undefined);

    try {
      await deleteSkill({ id: skillId }).unwrap();
      toaster.create({ title: 'Skill deleted successfully.', type: 'success' });
      closeDialog();
      onDeleted();
    } catch (error) {
      const message = extractApiError(error as FetchBaseQueryError | SerializedError);
      setApiError(message);
      toaster.create({ title: message, type: 'error' });
    }
  };

  return (
    <Dialog title="Delete skill" onClose={closeDialog} role="alertdialog">
      <DialogBody>
        <VStack align="stretch" gap={4}>
          <Text>
            Delete <strong>{skillTitle}</strong>?
          </Text>
          <Text>This permanently removes the custom skill and its packaged resources. This action cannot be undone.</Text>
          {apiError && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Skill deletion failed</Alert.Title>
                <Alert.Description>{apiError}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}
        </VStack>
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={closeDialog} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="button"
          bg="red.500"
          color="white"
          onClick={handleConfirm}
          loading={isLoading}
          disabled={isLoading}
        >
          Delete skill
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
