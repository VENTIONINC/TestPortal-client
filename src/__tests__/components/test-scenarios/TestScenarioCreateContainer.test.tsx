// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TestScenarioCreateContainer } from '@/components/test-scenarios/containers/TestScenarioCreateContainer';
import { ChakraProvider } from '@/components/ui';
const { navigate, createScenario } = vi.hoisted(() => ({ navigate: vi.fn(), createScenario: vi.fn() }));
vi.mock('react-router', async (original) => ({
  ...(await original<typeof import('react-router')>()),
  useNavigate: () => navigate,
}));
vi.mock('@/redux/apis/generatedApi', async (original) => ({
  ...(await original<typeof import('@/redux/apis/generatedApi')>()),
  usePostApiV2TestScenariosMutation: () => [createScenario, { isLoading: false }],
}));
vi.mock('@/redux/apis/extendedApi', async (original) => ({
  ...(await original<typeof import('@/redux/apis/extendedApi')>()),
  useGetApiV2TestScenarioFoldersQuery: () => ({ currentData: [{ id: 'folder-1', name: 'Authentication' }] }),
  useGetApiV2TestSuitesQuery: () => ({ currentData: [{ id: 'suite-1', name: 'Regression', members: [{}, {}] }] }),
}));
const setup = () =>
  render(
    <ChakraProvider>
      <TestScenarioCreateContainer projectId="project-1" initialFolderId="folder-1" />
    </ChakraProvider>,
  );
const change = (name: string, value: string) =>
  fireEvent.change(screen.getByRole('textbox', { name }), { target: { value } });
const save = () => fireEvent.click(screen.getByRole('button', { name: 'Save scenario' }));
beforeEach(() => {
  navigate.mockReset();
  createScenario.mockReset();
});
describe('TestScenarioCreateContainer', () => {
  it('saves fields, steps and deferred suites in one request without keys or step IDs', async () => {
    createScenario.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'returned-id' }) });
    setup();
    change('Title', '  Scenario  ');
    change('Step 1 action', '  Open  ');
    fireEvent.click(screen.getByRole('button', { name: 'Select suites' }));
    expect(screen.getByText('2 scenarios')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Regression/ }));
    change('Search or create suite', ' Release ');
    fireEvent.click(screen.getByRole('button', { name: 'Create “Release”' }));
    expect(createScenario).not.toHaveBeenCalled();
    save();
    await waitFor(() => expect(createScenario).toHaveBeenCalledOnce());
    expect(createScenario).toHaveBeenCalledWith({
      createTestScenarioRequest: {
        projectId: 'project-1',
        folderId: 'folder-1',
        title: 'Scenario',
        priority: 'medium',
        steps: [{ action: 'Open' }],
        suiteIds: ['suite-1'],
        newSuites: [{ name: 'Release' }],
      },
    });
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/test-scenarios/returned-id', { replace: true }));
  });
  it('saves untouched initial row as zero steps', async () => {
    createScenario.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'id' }) });
    setup();
    change('Title', 'Scenario');
    save();
    await waitFor(() => expect(createScenario).toHaveBeenCalledOnce());
    expect(createScenario.mock.calls[0][0].createTestScenarioRequest.steps).toEqual([]);
  });
  it('preserves draft and explains an uncertain create without retrying automatically', async () => {
    createScenario.mockReturnValue({ unwrap: () => Promise.reject({ status: 'FETCH_ERROR' }) });
    setup();
    change('Title', 'Draft');
    change('Step 1 action', 'Action');
    save();
    expect(await screen.findByText(/The save result is uncertain/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inspect scenario catalog' })).toHaveAttribute('href', '/test-scenarios?projectId=project-1');
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Draft');
    expect(screen.getByRole('textbox', { name: 'Step 1 action' })).toHaveValue('Action');
    expect(createScenario).toHaveBeenCalledOnce();
    expect(navigate).not.toHaveBeenCalled();
  });
  it('freezes all draft mutations during save and suppresses duplicate submission', async () => {
    createScenario.mockReturnValue({ unwrap: () => new Promise(() => {}) });
    setup();
    change('Title', 'Draft');
    save();
    save();
    await waitFor(() => expect(createScenario).toHaveBeenCalledOnce());
    expect(screen.getByRole('textbox', { name: 'Title' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add step' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Select suites' })).toBeDisabled();
  });
  it('returns to the currently selected folder without creating pending suites', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(navigate).toHaveBeenCalledWith('/test-scenarios?projectId=project-1&folderId=folder-1');
    expect(createScenario).not.toHaveBeenCalled();
  });
  it('ignores a response after scope unmount', async () => {
    let resolve!: (value: { id: string }) => void;
    createScenario.mockReturnValue({
      unwrap: () =>
        new Promise((r) => {
          resolve = r;
        }),
    });
    const view = setup();
    change('Title', 'Draft');
    save();
    await waitFor(() => expect(createScenario).toHaveBeenCalledOnce());
    view.unmount();
    resolve({ id: 'late' });
    await Promise.resolve();
    expect(navigate).not.toHaveBeenCalled();
  });
});
