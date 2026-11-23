// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { ManageTagsDialog } from '@/components/test-scenarios/tags/ManageTagsDialog';
import { subscribeToTagDeletion } from '@/components/test-scenarios/tags/tagUtils';
import type { ManagedScenarioTag } from '@/redux/apis/generatedApi';

const { list, create, edit, preview, remove, restore } = vi.hoisted(() => ({
  list: vi.fn(), create: vi.fn(), edit: vi.fn(), preview: vi.fn(), remove: vi.fn(), restore: vi.fn(),
}));
vi.mock('@/redux/apis/generatedApi', async importOriginal => ({
  ...await importOriginal<typeof import('@/redux/apis/generatedApi')>(),
  useGetApiV2ProjectsByProjectIdScenarioTagsQuery: list,
  usePostApiV2ProjectsByProjectIdScenarioTagsMutation: () => [create],
  usePatchApiV2ProjectsByProjectIdScenarioTagsAndTagIdMutation: () => [edit],
  usePostApiV2ProjectsByProjectIdScenarioTagsDeletionPreviewMutation: () => [preview],
  usePostApiV2ProjectsByProjectIdScenarioTagsDeletionMutation: () => [remove],
  usePostApiV2ProjectsByProjectIdScenarioTagsDeletionUndoMutation: () => [restore],
}));

const fixtures: ManagedScenarioTag[] = [
  { id: 'a', name: 'Alpha', description: 'shared', usageCount: 3 },
  { id: 'b', name: 'Beta', description: 'shared', usageCount: 2 },
  { id: 'c', name: 'Gamma', description: '', usageCount: 0 },
];
let tags: ManagedScenarioTag[];
const mount = () => {
  render(<ChakraProvider><ManageTagsDialog projectId="p" closeDialog={vi.fn()} /></ChakraProvider>);
  return userEvent.setup();
};
beforeEach(() => {
  vi.resetAllMocks();
  tags = [...fixtures];
  list.mockImplementation(() => ({ currentData: tags, refetch: vi.fn() }));
  preview.mockReturnValue({ unwrap: async () => ({ affectedCount: 3, revision: 'first' }) });
  remove.mockImplementation(({ body }) => ({ unwrap: async () => {
    tags = tags.filter(tag => !body.tagIds.includes(tag.id));
    return { operationId: body.operationId };
  } }));
  restore.mockImplementation(() => ({ unwrap: async () => { tags = [...fixtures]; } }));
});

describe('ManageTagsDialog', () => {
  it('retains checked matches and management search across forms and confirmation, and restores the deletion', async () => {
    const user = mount();
    await user.type(screen.getByRole('textbox', { name: 'Search tags' }), 'shared');
    expect(screen.getByText('2 of 3 tags')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Select Alpha' }));
    await user.click(screen.getByRole('button', { name: 'Select all 2' }));
    expect(screen.queryByRole('button', { name: 'Select all 2' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit Alpha' }));
    const name = screen.getByRole('textbox', { name: 'Name' });
    expect(name).toHaveFocus();
    await user.clear(name);
    await user.type(name, ' bETA ');
    expect(screen.getByRole('alert')).toHaveTextContent('A tag named "Beta" already exists. Tag names are not case-sensitive.');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Delete selected' }));
    expect(screen.getByText(/3 scenarios will lose/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(remove).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Delete selected' }));
    const restoreFilters = vi.fn();
    const listener = vi.fn(() => restoreFilters);
    const unsubscribe = subscribeToTagDeletion(listener);
    try {
      await user.click(screen.getByRole('button', { name: 'Delete 2 tags' }));
      expect(listener).toHaveBeenCalledWith('p', ['a', 'b']);
      expect(screen.getByText('0 of 1 tags')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Undo' }));
      expect(restoreFilters).toHaveBeenCalledOnce();
      expect(screen.getByText('2 selected')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Search tags' })).toHaveValue('shared');
    } finally { unsubscribe(); }
  });

  it('asks for confirmation of a revised impact and retires Undo on the next list action', async () => {
    const user = mount();
    remove.mockImplementationOnce(() => ({ unwrap: async () => { throw { status: 409, data: { error: 'Tag deletion preview changed.' } }; } }));
    preview.mockReturnValueOnce({ unwrap: async () => ({ affectedCount: 0, revision: 'first' }) })
      .mockReturnValueOnce({ unwrap: async () => ({ affectedCount: 1, revision: 'second' }) });
    await user.click(screen.getByRole('button', { name: 'Delete Gamma' }));
    expect(screen.getByText(/No scenario uses it/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete tag' }));
    expect(await screen.findByText(/1 scenario will lose/)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Tag deletion preview changed.');
    await user.click(screen.getByRole('button', { name: 'Delete tag' }));
    expect(remove.mock.calls[1][0].body).toEqual({ ...remove.mock.calls[0][0].body, revision: 'second' });
    expect(await screen.findByRole('button', { name: 'Undo' })).toBeEnabled();
    await user.click(screen.getByRole('textbox', { name: 'Search tags' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument());
  });
});
