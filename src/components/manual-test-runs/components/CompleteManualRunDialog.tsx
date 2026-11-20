// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { RefObject } from 'react';
import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { FiFlag } from 'react-icons/fi';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';

interface CompleteManualRunDialogProps {
  untestedCount: number;
  scenarioCount: number | undefined;
  writesBlocked: boolean;
  cancelRef: RefObject<HTMLButtonElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onCancel: () => void;
  onComplete: () => void;
}

export const CompleteManualRunDialog = ({
  untestedCount,
  scenarioCount,
  writesBlocked,
  cancelRef,
  triggerRef,
  onCancel,
  onComplete,
}: CompleteManualRunDialogProps) => {
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
      onClose={onCancel}
      role="alertdialog"
      placement="center"
      closeOnEscape={false}
      closeOnInteractOutside={false}
      closeTriggerProps={{ display: 'none' }}
      contentProps={{ maxW: '420px', bg: 'bg.panel' }}
      initialFocusEl={() => cancelRef.current}
      finalFocusEl={() => triggerRef.current}
      ids={{ description: 'complete-run-description' }}
    >
      <DialogBody id="complete-run-description" fontSize="14px" lineHeight="1.5" color="text.secondary">
        {untestedCount} of {scenarioCount} {scenarioCount === 1 ? 'scenario has' : 'scenarios have'} no status yet.
        Completing the run marks {untestedCount === 1 ? 'it' : 'them'} as Skipped. The results are locked afterwards;
        reopen the run to change them.
      </DialogBody>

      <DialogFooter>
        <Button ref={cancelRef} variant="outline" disabled={writesBlocked} onClick={onCancel}>
          Keep testing
        </Button>
        <Button colorPalette="blue" disabled={writesBlocked} onClick={onComplete}>
          Complete and skip {untestedCount}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
