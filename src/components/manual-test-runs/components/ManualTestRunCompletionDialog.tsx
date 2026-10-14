// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { Alert, Button, Text } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter, NativeSelect } from '@/components/ui';

import { MANUAL_TEST_RUN_OUTCOMES, type ManualTestRunOutcome } from '../types';

const outcomeLabel = (outcome: ManualTestRunOutcome) => outcome[0].toUpperCase() + outcome.slice(1);

export interface ManualTestRunCompletionDialogProps {
  isPassedEligible: boolean;
  onCancel: () => void;
  onConfirm: (outcome: ManualTestRunOutcome) => void | Promise<void>;
}

export const ManualTestRunCompletionDialog = ({
  isPassedEligible,
  onCancel,
  onConfirm,
}: ManualTestRunCompletionDialogProps) => {
  const [outcome, setOutcome] = useState<ManualTestRunOutcome | ''>('');

  useEffect(() => {
    setOutcome('');
  }, []);

  const isPassed = outcome === 'passed';

  return (
    <Dialog title="Complete Manual Test Run" onClose={onCancel} role="alertdialog">
      <DialogBody display="flex" flexDir="column" gap={5}>
        <Text fontWeight="medium">Choose the final outcome for this run.</Text>
        <Alert.Root status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>This result is immutable</Alert.Title>
            <Alert.Description>After completion, the run cannot be edited or reopened.</Alert.Description>
          </Alert.Content>
        </Alert.Root>
        <NativeSelect
          name="completion-outcome"
          label="Final outcome"
          placeholder="Select an outcome"
          value={outcome}
          onChange={(event) => setOutcome(event.target.value as ManualTestRunOutcome | '')}
          items={MANUAL_TEST_RUN_OUTCOMES.map((item) => ({ value: item, label: outcomeLabel(item) }))}
        />
        {isPassed && !isPassedEligible && (
          <Alert.Root status="error" role="alert">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Passed completion is not eligible</Alert.Title>
              <Alert.Description>Every step must be passed or skipped, with at least one passed step. Other outcomes remain available.</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button
          type="button"
          onClick={() => {
            if (outcome) void onConfirm(outcome);
          }}
          disabled={!outcome || (isPassed && !isPassedEligible)}
        >
          Complete run
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
