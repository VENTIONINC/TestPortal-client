// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Button, Text, VStack } from '@chakra-ui/react';

import { Alert, Dialog, DialogBody, DialogFooter } from '@/components/ui';
import { useDeleteApiV2TestScenariosByScenarioIdMutation } from '@/redux/apis/extendedApi';
import { useGetApiV2TestScenariosByScenarioIdQuery } from '@/redux/apis/generatedApi';
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
  const [apiError, setApiError] = useState<string>();
  const impact = useGetApiV2TestScenariosByScenarioIdQuery({ scenarioId, projectId }, { refetchOnMountOrArgChange: true });
  const scenario = impact.currentData?.id === scenarioId && impact.currentData?.projectId === projectId ? impact.currentData : undefined;
  const [deleteScenario, { isLoading }] = useDeleteApiV2TestScenariosByScenarioIdMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlight = useRef(false);
  const isPending = isLoading || isSubmitting;

  useEffect(() => {
    setApiError(undefined);
  }, [scenarioId, projectId, scenarioTitle]);

  const handleConfirm = async () => {
    if (submitInFlight.current || isPending) return;

    submitInFlight.current = true;
    setIsSubmitting(true);
    setApiError(undefined);

    try {
      await deleteScenario({ scenarioId, projectId }).unwrap();
      closeDialog();
      onDeleted?.();
    } catch (error) {
      const message = extractApiError(error as FetchBaseQueryError | SerializedError);
      setApiError(message);
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
          <Text>
            Existing manual test runs and their saved snapshots are preserved. New manual test runs can no longer be started from this scenario.
          </Text>
          <Text>This action cannot be undone.</Text>
          {impact.isFetching ? <Text>Loading affected suites…</Text> : !impact.isError && scenario ? (
            <Text>Affected suites: {scenario.suites.length ? scenario.suites.map((suite) => suite.name).join(', ') : 'None'}</Text>
          ) : <Text>Affected suites could not be loaded.</Text>}
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
          disabled={isPending}
          aria-label="Confirm Test Scenario deletion"
        >
          Delete Test Scenario
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
