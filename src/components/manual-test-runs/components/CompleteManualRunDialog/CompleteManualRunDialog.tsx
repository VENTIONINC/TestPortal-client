// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState } from 'react';
import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { FiFlag } from 'react-icons/fi';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import { usePostApiV2ManualTestRunsByRunIdCompleteMutation } from '@/redux/apis/extendedApi';
import type { ManualTestRunRead } from '@/redux/apis/generatedApi';
import type { DefaultDialogProps } from '@/types';

export interface CompleteManualRunDialogProps {
  projectId: string;
  runId: string;
  untestedCount: number;
  scenarioCount: number;
  getTrigger: () => HTMLButtonElement | null;
  onStart: () => boolean;
  onCompleted: (run: ManualTestRunRead) => void;
  onError: (error: unknown) => Promise<void>;
  onSettled: () => void;
}

export const CompleteManualRunDialog = ({
  projectId,
  runId,
  untestedCount,
  scenarioCount,
  getTrigger,
  closeDialog,
  onStart,
  onCompleted,
  onError,
  onSettled,
}: CompleteManualRunDialogProps & DefaultDialogProps) => {
  const [completeRun] = usePostApiV2ManualTestRunsByRunIdCompleteMutation();
  const [isPending, setIsPending] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleComplete = async () => {
    if (isPending || !onStart()) return;
    setIsPending(true);

    try {
      onCompleted(await completeRun({ projectId, runId, body: {} }).unwrap());
    } catch (error) {
      await onError(error);
    } finally {
      closeDialog();
      onSettled();
    }
  };

  const title = (
    <HStack align="center" gap={3}>
      <Box display="grid" placeItems="center" boxSize="40px" flexShrink={0} borderRadius="lg" bg="blue.subtle" color="blue.fg">
        <FiFlag aria-hidden="true" />
      </Box>
      <Text>Complete the run with {untestedCount} untested?</Text>
    </HStack>
  );

  return (
    <Dialog
      title={title}
      onClose={closeDialog}
      role="alertdialog"
      placement="center"
      closeOnEscape={false}
      closeOnInteractOutside={false}
      closeTriggerProps={{ display: 'none' }}
      contentProps={{ maxW: '420px', bg: 'bg.panel' }}
      initialFocusEl={() => cancelRef.current}
      finalFocusEl={getTrigger}
      ids={{ description: 'complete-run-description' }}
    >
      <DialogBody id="complete-run-description" fontSize="14px" lineHeight="1.5" color="text.secondary">
        {untestedCount} of {scenarioCount} {scenarioCount === 1 ? 'scenario has' : 'scenarios have'} no status yet.
        Completing the run marks {untestedCount === 1 ? 'it' : 'them'} as Skipped. The results are locked afterwards;
        reopen the run to change them.
      </DialogBody>

      <DialogFooter>
        <Button ref={cancelRef} variant="outline" disabled={isPending} onClick={closeDialog}>
          Keep testing
        </Button>
        <Button colorPalette="blue" loading={isPending} disabled={isPending} onClick={handleComplete}>
          Complete and skip {untestedCount}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
