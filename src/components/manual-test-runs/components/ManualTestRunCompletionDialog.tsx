// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { Alert, Button, Text } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter, NativeSelect } from '@/components/ui';
import type { ManualTestRunStepRead } from '@/redux/apis/generatedApi';

import { getManualTestRunProgressCounts } from '../utils';
import { MANUAL_TEST_RUN_OUTCOMES, type ManualTestRunOutcome } from '../types';

const outcomeLabel = (outcome: ManualTestRunOutcome) => outcome[0].toUpperCase() + outcome.slice(1);

export interface ManualTestRunCompletionDialogProps {
  steps?: ManualTestRunStepRead[];
  isPassedEligible: boolean;
  onCancel: () => void;
  onConfirm: (outcome: ManualTestRunOutcome) => void | Promise<void>;
}

export const ManualTestRunCompletionDialog = ({
  steps = [],
  isPassedEligible,
  onCancel,
  onConfirm,
}: ManualTestRunCompletionDialogProps) => {
  const [outcome, setOutcome] = useState<ManualTestRunOutcome | ''>('');

  useEffect(() => {
    setOutcome('');
  }, []);

  const counts = getManualTestRunProgressCounts(steps);
  const isPassed = outcome === 'passed';

  return (
    <Dialog title="Complete Manual Test Run" onClose={onCancel} role="alertdialog">
      <DialogBody display="flex" flexDir="column" gap={5}>
        <Text fontWeight="medium">Choose the final outcome for this run.</Text>
        <Alert.Root status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>This result is immutable</Alert.Title>
            <Alert.Description>
              After completion, step results and execution notes are read-only. The Run key and Executor can still be
              changed.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
        <Text color="text.secondary">
          Saved results: {counts.passed} passed, {counts.failed} failed, {counts.blocked} blocked, {counts.skipped}{' '}
          skipped · {counts.submitted} of {counts.total} steps submitted
        </Text>
        {!isPassedEligible && !isPassed && (
          <Text fontSize="sm" color="text.secondary">
            Passed requires every step to be passed or skipped, with at least one passed step.
          </Text>
        )}
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
              <Alert.Description>
                Every step must be passed or skipped, with at least one passed step. Other outcomes remain available.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
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
