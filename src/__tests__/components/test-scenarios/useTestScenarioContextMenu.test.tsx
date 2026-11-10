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
const clone = vi.fn();
const { menuState, closeMenu } = vi.hoisted(() => ({ menuState: { show: false }, closeMenu: vi.fn() }));

vi.mock('@/redux/slices/contextMenu', () => ({
  useOpenContextMenu: () => openContextMenu,
  useContextMenuState: () => menuState,
  useCloseContextMenu: () => closeMenu,
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

const DeleteOnlyHarness = () => {
  const openMenu = useTestScenarioContextMenu('project-1', undefined, false, clone);

  return (
    <button onClick={(event) => openMenu(event, { id: 'scenario-1', title: 'Checkout flow' })}>
      Open details actions
    </button>
  );
};
const CatalogHarness = () => {
  const openMenu = useTestScenarioContextMenu('project-1', undefined, true, undefined, () => {}, '?originProject=project-1&originKind=folder&originId=f');
  return <button onClick={(event) => openMenu(event, { id: 'scenario-1', title: 'Checkout flow' })}>Catalog actions</button>;
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
    expect(navigate).toHaveBeenCalledWith('/test-management');
  });

  it('provides Clone and Delete Scenario in the details overflow menu', async () => {
    const user = userEvent.setup();
    openContextMenu.mockClear();
    render(<DeleteOnlyHarness />);
    await user.click(screen.getByRole('button', { name: 'Open details actions' }));
    const options = openContextMenu.mock.calls[0][1];
    expect(options.map((option: { title: string }) => option.title)).toEqual(['Clone', 'Delete Scenario']);
    options[0].onClick();
    expect(clone).toHaveBeenCalledWith({ id: 'scenario-1', title: 'Checkout flow' });
    expect(options[1].icon).toBe(FiTrash2);
  });
  it('closes an already open menu when the same trigger is clicked again', async () => {
    menuState.show = false; closeMenu.mockClear();
    const user = userEvent.setup();
    const view = render(<DeleteOnlyHarness />);
    await user.click(screen.getByRole('button', { name: 'Open details actions' }));
    menuState.show = true;
    view.rerender(<DeleteOnlyHarness />);
    await user.click(screen.getByRole('button', { name: 'Open details actions' }));
    expect(closeMenu).toHaveBeenCalledOnce();
    menuState.show = false;
  });
  it('keeps folder context when editing from a catalog row', async () => {
    openContextMenu.mockClear(); navigate.mockClear();
    render(<CatalogHarness />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Catalog actions' }));
    openContextMenu.mock.calls[0][1][0].onClick();
    expect(navigate).toHaveBeenCalledWith('/test-scenarios/scenario-1/edit?originProject=project-1&originKind=folder&originId=f');
  });
});
