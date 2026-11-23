// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { TestScenarioCreateContainer } from '@/components/test-scenarios/containers/TestScenarioCreateContainer';
import { ChakraProvider } from '@/components/ui';
import type { ScenarioTagSummary } from '@/redux/apis/generatedApi';

const { create, inline, tag, directory } = vi.hoisted(() => ({
  create: vi.fn(),
  inline: vi.fn(),
  tag: { id: 'milestone', name: 'M1', description: 'First release' },
  directory: { tags: [] as ScenarioTagSummary[] },
}));
vi.mock('@/redux/apis/generatedApi', async (original) => ({
  ...(await original<typeof import('@/redux/apis/generatedApi')>()),
  usePostApiV2TestScenariosMutation: () => [create, {}],
  usePostApiV2ProjectsByProjectIdScenarioTagsInlineMutation: () => [inline, {}],
  useGetApiV2ProjectsByProjectIdScenarioTagsQuery: () => ({ currentData: directory.tags }),
}));
vi.mock('@/redux/apis/extendedApi', async (original) => ({
  ...(await original<typeof import('@/redux/apis/extendedApi')>()),
  useGetApiV2TestScenarioFoldersQuery: () => ({ currentData: [] }),
  useGetApiV2TestSuitesQuery: () => ({ currentData: [] }),
}));
vi.mock('@/redux/slices/dialog', async (original) => ({
  ...(await original<typeof import('@/redux/slices/dialog')>()),
  useDialogActions: () => ({ openDialog: vi.fn() }),
}));

const button = (name: string) => screen.getByRole('button', { name });
const title = () => screen.getByRole('textbox', { name: 'Title' });
const card = () => (
  <ChakraProvider>
    <MemoryRouter>
      <TestScenarioCreateContainer projectId="project" />
    </MemoryRouter>
  </ChakraProvider>
);

beforeEach(() => {
  create.mockReset();
  inline.mockReset();
  directory.tags = [tag];
});

it('submits tag IDs with creation, preserves them on rejection and carries them to the next draft', async () => {
  create
    .mockReturnValueOnce({ unwrap: () => Promise.reject({ status: 400 }) })
    .mockReturnValue({ unwrap: () => Promise.resolve({ id: 'new', suites: [], tags: [tag] }) });
  render(card());
  fireEvent.change(title(), { target: { value: 'First' } });
  fireEvent.click(button('Add tags'));
  fireEvent.click(screen.getByRole('checkbox', { name: 'M1' }));
  fireEvent.click(button('Done'));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Create another scenario' }));
  fireEvent.click(button('Save scenario'));
  await screen.findByText('Scenario save failed');
  expect(button('Remove M1')).toBeInTheDocument();
  expect(title()).toHaveValue('First');
  fireEvent.click(button('Save scenario'));
  await screen.findByText('Scenario created.');
  expect(title()).toHaveValue('');
  expect(button('Remove M1')).toBeInTheDocument();
  fireEvent.change(title(), { target: { value: 'Next' } });
  fireEvent.click(button('Save scenario'));
  await waitFor(() => expect(create).toHaveBeenCalledTimes(3));
  for (const [request] of create.mock.calls) {
    expect(request.createTestScenarioRequest.tagIds).toEqual(['milestone']);
  }
});

it('creates the project tag independently and reconciles draft chips with rename, deletion and undo', async () => {
  const created = { id: 'new', name: 'Release candidate', description: '' };
  inline.mockReturnValue({ unwrap: () => Promise.resolve(created) });
  const view = render(card());
  fireEvent.click(button('Add tags'));
  const search = screen.getByRole('textbox', { name: 'Find or create a tag' });
  fireEvent.change(search, { target: { value: '  Release candidate  ' } });
  fireEvent.keyDown(search, { key: 'Enter' });
  expect(await screen.findByRole('button', { name: 'Remove Release candidate' })).toBeInTheDocument();
  expect(inline).toHaveBeenCalledWith({ projectId: 'project', body: { name: 'Release candidate' } });
  directory.tags = [tag, { ...created, name: 'RC' }];
  view.rerender(card());
  expect(button('Remove RC')).toBeInTheDocument();
  directory.tags = [tag];
  view.rerender(card());
  expect(screen.getByText('No tags')).toBeInTheDocument();
  directory.tags = [tag, created];
  view.rerender(card());
  expect(button('Remove Release candidate')).toBeInTheDocument();
  fireEvent.click(button('Cancel'));
  expect(create).not.toHaveBeenCalled();
});
