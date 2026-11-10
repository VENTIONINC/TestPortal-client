// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { FiTrash2 } from 'react-icons/fi';

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
    <Dialog
      title={<HStack gap={3}><Box display="flex" alignItems="center" justifyContent="center" boxSize="10" borderRadius="lg" bg="red.100" color="red.600" flexShrink={0}><FiTrash2 size={20} aria-hidden="true" /></Box><Text>Delete scenario{scenario?.scenarioKey ? ` ${scenario.scenarioKey}` : ''}?</Text></HStack>}
      onClose={closeDialog}
      role="alertdialog"
      closeTriggerProps={{ display: 'none' }}
      contentProps={{ bg: 'bg.card', backdropFilter: 'none' }}
      titleProps={{ fontWeight: 'semibold' }}
    >
      <DialogBody>
        <VStack align="stretch" gap={4}>
          <Text color="text.secondary">
            “{scenarioTitle}” will be deleted{!impact.isFetching && !impact.isError && scenario
              ? ` and removed from ${scenario.suites.length} ${scenario.suites.length === 1 ? `suite (${scenario.suites[0].name})` : 'suites'}`
              : ''}. Its results in past manual runs are kept. This can’t be undone.
          </Text>
          {impact.isFetching ? <Text color="text.secondary">Loading affected suites…</Text> : impact.isError || !scenario ? <Text color="text.secondary">Affected suites could not be loaded.</Text> : null}
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
          aria-label="Delete scenario"
        >
          Delete scenario
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
