// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState } from 'react';
import { Button, Text } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import { useDeleteManualTestRunMutation } from '@/redux/apis/extendedApi';
import type { DefaultDialogProps } from '@/types';

export interface DeleteManualRunDialogProps {
  projectId: string;
  runId: string;
  title: string;
  scenarioCount: number;
  marked: number;
  onStart: () => boolean;
  onDeleted: () => void;
  onError: (error: unknown) => Promise<void>;
  onSettled: () => void;
}

export const DeleteManualRunDialog = ({
  projectId,
  runId,
  title,
  scenarioCount,
  marked,
  closeDialog,
  onStart,
  onDeleted,
  onError,
  onSettled,
}: DeleteManualRunDialogProps & DefaultDialogProps) => {
  const [deleteRun] = useDeleteManualTestRunMutation();
  const [isPending, setIsPending] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleDelete = async () => {
    if (isPending || !onStart()) return;
    setIsPending(true);

    try {
      await deleteRun({ projectId, runId }).unwrap();
      closeDialog();
      onDeleted();
    } catch (error) {
      closeDialog();
      await onError(error);
    } finally {
      onSettled();
    }
  };

  return (
    <Dialog
      title={`Delete “${title}”?`}
      onClose={closeDialog}
      role="alertdialog"
      placement="center"
      closeOnEscape={false}
      closeOnInteractOutside={false}
      closeTriggerProps={{ display: 'none' }}
      contentProps={{ maxW: '460px', bg: 'bg.panel' }}
      initialFocusEl={() => cancelRef.current}
    >
      <DialogBody>
        <Text>
          This permanently deletes the run, its {scenarioCount} scenarios ({marked} marked), results, comments, defect
          links, and status history. This cannot be undone. Scenarios and suite membership remain in the catalog.
        </Text>
      </DialogBody>

      <DialogFooter>
        <Button ref={cancelRef} variant="outline" disabled={isPending} onClick={closeDialog}>
          Cancel
        </Button>
        <Button colorPalette="red" loading={isPending} disabled={isPending} onClick={handleDelete}>
          Delete run
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
