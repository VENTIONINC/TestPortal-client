// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DeleteTestScenarioDialog } from '@/components/ui/components/Dialogs/delete-test-scenario/delete-test-scenario-dialog';
import { ChakraProvider, toaster } from '@/components/ui';
import { useDeleteApiV2TestScenariosByScenarioIdMutation } from '@/redux/apis/extendedApi';
import { useGetApiV2TestScenariosByScenarioIdQuery } from '@/redux/apis/generatedApi';
const remove = vi.fn();
const closeDialog = vi.fn();
const onDeleted = vi.fn();
vi.mock('@/redux/apis/extendedApi', async (original) => ({ ...(await original<typeof import('@/redux/apis/extendedApi')>()), useDeleteApiV2TestScenariosByScenarioIdMutation: vi.fn() }));
vi.mock('@/redux/apis/generatedApi', async (original) => ({ ...(await original<typeof import('@/redux/apis/generatedApi')>()), useGetApiV2TestScenariosByScenarioIdQuery: vi.fn() }));
const renderDialog = () => render(<ChakraProvider><DeleteTestScenarioDialog scenarioId="scenario-1" projectId="project-1" scenarioTitle="Checkout flow" closeDialog={closeDialog} closeAllDialogs={vi.fn()} onDeleted={onDeleted} /></ChakraProvider>);
describe('DeleteTestScenarioDialog', () => {
  beforeEach(() => {
    remove.mockReset(); closeDialog.mockReset(); onDeleted.mockReset(); vi.spyOn(toaster, 'create').mockClear();
    vi.mocked(useDeleteApiV2TestScenariosByScenarioIdMutation).mockReturnValue([remove, { isLoading: false }] as never);
    vi.mocked(useGetApiV2TestScenariosByScenarioIdQuery).mockReturnValue({ currentData: { id: 'scenario-1', projectId: 'project-1', suites: [{ id: 's', name: 'Smoke' }] }, isFetching: false } as never);
  });
  it('identifies the scenario and suites, explains history, and deletes without typing', async () => {
    remove.mockReturnValue({ unwrap: async () => undefined });
    renderDialog();
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Checkout flow');
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Smoke');
    expect(screen.getByRole('alertdialog')).toHaveTextContent('snapshots are preserved');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Confirm Test Scenario deletion' }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith({ scenarioId: 'scenario-1', projectId: 'project-1' }));
    expect(onDeleted).toHaveBeenCalledOnce();
    expect(closeDialog).toHaveBeenCalledOnce();
    expect(toaster.create).not.toHaveBeenCalled();
  });
  it('keeps the dialog open after failure and allows retry', async () => {
    remove.mockReturnValueOnce({ unwrap: async () => { throw { status: 409, data: { error: 'Delete failed' } }; } }).mockReturnValueOnce({ unwrap: async () => undefined });
    renderDialog();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Confirm Test Scenario deletion' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Delete failed');
    expect(closeDialog).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Confirm Test Scenario deletion' }));
    await waitFor(() => expect(remove).toHaveBeenCalledTimes(2));
  });
  it('shows unavailable impact rather than claiming no suites while loading or on error', () => {
    vi.mocked(useGetApiV2TestScenariosByScenarioIdQuery).mockReturnValue({ currentData: undefined, isFetching: true } as never);
    const view = renderDialog();
    expect(screen.getByText(/Loading affected suites/)).toBeInTheDocument();
    vi.mocked(useGetApiV2TestScenariosByScenarioIdQuery).mockReturnValue({ currentData: undefined, isFetching: false, isError: true } as never);
    view.rerender(<ChakraProvider><DeleteTestScenarioDialog scenarioId="scenario-1" projectId="project-1" scenarioTitle="Checkout flow" closeDialog={closeDialog} closeAllDialogs={vi.fn()} /></ChakraProvider>);
    expect(screen.getByText(/Affected suites could not be loaded/)).toBeInTheDocument();
  });
  it('does not present cached suite names as current after a failed refresh', () => {
    vi.mocked(useGetApiV2TestScenariosByScenarioIdQuery).mockReturnValue({ currentData: { id: 'scenario-1', projectId: 'project-1', suites: [{ id: 's', name: 'Stale suite' }] }, isFetching: false, isError: true } as never);
    renderDialog();
    expect(screen.getByText(/Affected suites could not be loaded/)).toBeInTheDocument();
    expect(screen.queryByText(/Stale suite/)).not.toBeInTheDocument();
  });
  it('cancels without sending a request', async () => {
    renderDialog();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Cancel' }));
    expect(closeDialog).toHaveBeenCalledOnce();
    expect(remove).not.toHaveBeenCalled();
  });
  it('prevents duplicate deletion while a request is pending', async () => {
    let finish!: () => void;
    remove.mockReturnValue({ unwrap: () => new Promise<void>((resolve) => { finish = resolve; }) });
    renderDialog();
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: 'Confirm Test Scenario deletion' });
    await user.click(button);
    expect(button).toBeDisabled();
    await user.click(button);
    expect(remove).toHaveBeenCalledOnce();
    finish();
    await waitFor(() => expect(closeDialog).toHaveBeenCalledOnce());
  });
});
