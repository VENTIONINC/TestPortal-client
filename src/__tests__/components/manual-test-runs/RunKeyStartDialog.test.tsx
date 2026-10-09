// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RunKeyStartDialog } from '@/components/manual-test-runs/components/RunKeyStartDialog';
import { ChakraProvider } from '@/components/ui';

const renderDialog = (props: Partial<React.ComponentProps<typeof RunKeyStartDialog>> = {}) => {
  const onCancel = vi.fn();
  const onSubmit = vi.fn();
  const onValueChange = vi.fn();
  const onRequireRetryConfirmation = vi.fn();
  const view = render(
    <ChakraProvider>
      <RunKeyStartDialog
        isOpen
        context="start"
        value=""
        onValueChange={onValueChange}
        onCancel={onCancel}
        onRequireRetryConfirmation={onRequireRetryConfirmation}
        onSubmit={onSubmit}
        {...props}
      />
    </ChakraProvider>,
  );

  return { ...view, onCancel, onSubmit, onValueChange, onRequireRetryConfirmation };
};

describe('RunKeyStartDialog', () => {
  it('opens with an empty optional key input and shows Retest context', () => {
    renderDialog({ context: 'retest' });

    const input = screen.getByRole('textbox', { name: 'Run key (optional)' });
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', 'e.g. RUN-1');
    expect(screen.getByText('Up to 100 characters. Duplicate keys are allowed.')).toBeInTheDocument();
    expect(screen.getByText(/current saved scenario content and steps/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start run' })).toBeInTheDocument();
  });

  it('trims a valid key, omits blank input and blocks invalid values', async () => {
    const user = userEvent.setup();
    const { onSubmit, unmount } = renderDialog({ value: '  RUN-1  ' });
    await user.click(screen.getByRole('button', { name: 'Start run' }));
    expect(onSubmit).toHaveBeenCalledWith('RUN-1');
    unmount();

    const invalid = renderDialog({ value: 'RUN\n1' });
    await user.click(screen.getByRole('button', { name: 'Start run' }));
    expect(screen.getByText('Run key must be a single line')).toBeInTheDocument();
    expect(invalid.onSubmit).not.toHaveBeenCalled();
    expect(invalid.onRequireRetryConfirmation).not.toHaveBeenCalled();
  });

  it('submits no key for whitespace-only input', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog({ value: '  \t ' });

    await user.click(screen.getByRole('button', { name: 'Start run' }));
    expect(onSubmit).toHaveBeenCalledWith(undefined);
  });

  it('requires explicit confirmation before retrying an uncertain start', async () => {
    const user = userEvent.setup();
    const { onSubmit, onRequireRetryConfirmation } = renderDialog({
      error: 'Inspect history before trying again.',
      isUncertain: true,
    });

    await user.click(screen.getByRole('button', { name: 'Start run' }));
    expect(onRequireRetryConfirmation).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Inspect history before trying again.');
  });

  it('cancels without submitting', async () => {
    const user = userEvent.setup();
    const { onCancel, onSubmit } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
