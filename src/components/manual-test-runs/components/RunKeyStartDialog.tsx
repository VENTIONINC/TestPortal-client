// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Text } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter, Input } from '@/components/ui';
import { createReadableLabelSchema } from '@/schemas';

export interface RunKeyStartDialogProps {
  isOpen: boolean;
  context: 'start' | 'retest';
  value: string;
  error?: string;
  isUncertain?: boolean;
  isRetryConfirmationRequired?: boolean;
  isSubmitting?: boolean;
  onValueChange: (value: string) => void;
  onCancel: () => void;
  onRequireRetryConfirmation: () => void;
  onSubmit: (runKey?: string) => void;
}

export const RunKeyStartDialog = ({
  isOpen,
  context,
  value,
  error,
  isUncertain = false,
  isRetryConfirmationRequired = false,
  isSubmitting = false,
  onValueChange,
  onCancel,
  onRequireRetryConfirmation,
  onSubmit,
}: RunKeyStartDialogProps) => {
  const [validationError, setValidationError] = useState<string>();

  useEffect(() => {
    if (isOpen) setValidationError(undefined);
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = createReadableLabelSchema('Run key').safeParse(value);
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? 'Enter a valid Run key.');
      return;
    }

    setValidationError(undefined);
    if (isUncertain && !isRetryConfirmationRequired) {
      onRequireRetryConfirmation();
      return;
    }

    onSubmit(result.data || undefined);
  };

  return (
    <Dialog title="Start manual run" onClose={onCancel} contentProps={{ maxW: 'md', w: 'full' }}>
      <form onSubmit={submit}>
        <DialogBody display="flex" flexDir="column" gap={5}>
          <Text color="text.secondary">
            {context === 'retest'
              ? 'This starts a new run using the current saved scenario content and steps. It does not change this historical run.'
              : 'Start a new run from the current saved scenario content and steps.'}
          </Text>
          {error && (
            <Alert.Root status={isUncertain ? 'warning' : 'error'} role="alert">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{isUncertain ? 'Start result is uncertain' : 'Run was not started'}</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}
          {isRetryConfirmationRequired && (
            <Alert.Root status="warning" role="alert">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Confirm another start</Alert.Title>
                <Alert.Description>
                  The earlier request may have created a run. Inspect run history before continuing; starting again could create a duplicate.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}
          <Input
            autoFocus
            name="runKey"
            label="Run key (optional)"
            placeholder="e.g. RUN-1"
            value={value}
            onChange={(event) => {
              onValueChange(event.target.value);
              setValidationError(undefined);
            }}
            fieldProps={{ helperText: 'Up to 100 characters. Duplicate keys are allowed.' }}
            error={validationError}
          />
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            {isRetryConfirmationRequired ? 'Start another run' : 'Start run'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
