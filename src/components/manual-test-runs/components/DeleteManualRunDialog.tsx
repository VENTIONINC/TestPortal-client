// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Button, Text } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';

interface DeleteManualRunDialogProps {
  title: string | undefined;
  scenarioCount: number;
  marked: number;
  writesBlocked: boolean;
  onCancel: () => void;
  onDelete: () => void;
}

export const DeleteManualRunDialog = ({
  title,
  scenarioCount,
  marked,
  writesBlocked,
  onCancel,
  onDelete,
}: DeleteManualRunDialogProps) => {
  return (
    <Dialog
      title={`Delete “${title}”?`}
      onClose={onCancel}
      role="alertdialog"
      placement="center"
      closeOnEscape={false}
      closeOnInteractOutside={false}
      closeTriggerProps={{ display: 'none' }}
      contentProps={{ maxW: '460px', bg: 'bg.panel' }}
    >
      <DialogBody>
        <Text>
          This permanently deletes the run, its {scenarioCount} scenarios ({marked} marked), results, comments, defect
          links, and status history. This cannot be undone. Scenarios and suite membership remain in the catalog.
        </Text>
      </DialogBody>

      <DialogFooter>
        <Button variant="outline" disabled={writesBlocked} onClick={onCancel}>
          Cancel
        </Button>
        <Button colorPalette="red" disabled={writesBlocked} onClick={onDelete}>
          Delete run
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
