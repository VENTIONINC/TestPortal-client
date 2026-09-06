// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Button, Text, VStack } from '@chakra-ui/react';

import { Alert, Dialog, DialogBody, DialogFooter, Input, toaster } from '@/components/ui';
import { useDeleteApiV2TestScenariosByScenarioIdMutation } from '@/redux/apis/generatedApi';
import type { DefaultDialogProps } from '@/types';
import { extractApiError } from '@/utils/apiErrors';

export interface DeleteTestScenarioDialogProps extends DefaultDialogProps {
  scenarioId: string;
  projectId: string;
  scenarioTitle: string;
  onDeleted?: () => void;
}

export const DeleteTestScenarioDialog = ({
  closeDialog,
  scenarioId,
  projectId,
  scenarioTitle,
  onDeleted,
}: DeleteTestScenarioDialogProps) => {
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [apiError, setApiError] = useState<string>();
  const [deleteScenario, { isLoading }] = useDeleteApiV2TestScenariosByScenarioIdMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlight = useRef(false);
  const isPending = isLoading || isSubmitting;
  const hasExactTitle = scenarioTitle.length > 0 && confirmationTitle === scenarioTitle;

  useEffect(() => {
    setConfirmationTitle('');
    setApiError(undefined);
  }, [scenarioId, projectId, scenarioTitle]);

  const handleConfirm = async () => {
    if (submitInFlight.current || isPending || !hasExactTitle) return;

    submitInFlight.current = true;
    setIsSubmitting(true);
    setApiError(undefined);

    try {
      await deleteScenario({ scenarioId, projectId }).unwrap();
      toaster.create({ title: 'Test Scenario deleted successfully.', type: 'success' });
      closeDialog();
      onDeleted?.();
    } catch (error) {
      const message = extractApiError(error as FetchBaseQueryError | SerializedError);
      setApiError(message);
      toaster.create({ title: message, type: 'error' });
    } finally {
      submitInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog title="Delete Test Scenario" onClose={closeDialog} role="alertdialog">
      <DialogBody>
        <VStack align="stretch" gap={4}>
          <Text>
            This permanently deletes <strong>{scenarioTitle}</strong> from the selected project.
          </Text>
          <Text>Enter the exact scenario title to confirm. Matching is case-sensitive and whitespace-sensitive.</Text>
          <Input
            name="scenario-delete-confirmation"
            label="Scenario title"
            value={confirmationTitle}
            onChange={(event) => setConfirmationTitle(event.target.value)}
            autoComplete="off"
            disabled={isPending}
          />
          {apiError && (
            <Alert.Root status="error" role="alert">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Deletion failed</Alert.Title>
                <Alert.Description>{apiError}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}
        </VStack>
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={closeDialog} disabled={isPending}>
          Cancel
        </Button>
        <Button
          type="button"
          bg="red.500"
          color="white"
          onClick={handleConfirm}
          loading={isPending}
          disabled={!hasExactTitle || isPending}
          aria-label="Confirm Test Scenario deletion"
        >
          Delete Test Scenario
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
