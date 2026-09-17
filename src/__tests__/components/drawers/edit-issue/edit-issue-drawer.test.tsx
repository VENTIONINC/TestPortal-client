// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { EditIssueDrawer } from '@/components/drawers/edit-issue/edit-issue-drawer';
import type { IssueCore } from '@/types';

const mocks = vi.hoisted(() => ({
  updateIssue: vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({}) })),
  deleteIssue: vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({}) })),
  formatIssue: vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({ name: 'Polished', description: 'Polished' }) })),
}));

vi.mock('@/redux/apis/generatedApi', () => ({
  usePatchApiV2IssuesByIssueIdMutation: () => [mocks.updateIssue, { isLoading: false }],
  useDeleteApiV2IssuesByIssueIdMutation: () => [mocks.deleteIssue, { isLoading: false }],
  usePostApiV2ErrorFormatterMutation: () => [mocks.formatIssue, { isLoading: false }],
}));

vi.mock('@/redux/slices/projects', () => ({
  useSelectedProjectId: () => 'project-1',
}));

vi.mock('@/components/ui/components/Dialogs', () => ({
  useConfirmIssueDeletionDialog: () => vi.fn(),
}));

const issue: IssueCore = {
  id: 'issue-1',
  name: 'Checkout failure',
  category: 'bug',
  description: 'Details',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

describe('EditIssueDrawer', () => {
  it('edits and persists the lowercase Issue category', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider>
        <EditIssueDrawer issue={issue} closeDrawer={vi.fn()} closeAllDrawers={vi.fn()} />
      </ChakraProvider>,
    );

    const category = screen.getByRole('combobox', { name: 'Category' });
    expect(category).toHaveValue('bug');
    await user.selectOptions(category, 'infra');
    await user.click(screen.getByRole('button', { name: 'Update' }));

    expect(mocks.updateIssue).toHaveBeenCalledWith({
      issueId: 'issue-1',
      updateIssueRequest: { name: 'Checkout failure', category: 'infra', description: 'Details' },
    });
  });
});
