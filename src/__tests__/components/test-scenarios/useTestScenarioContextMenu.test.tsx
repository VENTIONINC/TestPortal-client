// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

import { useTestScenarioContextMenu } from '@/components/test-scenarios/hooks/useTestScenarioContextMenu';

const openContextMenu = vi.fn();
const openDeleteDialog = vi.fn();
const navigate = vi.fn();

vi.mock('@/redux/slices/contextMenu', () => ({
  useOpenContextMenu: () => openContextMenu,
}));
vi.mock('@/components/ui', () => ({
  useDeleteTestScenarioDialog: () => openDeleteDialog,
}));
vi.mock('@/redux/slices/projects', () => ({
  useSelectedProjectId: () => 'selected-project',
}));
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();

  return { ...actual, useNavigate: () => navigate };
});

const Harness = () => {
  const openMenu = useTestScenarioContextMenu('project-1');

  return (
    <button onClick={(event) => openMenu(event, { id: 'scenario-1', title: 'Checkout flow' })}>
      Open scenario menu
    </button>
  );
};

describe('useTestScenarioContextMenu', () => {
  it('opens ordered icon-bearing actions for the selected scenario and project', async () => {
    const user = userEvent.setup();

    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open scenario menu' }));

    expect(openContextMenu).toHaveBeenCalledWith(expect.anything(), expect.any(Array));
    const options = openContextMenu.mock.calls[0][1];

    expect(options.map((option: { title: string }) => option.title)).toEqual(['Edit Scenario', 'Delete Scenario']);
    expect(options[0].icon).toBe(FiEdit);
    expect(options[1].icon).toBe(FiTrash2);

    options[0].onClick();
    expect(navigate).toHaveBeenCalledWith('/test-scenarios/scenario-1/edit');

    options[1].onClick();
    expect(openDeleteDialog).toHaveBeenCalledWith(
      'scenario-1',
      'project-1',
      'Checkout flow',
      expect.any(Function),
    );

    openDeleteDialog.mock.calls[0][3]();
    expect(navigate).toHaveBeenCalledWith('/test-scenarios');
  });
});
