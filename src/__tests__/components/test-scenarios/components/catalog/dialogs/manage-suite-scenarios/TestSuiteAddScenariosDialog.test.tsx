// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import { TestSuiteAddScenariosDialog } from '@/components/test-scenarios/components/catalog/dialogs/manage-suite-scenarios/TestSuiteAddScenariosDialog';
import { ChakraProvider } from '@/components/ui';

const { saveMembership } = vi.hoisted(() => ({ saveMembership: vi.fn() }));

vi.mock('@/redux/apis/extendedApi', () => ({
  usePostApiV2TestSuitesBySuiteIdMembershipChangesMutation: () => [saveMembership],
}));
vi.mock('@/redux/apis/generatedApi', () => ({
  useGetApiV2TestScenariosQuery: () => ({
    currentData: {
      scenarios: [
        {
          id: 'scenario-2',
          title: 'Checkout',
          scenarioKey: 'TMS-2',
          priority: 'medium',
        },
      ],
    },
  }),
}));

const renderDialog = () => {
  const closeDialog = vi.fn();
  const onSaved = vi.fn();
  render(
    <ChakraProvider>
      <TestSuiteAddScenariosDialog
        projectId="project-1"
        suiteId="suite-1"
        suiteName="Smoke"
        membershipRevision={8}
        originalIds={['scenario-1']}
        folderOptions={[]}
        unfiledScenarioCount={0}
        totalScenarioCount={2}
        closeDialog={closeDialog}
        closeAllDialogs={vi.fn()}
        onSaved={onSaved}
      />
    </ChakraProvider>,
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Checkout' }));
  return { closeDialog, onSaved };
};

beforeEach(() => saveMembership.mockReset());

it('saves changes against the membership revision captured when the dialog opened', async () => {
  const result = {
    restoreData: { suiteId: 'suite-1', addedScenarioIds: ['scenario-2'], removedMembers: [] },
    membershipRevision: 9,
    scenarioIds: ['scenario-1', 'scenario-2'],
  };
  let finishSave!: () => void;
  saveMembership.mockReturnValue({
    unwrap: () =>
      new Promise((resolve) => {
        finishSave = () => resolve(result);
      }),
  });
  const { closeDialog, onSaved } = renderDialog();

  const save = screen.getByRole('button', { name: 'Save changes' });
  fireEvent.click(save);
  fireEvent.click(save);
  expect(saveMembership).toHaveBeenCalledTimes(1);
  expect(saveMembership).toHaveBeenCalledWith({
    suiteId: 'suite-1',
    body: {
      projectId: 'project-1',
      expectedMembershipRevision: 8,
      expectedScenarioIds: ['scenario-1'],
      addScenarioIds: ['scenario-2'],
      removeScenarioIds: [],
    },
  });
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

  await act(async () => finishSave());
  expect(closeDialog).toHaveBeenCalledOnce();
  expect(onSaved).toHaveBeenCalledWith({
    restoreData: result.restoreData,
    expectedMembershipRevision: 9,
    expectedScenarioIds: result.scenarioIds,
  });
});

it('shows a failed save and retains the draft selection', async () => {
  saveMembership.mockReturnValue({ unwrap: () => Promise.reject(new Error('Membership changed')) });
  const { closeDialog, onSaved } = renderDialog();
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Membership changed');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
  expect(closeDialog).not.toHaveBeenCalled();
  expect(onSaved).not.toHaveBeenCalled();
});
