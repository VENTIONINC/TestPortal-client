// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BulkTagPicker, TagFilter, TagPicker } from '@/components/test-scenarios/tags';

import { renderWithCatalogProviders } from '../renderWithCatalogProviders';

const { assign, counts, list } = vi.hoisted(() => ({ assign: vi.fn(), counts: vi.fn(), list: vi.fn() }));
vi.mock('@/redux/apis/generatedApi', async importOriginal => ({
  ...await importOriginal<typeof import('@/redux/apis/generatedApi')>(),
  useGetApiV2ProjectsByProjectIdScenarioTagsQuery: list,
  usePostApiV2ProjectsByProjectIdScenarioTagsSelectionCountsMutation: () => [counts],
  usePutApiV2ProjectsByProjectIdScenarioTagsAssignmentMutation: () => [assign],
}));
const tag = { id: 'a', name: 'Alpha', description: 'Smoke cases' };

beforeEach(() => {
  vi.clearAllMocks();
  list.mockReturnValue({ currentData: [tag] });
  counts.mockReturnValue({ unwrap: async () => ({ a: 1 }) });
  assign.mockReturnValue({ unwrap: async () => tag });
});

describe('TagControls', () => {
  it('searches descriptions, toggles first match with Enter, and keeps the inline picker open for creation', async () => {
    const user = userEvent.setup();
    const toggle = vi.fn();
    const create = vi.fn();
    renderWithCatalogProviders(<TagPicker projectId="p" selectedIds={[]} onToggle={toggle} onCreate={create} />);
    const trigger = screen.getByRole('button', { name: 'Add tags' });
    await user.click(trigger);
    const input = screen.getByRole('textbox', { name: 'Find or create a tag' });
    expect(input).toHaveFocus();
    await user.type(input, 'smoke{Enter}');
    expect(toggle).toHaveBeenCalledWith(tag, true);
    await user.clear(input);
    await user.type(input, ' Beta {Enter}');
    expect(create).toHaveBeenCalledWith('Beta');
    expect(input).toHaveValue('');
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(trigger).toHaveFocus();
  });

  it('filters immediately, keeps the popup open on clear and restores focus on Escape', async () => {
    const user = userEvent.setup();
    function Filter() {
      const [ids, setIds] = useState<string[]>([]);
      return <TagFilter projectId="p" selectedIds={ids} onChange={setIds} counts={{ a: 5 }} />;
    }
    renderWithCatalogProviders(<Filter />);
    await user.click(screen.getByRole('button', { name: 'Tags' }));
    const input = screen.getByRole('textbox', { name: 'Search tags' });
    await user.type(input, 'smoke{Enter}');
    expect(screen.getByRole('button', { name: 'Tags: Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Alpha' })).toBeChecked();
    expect(screen.getByText('5')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('checkbox', { name: 'Alpha' })).not.toBeChecked();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Tags' })).toHaveFocus());
  });

  it('uses all selected identities for mixed to checked and checked to empty transitions', async () => {
    const user = userEvent.setup();
    const ids = ['first-page', 'second-page'];
    const onApplied = vi.fn();
    renderWithCatalogProviders(<BulkTagPicker projectId="p" scenarioIds={ids} onApplied={onApplied} />);
    expect(counts).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Tag' }));
    const checkbox = screen.getByRole('checkbox', { name: 'Alpha' });
    await waitFor(() => expect(checkbox).toBePartiallyChecked());
    await user.click(checkbox);
    expect(assign).toHaveBeenCalledWith({ projectId: 'p', body: { scenarioIds: ids, tagId: 'a', present: true } });
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(assign).toHaveBeenLastCalledWith({ projectId: 'p', body: { scenarioIds: ids, tagId: 'a', present: false } });
    expect(checkbox).not.toBeChecked();
    await user.type(screen.getByRole('textbox', { name: 'Find or create a tag' }), 'Beta{Enter}');
    expect(assign).toHaveBeenLastCalledWith({ projectId: 'p', body: { scenarioIds: ids, name: 'Beta', present: true } });
    expect(onApplied).toHaveBeenCalledTimes(3);
  });
});
