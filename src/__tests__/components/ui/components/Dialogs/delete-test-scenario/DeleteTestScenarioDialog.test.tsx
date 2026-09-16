// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DeleteTestScenarioDialog,
  type DeleteTestScenarioDialogProps,
} from '@/components/ui/components/Dialogs/delete-test-scenario/delete-test-scenario-dialog';
import { ChakraProvider, toaster } from '@/components/ui';
import { useDeleteApiV2TestScenariosByScenarioIdMutation } from '@/redux/apis/generatedApi';

const deleteScenario = vi.fn();
const closeDialog = vi.fn();
const onDeleted = vi.fn();

vi.mock('@/redux/apis/generatedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/generatedApi')>();

  return { ...actual, useDeleteApiV2TestScenariosByScenarioIdMutation: vi.fn() };
});

const mockedDeleteMutation = vi.mocked(useDeleteApiV2TestScenariosByScenarioIdMutation);

const defaultProps: DeleteTestScenarioDialogProps = {
  scenarioId: 'scenario-1',
  projectId: 'project-1',
  scenarioTitle: 'Checkout flow',
  closeDialog,
  closeAllDialogs: vi.fn(),
  onDeleted,
};

const renderDialog = (props: Partial<DeleteTestScenarioDialogProps> = {}) =>
  render(
    <ChakraProvider>
      <DeleteTestScenarioDialog {...defaultProps} {...props} />
    </ChakraProvider>,
  );

describe('DeleteTestScenarioDialog', () => {
  beforeEach(() => {
    deleteScenario.mockReset();
    closeDialog.mockReset();
    onDeleted.mockReset();
    vi.spyOn(toaster, 'create').mockClear();
    mockedDeleteMutation.mockReturnValue([deleteScenario, { isLoading: false }] as never);
  });

  it('opens with the persisted title and an empty disabled confirmation', () => {
    renderDialog();

    expect(screen.getByRole('alertdialog')).toHaveTextContent('Checkout flow');
    expect(screen.getByRole('textbox', { name: 'Scenario title' })).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Confirm Test Scenario deletion' })).toBeDisabled();
  });

  it.each(['checkout flow', 'Checkout flow ', ' Checkout flow', ''])('does not permit non-exact title %j', async (value) => {
    const user = userEvent.setup();

    renderDialog();
    const input = screen.getByRole('textbox', { name: 'Scenario title' });
    if (value) await user.type(input, value);

    expect(screen.getByRole('button', { name: 'Confirm Test Scenario deletion' })).toBeDisabled();
    expect(deleteScenario).not.toHaveBeenCalled();
  });

  it('permits only an exact case- and whitespace-sensitive title and sends both identities', async () => {
    const user = userEvent.setup();
    deleteScenario.mockReturnValue({ unwrap: () => Promise.resolve(undefined) });

    renderDialog();
    const input = screen.getByRole('textbox', { name: 'Scenario title' });
    await user.type(input, 'Checkout flow');

    const confirm = screen.getByRole('button', { name: 'Confirm Test Scenario deletion' });
    expect(confirm).toBeEnabled();
    await user.click(confirm);

    await waitFor(() => expect(deleteScenario).toHaveBeenCalledWith({ scenarioId: 'scenario-1', projectId: 'project-1' }));
    expect(closeDialog).toHaveBeenCalledTimes(1);
    expect(onDeleted).toHaveBeenCalledTimes(1);
  });

  it('preserves a matching input after an API failure and allows one retry', async () => {
    const user = userEvent.setup();
    deleteScenario
      .mockReturnValueOnce({ unwrap: () => Promise.reject({ status: 409, data: { error: 'Delete failed' } }) })
      .mockReturnValueOnce({ unwrap: () => Promise.resolve(undefined) });

    renderDialog();
    const input = screen.getByRole('textbox', { name: 'Scenario title' });
    await user.type(input, 'Checkout flow');
    await user.click(screen.getByRole('button', { name: 'Confirm Test Scenario deletion' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Delete failed'));
    expect(input).toHaveValue('Checkout flow');
    expect(closeDialog).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Confirm Test Scenario deletion' }));
    await waitFor(() => expect(deleteScenario).toHaveBeenCalledTimes(2));
    expect(closeDialog).toHaveBeenCalledTimes(1);
    expect(onDeleted).toHaveBeenCalledTimes(1);
  });

  it('supports cancellation and prevents duplicate confirmation while pending', async () => {
    const user = userEvent.setup();
    let resolveDelete!: () => void;
    deleteScenario.mockReturnValue({ unwrap: () => new Promise<void>((resolve) => (resolveDelete = resolve)) });

    const { unmount } = renderDialog();
    const input = screen.getByRole('textbox', { name: 'Scenario title' });
    await user.type(input, 'Checkout flow');
    const confirm = screen.getByRole('button', { name: 'Confirm Test Scenario deletion' });
    await user.click(confirm);

    expect(confirm).toBeDisabled();
    await user.click(confirm);
    expect(deleteScenario).toHaveBeenCalledTimes(1);

    resolveDelete();
    await waitFor(() => expect(closeDialog).toHaveBeenCalledTimes(1));

    unmount();
    closeDialog.mockReset();
    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(closeDialog).toHaveBeenCalledTimes(1);
    expect(deleteScenario).toHaveBeenCalledTimes(1);
  });

  it('resets confirmation input when the dialog receives another scenario', async () => {
    const user = userEvent.setup();
    const { rerender } = renderDialog();
    const input = screen.getByRole('textbox', { name: 'Scenario title' });
    await user.type(input, 'Checkout flow');

    rerender(
      <ChakraProvider>
        <DeleteTestScenarioDialog
          {...defaultProps}
          scenarioId="scenario-2"
          scenarioTitle="Refund flow"
        />
      </ChakraProvider>,
    );

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Scenario title' })).toHaveValue(''));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Refund flow');
  });
});
