// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { ManageScenariosDialog } from '@/components/manual-test-runs/components/ManageScenariosDialog';

const scenariosData = { scenarios: [
  { id: 'a', scenarioKey: 'A-1', title: 'Existing', folderName: null, priority: 'high' },
  { id: 'b', scenarioKey: 'B-1', title: 'New', folderName: null, priority: 'low' },
], total: 2, totalPages: 1 };
const suitesData = [
  { id: 'one', name: 'Smoke', members: [{ testScenarioId: 'a' }] },
  { id: 'two', name: 'Regression', members: [{ testScenarioId: 'a' }, { testScenarioId: 'b' }] },
];
const loadScenarios = vi.fn();
vi.mock('@/redux/apis/generatedApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/redux/apis/generatedApi')>()),
  useGetApiV2TestScenariosQuery: () => ({ currentData: scenariosData }),
  useLazyGetApiV2TestScenariosQuery: () => [loadScenarios],
  useGetApiV2TestScenarioFoldersQuery: () => ({ currentData: [] }),
  useGetApiV2TestSuitesQuery: () => ({ currentData: suitesData }),
}));

it('shows existing results and summarizes membership changes before saving', async () => {
  const onSave = vi.fn();
  render(<ChakraProvider><ManageScenariosDialog projectId="p" runTitle="Run" existing={[{sourceScenarioId: 'a', result: 'passed'}]} onSave={onSave} onClose={() => {}} saving={false} /></ChakraProvider>);
  const user = userEvent.setup();
  expect(screen.getByText('Passed')).toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', { name: 'Select New' }));
  expect(screen.getByText('1 to add as Untested · 0 to remove')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(onSave).toHaveBeenCalledWith(['a', 'b']);
});

it('filters by multiple suites, shows counts, searches and clears the filter', async () => {
  render(<ChakraProvider><ManageScenariosDialog projectId="p" runTitle="Run" existing={[]} onSave={() => {}} onClose={() => {}} saving={false} pickerMode /></ChakraProvider>);
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
  const onSave = vi.fn();
  const existing = [{ sourceScenarioId: 'a', result: 'passed' as const }, { sourceScenarioId: 'b', result: 'untested' as const }];
  const view = render(<ChakraProvider><ManageScenariosDialog projectId="p" runTitle="Run" existing={existing} onSave={onSave} onClose={() => {}} saving={false} /></ChakraProvider>);
  const user = userEvent.setup();
  await user.click(screen.getByRole('checkbox', { name: 'Select Existing' }));
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(onSave).toHaveBeenCalledWith(['b']);
  view.rerender(<ChakraProvider><ManageScenariosDialog projectId="p" runTitle="Run" existing={existing} onSave={onSave} onClose={() => {}} saving={false} warning /></ChakraProvider>);
  expect(screen.getByRole('alert')).toHaveTextContent('1 saved results (1 passed)');
  expect(screen.getByRole('button', { name: 'Remove results and save' })).toBeEnabled();
});

it('applies a draft selection without saving the run', async () => {
  const onSave = vi.fn();
  render(<ChakraProvider><ManageScenariosDialog projectId="p" runTitle="Run" existing={[{ sourceScenarioId: 'a', result: 'passed' }]} initialIds={['b']} pickerMode onSave={onSave} onClose={() => {}} saving={false} /></ChakraProvider>);
  const user = userEvent.setup();
  expect(screen.getByRole('checkbox', { name: 'Select New' })).toBeChecked();
  await user.click(screen.getByRole('checkbox', { name: 'Select Existing' }));
  await user.click(screen.getByRole('button', { name: 'Done' }));
  expect(onSave).toHaveBeenCalledWith(['b', 'a']);
});

it('shows the suite name for one selection and the count for multiple selections', async () => {
  render(<ChakraProvider><ManageScenariosDialog projectId="p" runTitle="Run" existing={[]} onSave={() => {}} onClose={() => {}} saving={false} pickerMode /></ChakraProvider>);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Suite' }));
  await user.click(screen.getByRole('checkbox', { name: 'Smoke' }));
  expect(screen.getByRole('button', { name: 'Suite: Smoke' })).toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', { name: 'Regression' }));
  expect(screen.getByRole('button', { name: 'Suite: 2' })).toBeInTheDocument();
});
