// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { ManageScenariosDialog } from '@/components/manual-test-runs/components/ManageScenariosDialog/ManageScenariosDialog';
import { SelectScenariosDialog } from '@/components/manual-test-runs/components/ManageScenariosDialog/SelectScenariosDialog';
import type { ExistingRunScenario } from '@/components/manual-test-runs/components/ManageScenariosDialog/ScenarioSelectionTable';
import type { ManualTestRunRead } from '@/redux/apis/generatedApi';

const scenariosData = {
  scenarios: [
    { id: 'a', scenarioKey: 'A-1', title: 'Existing', folderName: null, priority: 'high' },
    { id: 'b', scenarioKey: 'B-1', title: 'New', folderName: null, priority: 'low' },
  ],
  total: 2,
  totalPages: 1,
};
const suitesData = [
  { id: 'one', name: 'Smoke', members: [{ testScenarioId: 'a' }] },
  { id: 'two', name: 'Regression', members: [{ testScenarioId: 'a' }, { testScenarioId: 'b' }] },
];
const loadScenarios = vi.fn();
const saveDetails = vi.fn();
vi.mock('@/redux/apis/generatedApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/redux/apis/generatedApi')>()),
  useGetApiV2TestScenariosQuery: () => ({ currentData: scenariosData }),
  useLazyGetApiV2TestScenariosQuery: () => [loadScenarios],
  useGetApiV2TestScenarioFoldersQuery: () => ({ currentData: [] }),
  usePutApiV2ManualTestRunsByRunIdDetailsMutation: () => [saveDetails],
  useGetApiV2TestSuitesQuery: () => ({ currentData: suitesData }),
}));

const dialogControls = {
  closeDialog: () => {},
  closeAllDialogs: () => {},
};

const pickerProps = {
  ...dialogControls,
  projectId: 'p',
  existing: [],
  initialIds: [],
  onSelectionChange: () => {},
  finalFocusEl: () => null,
};

const manageProps = (existing: ExistingRunScenario[]) => {
  const run: ManualTestRunRead = {
    id: 'r',
    projectId: 'p',
    title: 'Run',
    status: 'in_progress',
    executedById: null,
    executedBy: null,
    startedAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    completedAt: null,
    completedById: null,
    completedBy: null,
    skippedAtCompletion: 0,
    hasBeenReopened: false,
    environmentProperties: [],
    browser: null,
    operatingSystem: null,
    device: null,
    apiEnvironment: null,
    build: null,
    deployment: null,
    scenarios: existing.map((scenario, position) => ({
      ...scenario,
      id: 'run-' + scenario.sourceScenarioId,
      sourceScenarioKey: scenario.sourceScenarioId,
      title: 'Scenario ' + scenario.sourceScenarioId,
      position,
      details: null,
      preconditions: null,
      testData: null,
      folderPath: null,
      priority: 'low',
      requirementContext: [],
      executionComment: null,
      defectReference: null,
      assigneeId: null,
      assignee: null,
      resultById: null,
      resultBy: null,
      resultAt: null,
      resultHistory: [],
      steps: [],
    })),
  };
  saveDetails.mockReturnValue({ unwrap: () => Promise.resolve(run) });
  return {
    ...dialogControls,
    projectId: 'p',
    runId: 'r',
    runTitle: 'Run',
    existing,
    getRun: () => run,
    mutate: async (operation: (id: string) => Promise<ManualTestRunRead>) => {
      await operation('r');
      return true;
    },
  };
};

it('shows existing results and summarizes membership changes before saving', async () => {
  saveDetails.mockClear();
  render(
    <ChakraProvider>
      <ManageScenariosDialog {...manageProps([{ sourceScenarioId: 'a', result: 'passed' }])} />
    </ChakraProvider>,
  );
  const user = userEvent.setup();
  expect(screen.getByText('Passed')).toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', { name: 'Select New' }));
  expect(screen.getByText('1 to add as Untested · 0 to remove')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(saveDetails).toHaveBeenCalledWith({
    projectId: 'p',
    runId: 'r',
    manualTestRunDetailsRequest: { title: 'Run', environmentProperties: [], scenarioIds: ['a', 'b'] },
  });
});

it('filters by multiple suites, shows counts, searches and clears the filter', async () => {
  render(
    <ChakraProvider>
      <SelectScenariosDialog {...pickerProps} />
    </ChakraProvider>,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Suite' }));
  expect(screen.getByText('Smoke').closest('label')).toHaveTextContent('1');
  expect(screen.getByText('Regression').closest('label')).toHaveTextContent('2');
  await user.type(screen.getByRole('textbox', { name: 'Search suites' }), 'smoke');
  expect(screen.queryByText('Regression')).not.toBeInTheDocument();
  await user.clear(screen.getByRole('textbox', { name: 'Search suites' }));
  await user.click(screen.getByRole('checkbox', { name: 'Smoke' }));
  expect(await screen.findByRole('checkbox', { name: 'Select Existing' })).toBeInTheDocument();
  expect(screen.queryByRole('checkbox', { name: 'Select New' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', { name: 'Regression' }));
  expect(await screen.findByRole('checkbox', { name: 'Select New' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Clear' }));
  expect(screen.getByRole('button', { name: 'Suite' })).toBeInTheDocument();
});

it('shows the number and result breakdown when removing a marked scenario', async () => {
  saveDetails.mockClear();
  const existing = [
    { sourceScenarioId: 'a', result: 'passed' as const },
    { sourceScenarioId: 'b', result: 'untested' as const },
  ];
  render(
    <ChakraProvider>
      <ManageScenariosDialog {...manageProps(existing)} />
    </ChakraProvider>,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole('checkbox', { name: 'Select Existing' }));
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(saveDetails).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent('1 saved results (1 passed)');
  await user.click(screen.getByRole('checkbox', { name: 'Select Existing' }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', { name: 'Select Existing' }));
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  await user.click(screen.getByRole('button', { name: 'Remove results and save' }));
  expect(saveDetails).toHaveBeenCalledOnce();
});

it('applies a draft selection without saving the run', async () => {
  const onSelectionChange = vi.fn();
  render(
    <ChakraProvider>
      <SelectScenariosDialog
        {...pickerProps}
        existing={[{ sourceScenarioId: 'a', result: 'passed' }]}
        initialIds={['b']}
        onSelectionChange={onSelectionChange}
      />
    </ChakraProvider>,
  );
  const user = userEvent.setup();
  expect(screen.getByRole('checkbox', { name: 'Select New' })).toBeChecked();
  await user.click(screen.getByRole('checkbox', { name: 'Select Existing' }));
  await user.click(screen.getByRole('button', { name: 'Done' }));
  expect(onSelectionChange).toHaveBeenCalledWith(['b', 'a']);
});

it('shows the suite name for one selection and the count for multiple selections', async () => {
  render(
    <ChakraProvider>
      <SelectScenariosDialog {...pickerProps} />
    </ChakraProvider>,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Suite' }));
  await user.click(screen.getByRole('checkbox', { name: 'Smoke' }));
  expect(screen.getByRole('button', { name: 'Suite: Smoke' })).toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', { name: 'Regression' }));
  expect(screen.getByRole('button', { name: 'Suite: 2' })).toBeInTheDocument();
});
