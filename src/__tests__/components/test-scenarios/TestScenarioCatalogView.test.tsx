// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState, type ReactNode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import {
  TestScenarioCatalogView,
  type TestScenarioCatalogViewProps,
} from '@/components/test-scenarios/components/TestScenarioCatalogView';
import type { TestScenarioSummary } from '@/redux/apis/generatedApi';

vi.mock('@/components/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/ui')>();
  return {
    ...actual,
    Tooltip: ({ children, content, openDelay, disabled }: { children: ReactNode; content: ReactNode; openDelay?: number; disabled?: boolean }) => (
      <span data-tooltip-content={disabled ? undefined : content} data-tooltip-open-delay={disabled ? undefined : openDelay}>
        {children}
      </span>
    ),
  };
});

vi.mock('@/components/test-scenarios/components/SuitePicker', () => ({
  SuitePicker: ({ onComplete, selectedIds }: { onComplete: (report: { succeededIds: string[]; failedIds: string[]; unattemptedIds: string[]; uncertainIds: string[] }, ids: string[]) => void; selectedIds: string[] }) => (
    <button onClick={() => onComplete({ succeededIds: selectedIds, failedIds: [], unattemptedIds: [], uncertainIds: [] }, selectedIds)}>Add to suite</button>
  ),
}));

vi.mock('@/components/test-scenarios/hooks/useTestScenarioContextMenu', () => ({
  useTestScenarioContextMenu: () => vi.fn(),
}));

const scenarios: TestScenarioSummary[] = [
  {
    id: 'scenario-1',
    projectId: 'project-1',
    folderId: null,
    folderName: null,
    createdById: 'user-1',
    scenarioKey: 'AUTH-1',
    title: 'Checkout flow',
    details: 'Details with **Markdown** <strong>HTML</strong>',
    priority: 'high',
    createdBy: { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' },
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-02T11:00:00.000Z',
  },
];

const pagination = {
  page: 1,
  limit: 25,
  total: 1,
  totalPages: 1,
};

const defaultProps: Omit<TestScenarioCatalogViewProps, 'scenarios' | 'pagination' | 'isLoading' | 'onPageChange'> = {
  projectId: 'project-1',
  organizationTab: 'scenarios',
  search: '',
  projectScenarioCount: 1,
  unfiledScenarioCount: 0,
  pageSize: 25,
  pageSizes: [25, 50, 100],
  onPageSizeChange: vi.fn(),
  onSearchChange: vi.fn(),
  sort: undefined,
  sortDirection: 'desc',
  onSortDirectionChange: vi.fn(),
  priority: '',
  onPriorityChange: vi.fn(),
  authorId: '',
  onAuthorChange: vi.fn(),
  authors: [{ id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' }],
  authorsLoading: false,
  onSortChange: vi.fn(),
  columnFilters: { scenarioKey: '', title: '', details: '', folder: '', createdBy: '' },
  onColumnFilterChange: vi.fn(),
  scope: { kind: 'all' },
  onScopeChange: vi.fn(),
  folders: [],
  suites: [],
  organizationLoading: false,
  selectedIds: [],
  allMatchingSelected: false,
  isExecutingOperation: false,
  isResolvingSelection: false,
  selectionError: null,
  selectAllMatching: vi.fn(async () => {}),
  toggleSelected: vi.fn(),
  onMoveSelected: vi.fn(async () => ({ succeededIds: [], failedIds: [], unattemptedIds: [], uncertainIds: [] })),
  onMoveScenarioIds: vi.fn(async () => ({ succeededIds: [], failedIds: [], unattemptedIds: [], uncertainIds: [] })),
  restoreFolderDeletion: vi.fn(async () => {}),
  restoreScenarioFolders: vi.fn(async () => {}),
  onSuiteOperationStart: vi.fn(),
  onSuiteOperationComplete: vi.fn(),
  onDeleteSelected: vi.fn(async () => ({ succeededIds: [], failedIds: [], unattemptedIds: [], uncertainIds: [] })),
  onRemoveSelectedFromSuite: vi.fn(async () => ({
    succeededIds: [],
    failedIds: [],
    unattemptedIds: [],
    uncertainIds: [],
  })),
  removeSuiteMembership: vi.fn(async () => ({ restoreData: { suiteId: 'suite-1', addedScenarioIds: [], removedMembers: [] }, expectedMembershipRevision: 1, expectedScenarioIds: [] })),
  restoreSuiteMembership: vi.fn(async () => {}),
  moveSuiteMembership: vi.fn(async () => ({ restoreData: { sourceSuiteId: 'suite-1', destinationSuiteId: 'suite-2', sourceMembers: [], destinationAddedScenarioIds: [] }, expectedSourceMembershipRevision: 1, expectedDestinationMembershipRevision: 1, expectedSourceScenarioIds: [], expectedDestinationScenarioIds: [], alreadyInDestination: [] })),
  restoreSuiteMove: vi.fn(async () => {}),
  refreshSuiteData: vi.fn(async () => {}),
  onReorderSuite: vi.fn(async () => {}),
  onCreateFolder: vi.fn(async () => {}),
  onUpdateFolder: vi.fn(async () => {}),
  onDeleteFolder: vi.fn(async () => ({ deleted: true as const, restoreData: { folders: [], scenarios: [] } })),
  onCreateSuite: vi.fn(async () => {}),
  onUpdateSuite: vi.fn(async () => {}),
  onDeleteSuite: vi.fn(async () => {}),
};

const renderView = (props: Partial<TestScenarioCatalogViewProps> = {}) =>
  render(
    <ChakraProvider>
      <MemoryRouter>
        <TestScenarioCatalogView
          scenarios={scenarios}
          pagination={pagination}
          isLoading={false}
          onPageChange={vi.fn()}
          {...defaultProps}
          {...props}
        />
      </MemoryRouter>
    </ChakraProvider>,
  );

describe('TestScenarioCatalogView', () => {
  it('includes the selected folder as the scenario origin', () => {
    renderView({ projectId: 'project-1', organizationTab: 'scenarios', scope: { kind: 'folder', id: 'folder-1' } });
    expect(screen.getByRole('link', { name: 'Checkout flow' })).toHaveAttribute('href', '/test-scenarios/scenario-1?originProject=project-1&originKind=folder&originId=folder-1');
  });
  it('includes the selected suite as the scenario origin', () => {
    renderView({ projectId: 'project-1', organizationTab: 'suites', scope: { kind: 'suite', id: 'suite-a' }, suites: [{ id: 'suite-a', name: 'Smoke', description: null, purpose: null, release: null, membershipRevision: 0, members: [{ testScenarioId: 'scenario-1' }] }] });
    expect(screen.getByRole('link', { name: 'Checkout flow' })).toHaveAttribute('href', '/test-scenarios/scenario-1?originProject=project-1&originKind=suite&originId=suite-a');
  });
  it('opens the selected scenario row actions', async () => {
    const onScenarioActions = vi.fn();
    renderView({ organizationTab: 'scenarios', onScenarioActions });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Actions for Checkout flow' }));
    expect(onScenarioActions).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ id: 'scenario-1', title: 'Checkout flow' }));
  });
  it('disables Run suite for an empty suite and provides its delayed tooltip without opening a run', async () => {
    const user = userEvent.setup();
    renderView({
      organizationTab: 'suites',
      scope: { kind: 'suite', id: 'suite-empty' },
      suites: [{ id: 'suite-empty', name: 'Empty suite', description: null, purpose: null, release: null, membershipRevision: 0, members: [] }],
    });

    const runSuite = screen.getByRole('button', { name: 'Run suite' });
    expect(runSuite).toHaveAttribute('aria-disabled', 'true');
    expect(runSuite).not.toBeDisabled();
    expect(runSuite.parentElement).toHaveAttribute('data-tooltip-content', 'Add scenarios to run this suite');
    expect(runSuite.parentElement).toHaveAttribute('data-tooltip-open-delay', '500');

    await user.click(runSuite);
    expect(screen.queryByText(/New manual run/i)).not.toBeInTheDocument();
  });

  it('keeps Run suite inert for a suite with scenarios', async () => {
    const user = userEvent.setup();
    renderView({
      organizationTab: 'suites',
      scope: { kind: 'suite', id: 'suite-populated' },
      suites: [{ id: 'suite-populated', name: 'Populated suite', description: null, purpose: null, release: null, membershipRevision: 0, members: [{ testScenarioId: 'scenario-1' }] }],
    });

    const runSuite = screen.getByRole('button', { name: 'Run suite' });
    expect(runSuite).not.toHaveAttribute('aria-disabled', 'true');
    await user.click(runSuite);
    expect(screen.queryByText(/New manual run/i)).not.toBeInTheDocument();
    expect(runSuite.parentElement).not.toHaveAttribute('data-tooltip-content', 'Add scenarios to run this suite');
  });

  it('creates a same-name suite inline and selects its returned UUID', async () => {
    const user = userEvent.setup();
    const onCreateSuite = vi.fn(async () => ({ id: 'suite-new' }));
    const onScopeChange = vi.fn();
    renderView({
      organizationTab: 'suites',
      suites: [{ id: 'suite-old', name: 'Regression', description: null, purpose: null, release: null, membershipRevision: 0 }],
      onCreateSuite,
      onScopeChange,
    });
    await user.click(screen.getAllByRole('button', { name: 'Create suite' })[0]);
    const name = screen.getByRole('textbox', { name: 'Suite name' });
    expect(name).toHaveFocus();
    expect(name).toHaveAttribute('placeholder', 'Suite name, Enter to create');
    await user.type(name, 'Regression');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(onCreateSuite).toHaveBeenCalledWith({ name: 'Regression' }));
    expect(onScopeChange).toHaveBeenCalledWith({ kind: 'suite', id: 'suite-new' });
  });

  it('cancels an empty suite draft with Enter or Escape', async () => {
    const user = userEvent.setup();
    const onCreateSuite = vi.fn();
    renderView({ organizationTab: 'suites', onCreateSuite });
    await user.click(screen.getAllByRole('button', { name: 'Create suite' })[0]);
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('textbox', { name: 'Suite name' })).not.toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Create suite' })[0]);
    await user.type(screen.getByRole('textbox', { name: 'Suite name' }), 'Draft{Escape}');
    expect(screen.queryByRole('textbox', { name: 'Suite name' })).not.toBeInTheDocument();
    expect(onCreateSuite).not.toHaveBeenCalled();
  });

  it('shows folders and No folder last without suite navigation in Scenarios', () => {
    renderView({
      organizationTab: 'scenarios',
      suites: [{ id: 'suite-1', name: 'Release checks', description: null, purpose: null, release: null, membershipRevision: 0 }],
    });

    expect(screen.getByRole('button', { name: /No folder/ })).toBeInTheDocument();
    expect(screen.getByText('Folders')).toBeInTheDocument();
    expect(screen.queryByText('Suites')).not.toBeInTheDocument();
  });

  it('keeps folder move Undo available after ten seconds', async () => {
    const restoreData = [{ scenarioId: 'scenario-1', folderId: null, expectedFolderId: 'folder-1', expectedRevision: 3 }];
    renderView({
      folders: [{ id: 'folder-1', name: 'Authentication', parentId: null, scenarioCount: 0 }],
      onMoveScenarioIds: vi.fn(async () => ({ succeededIds: ['scenario-1'], failedIds: [], unattemptedIds: [], uncertainIds: [], folderRestoreData: restoreData })),
    });
    const dataTransfer = { setData: vi.fn(), effectAllowed: '', types: ['application/x-testportal-scenarios'], getData: () => JSON.stringify({ projectId: 'project-1', scenarioIds: ['scenario-1'] }) };
    vi.useFakeTimers();
    try {
      fireEvent.dragStart(screen.getByRole('button', { name: 'Drag Checkout flow to a folder' }), { dataTransfer });
      await act(async () => { fireEvent.drop(screen.getByRole('button', { name: 'Authentication 0' }), { dataTransfer }); });
      expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
      act(() => { vi.advanceTimersByTime(9999); });
      expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
      act(() => { vi.advanceTimersByTime(1); });
      expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
    } finally { vi.useRealTimers(); }
  });

  it('undoes a folder row move through the revision guarded restoration data', async () => {
    const user = userEvent.setup();
    const restoreData = [{ scenarioId: 'scenario-1', folderId: null, expectedFolderId: 'folder-1', expectedRevision: 3 }];
    const onMoveScenarioIds = vi.fn(async () => ({ succeededIds: ['scenario-1'], failedIds: [], unattemptedIds: [], uncertainIds: [], folderRestoreData: restoreData }));
    const restoreScenarioFolders = vi.fn(async () => {});
    renderView({
      folders: [{ id: 'folder-1', name: 'Authentication', parentId: null, scenarioCount: 0 }],
      onMoveScenarioIds,
      restoreScenarioFolders,
    });
    const dataTransfer = { setData: vi.fn(), effectAllowed: '', types: ['application/x-testportal-scenarios'], getData: () => JSON.stringify({ projectId: 'project-1', scenarioIds: ['scenario-1'] }) };
    fireEvent.dragStart(screen.getByRole('button', { name: 'Drag Checkout flow to a folder' }), { dataTransfer });
    fireEvent.drop(screen.getByRole('button', { name: 'Authentication 0' }), { dataTransfer });
    await waitFor(() => expect(onMoveScenarioIds).toHaveBeenCalledWith(['scenario-1'], 'folder-1'));
    expect(await screen.findByText('1 scenario moved to Authentication')).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    expect(restoreScenarioFolders).toHaveBeenCalledWith(restoreData);
  });

  it('offers undo for successful batches when a later folder move batch fails', async () => {
    const user = userEvent.setup();
    const restoreData = [{ scenarioId: 'scenario-1', folderId: null, expectedFolderId: 'folder-1', expectedRevision: 3 }];
    const restoreScenarioFolders = vi.fn(async () => {});
    renderView({
      folders: [{ id: 'folder-1', name: 'Authentication', parentId: null, scenarioCount: 0 }],
      onMoveScenarioIds: vi.fn(async () => ({ succeededIds: ['scenario-1'], failedIds: ['scenario-2'], unattemptedIds: [], uncertainIds: [], folderRestoreData: restoreData })),
      restoreScenarioFolders,
    });
    const dataTransfer = { setData: vi.fn(), effectAllowed: '', types: ['application/x-testportal-scenarios'], getData: () => JSON.stringify({ projectId: 'project-1', scenarioIds: ['scenario-1'] }) };
    fireEvent.dragStart(screen.getByRole('button', { name: 'Drag Checkout flow to a folder' }), { dataTransfer });
    fireEvent.drop(screen.getByRole('button', { name: 'Authentication 0' }), { dataTransfer });
    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    expect(restoreScenarioFolders).toHaveBeenCalledWith(restoreData);
  });

  it('clears folder undo when switching projects, including a move still in flight', async () => {
    let finishMove!: (value: { succeededIds: string[]; failedIds: string[]; unattemptedIds: string[]; uncertainIds: string[]; folderRestoreData: { scenarioId: string; folderId: null; expectedFolderId: string; expectedRevision: number }[] }) => void;
    const onMoveScenarioIds = vi.fn(() => new Promise<Parameters<typeof finishMove>[0]>((resolve) => { finishMove = resolve; }));
    const props = { ...defaultProps, scenarios, pagination, isLoading: false, onPageChange: vi.fn(), folders: [{ id: 'folder-1', name: 'Authentication', parentId: null, scenarioCount: 0 }], onMoveScenarioIds };
    const view = render(<ChakraProvider><MemoryRouter><TestScenarioCatalogView {...props} /></MemoryRouter></ChakraProvider>);
    const dataTransfer = { setData: vi.fn(), effectAllowed: '', types: ['application/x-testportal-scenarios'], getData: () => JSON.stringify({ projectId: 'project-1', scenarioIds: ['scenario-1'] }) };
    fireEvent.dragStart(screen.getByRole('button', { name: 'Drag Checkout flow to a folder' }), { dataTransfer });
    fireEvent.drop(screen.getByRole('button', { name: 'Authentication 0' }), { dataTransfer });
    view.rerender(<ChakraProvider><MemoryRouter><TestScenarioCatalogView {...props} projectId="project-2" /></MemoryRouter></ChakraProvider>);
    await act(async () => finishMove({ succeededIds: ['scenario-1'], failedIds: [], unattemptedIds: [], uncertainIds: [], folderRestoreData: [{ scenarioId: 'scenario-1', folderId: null, expectedFolderId: 'folder-1', expectedRevision: 3 }] }));
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
  });

  it('clears an existing folder undo on project switch', async () => {
    const props = { ...defaultProps, scenarios, pagination, isLoading: false, onPageChange: vi.fn(), folders: [{ id: 'folder-1', name: 'Authentication', parentId: null, scenarioCount: 0 }], onMoveScenarioIds: vi.fn(async () => ({ succeededIds: ['scenario-1'], failedIds: [], unattemptedIds: [], uncertainIds: [], folderRestoreData: [{ scenarioId: 'scenario-1', folderId: null, expectedFolderId: 'folder-1', expectedRevision: 3 }] })) };
    const view = render(<ChakraProvider><MemoryRouter><TestScenarioCatalogView {...props} /></MemoryRouter></ChakraProvider>);
    const dataTransfer = { setData: vi.fn(), effectAllowed: '', types: ['application/x-testportal-scenarios'], getData: () => JSON.stringify({ projectId: 'project-1', scenarioIds: ['scenario-1'] }) };
    fireEvent.dragStart(screen.getByRole('button', { name: 'Drag Checkout flow to a folder' }), { dataTransfer });
    fireEvent.drop(screen.getByRole('button', { name: 'Authentication 0' }), { dataTransfer });
    expect(await screen.findByRole('button', { name: 'Undo' })).toBeInTheDocument();
    view.rerender(<ChakraProvider><MemoryRouter><TestScenarioCatalogView {...props} projectId="project-2" /></MemoryRouter></ChakraProvider>);
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
  });

  it('shows project and No folder totals independently of the visible page and aggregates subtree counts', () => {
    renderView({
      projectScenarioCount: 81,
      unfiledScenarioCount: 13,
      pagination: { ...pagination, total: 2 },
      folders: [
        {
          id: 'parent',
          name: 'Parent',
          parentId: null,
          scenarioCount: 2,
          children: [{ id: 'child', name: 'Child', parentId: 'parent', scenarioCount: 3, children: [] }],
        },
      ],
    });
    expect(screen.getByRole('button', { name: 'All scenarios 81' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No folder 13' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Parent 5' })).toBeInTheDocument();
  });

  it('creates a subfolder inline and selects it', async () => {
    const user = userEvent.setup();
    const onCreateFolder = vi.fn(async () => ({ id: 'new-folder' }));
    const onScopeChange = vi.fn();
    renderView({
      onCreateFolder,
      onScopeChange,
      folders: [
        {
          id: 'folder-1',
          name: 'Authentication',
          parentId: null,
          description: 'Login and access flows',
          scenarioCount: 0,
        },
      ],
      scope: { kind: 'folder', id: 'folder-1' },
    });
    expect(screen.getByText('Login and access flows')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create subfolder' }));
    expect(screen.getByPlaceholderText('Subfolder name')).toHaveFocus();
    await user.type(screen.getByLabelText('New folder name'), 'OAuth{Enter}');
    await waitFor(() => expect(onCreateFolder).toHaveBeenCalledWith('OAuth', 'folder-1'));
    expect(onScopeChange).toHaveBeenCalledWith({ kind: 'folder', id: 'new-folder' });
  });

  it('cancels an empty root folder draft with Escape', async () => {
    const user = userEvent.setup();
    const onCreateFolder = vi.fn();
    renderView({ folders: [], onCreateFolder });
    await user.click(screen.getByRole('button', { name: 'Create folder' }));
    const input = screen.getByRole('textbox', { name: 'New folder name' });
    expect(input).toHaveAttribute('placeholder', 'Folder name, Enter to create');
    expect(input).toHaveFocus();
    await user.type(input, 'Temporary');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('textbox', { name: 'New folder name' })).not.toBeInTheDocument();
    expect(onCreateFolder).not.toHaveBeenCalled();
  });

  it('omits subfolder creation from a third-level folder menu', async () => {
    const user = userEvent.setup();
    renderView({
      scope: { kind: 'folder', id: 'level-3' },
      folders: [{ id: 'level-1', name: 'One', parentId: null, scenarioCount: 0, children: [
        { id: 'level-2', name: 'Two', parentId: 'level-1', scenarioCount: 0, children: [
          { id: 'level-3', name: 'Three', parentId: 'level-2', scenarioCount: 0, children: [] },
        ] },
      ] }],
    });
    await user.click(screen.getByRole('button', { name: 'Folder actions' }));
    expect(screen.queryByRole('menuitem', { name: 'New subfolder' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Edit folder details' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete folder' })).toBeInTheDocument();
  });

  it('clears an existing folder description when its edit field is blank', async () => {
    const user = userEvent.setup();
    const onUpdateFolder = vi.fn(async () => {});
    renderView({
      onUpdateFolder,
      folders: [
        { id: 'folder-1', name: 'Authentication', parentId: null, description: 'Old description', scenarioCount: 0 },
      ],
      scope: { kind: 'folder', id: 'folder-1' },
    });
    await user.click(screen.getByRole('button', { name: 'Folder actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit folder details' }));
    await user.clear(screen.getByLabelText('Description (optional)'));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onUpdateFolder).toHaveBeenCalledWith('folder-1', { name: 'Authentication', description: null });
  });

  it('does not expose an Include subfolders toggle for folder scope', () => {
    renderView({
      scope: { kind: 'folder', id: 'folder-1' },
      folders: [
        {
          id: 'folder-1',
          name: 'Authentication',
          parentId: null,
          scenarioCount: 1,
          children: [{ id: 'child-1', name: 'Password recovery', parentId: 'folder-1', scenarioCount: 1 }],
        },
      ],
    });

    expect(screen.queryByText(/Include subfolders/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /subfolders/i })).not.toBeInTheDocument();
  });

  it('shows suite selection without folder navigation in Suites', () => {
    renderView({
      organizationTab: 'suites',
      scope: { kind: 'suite' },
      folders: [{ id: 'folder-1', name: 'Smoke', parentId: null, scenarioCount: 1 }],
      suites: [{ id: 'suite-1', name: 'Release checks', description: null, purpose: null, release: null, membershipRevision: 0 }],
    });

    expect(screen.getByText('Suites')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Release checks/ })).toBeInTheDocument();
    expect(screen.queryByText('Folders')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /No folder/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Select a suite to view its scenarios/)).toBeInTheDocument();
    expect(screen.queryByText('No Test Scenarios are available for this project.')).not.toBeInTheDocument();
  });

  it('renders the loading state', () => {
    renderView({ scenarios: [], isLoading: true });

    expect(screen.getByRole('status')).toHaveTextContent('Searching scenarios…');
  });

  it('renders the error state without scenario records', () => {
    renderView({ error: { status: 500 } });

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load Test Scenarios');
    expect(screen.queryByText('Checkout flow')).not.toBeInTheDocument();
  });

  it('renders the empty state without pagination controls', () => {
    renderView({ scenarios: [], pagination: { ...pagination, total: 0, totalPages: 0 } });

    expect(screen.getByText('No Test Scenarios are available for this project.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next Page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Create Test Scenario' })).toBeInTheDocument();
  });

  it('renders compact summary metadata and opens scenario details from the title', () => {
    renderView();

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(8);
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Drag',
      'Select',
      'Key',
      'Title',
      'Priority',
      'Folder',
      'Updated',
      'Author',
    ]);
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByRole('row', { name: /Checkout flow/ })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'AUTH-1' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Checkout flow/ })).toHaveTextContent('High');
    expect(screen.getByText('Ada L.')).toBeInTheDocument();
    expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument();
    expect(screen.getByText('9/2/2026')).toBeInTheDocument();
    expect(screen.queryByText('9/1/2026')).not.toBeInTheDocument();
    expect(screen.queryByText('# Checkout flow')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Checkout flow' })).toHaveAttribute('href', '/test-scenarios/scenario-1?originProject=project-1&originKind=all');
    expect(screen.queryByRole('button', { name: 'Actions for Checkout flow' })).not.toBeInTheDocument();
  });

  it('renders suite rows with the columns and compact metadata from the Suites design', () => {
    renderView({
      organizationTab: 'suites',
      scope: { kind: 'suite', id: 'suite-1' },
      suites: [{
        id: 'suite-1',
        name: 'Regression',
        description: null,
        purpose: null,
        release: null,
        membershipRevision: 1,
        members: [{ testScenarioId: 'scenario-1' }],
      }],
    });

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Drag to another suite or reorder',
      'Select',
      'Key',
      'Title',
      'Priority',
      'Folder',
      'Updated',
      'Author',
    ]);
    expect(screen.getByRole('row', { name: /Checkout flow/ })).toHaveTextContent('High');
    expect(screen.getByText('Ada L.')).toBeInTheDocument();
    expect(screen.getByText('9/2/2026')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: /Details|Created by|Created/ })).not.toBeInTheDocument();
  });

  it('drags selected rows as a group and unselected rows by their own UUID', () => {
    const onMoveScenarioIds = vi.fn(async () => ({
      succeededIds: [],
      failedIds: [],
      unattemptedIds: [],
      uncertainIds: [],
    }));
    const dataTransfer = {
      data: {} as Record<string, string>,
      effectAllowed: '',
      dropEffect: '',
      types: [] as string[],
      setData(type: string, value: string) {
        this.data[type] = value;
        this.types = [type];
      },
      getData(type: string) {
        return this.data[type] ?? '';
      },
    };
    renderView({
      projectId: 'project-1',
      scenarios: [
        scenarios[0],
        { ...scenarios[0], id: 'scenario-2', title: 'Refund flow' },
        { ...scenarios[0], id: 'scenario-3', title: 'Profile flow' },
      ],
      selectedIds: ['scenario-1', 'scenario-2', 'off-page'],
      folders: [{ id: 'folder-1', name: 'Authentication', parentId: null, scenarioCount: 0 }],
      onMoveScenarioIds,
    });
    fireEvent.dragStart(screen.getByRole('button', { name: 'Drag Checkout flow to a folder' }), { dataTransfer });
    fireEvent.dragOver(screen.getByRole('button', { name: 'Authentication 0' }), { dataTransfer });
    fireEvent.drop(screen.getByRole('button', { name: 'Authentication 0' }), { dataTransfer });
    expect(onMoveScenarioIds).toHaveBeenCalledWith(['scenario-1', 'scenario-2', 'off-page'], 'folder-1');
    fireEvent.dragStart(screen.getByRole('button', { name: 'Drag Profile flow to a folder' }), { dataTransfer });
    fireEvent.dragOver(screen.getByRole('button', { name: 'No folder 0' }), { dataTransfer });
    fireEvent.drop(screen.getByRole('button', { name: 'No folder 0' }), { dataTransfer });
    expect(onMoveScenarioIds).toHaveBeenLastCalledWith(['scenario-3'], null);
  });

  it('selects only the visible page and applies Shift selection to its contiguous range', async () => {
    const user = userEvent.setup();
    const rows = [
      scenarios[0],
      { ...scenarios[0], id: 'scenario-2', title: 'Refund flow' },
      { ...scenarios[0], id: 'scenario-3', title: 'Profile flow' },
      { ...scenarios[0], id: 'scenario-4', title: 'Settings flow' },
    ];
    const StatefulView = () => {
      const [selectedIds, setSelectedIds] = useState<string[]>(['scenario-4']);
      return (
        <ChakraProvider>
          <MemoryRouter>
            <TestScenarioCatalogView
              scenarios={rows.slice(0, 3)}
              pagination={pagination}
              isLoading={false}
              onPageChange={vi.fn()}
              {...defaultProps}
              selectedIds={selectedIds}
              toggleSelected={(id) =>
                setSelectedIds((current) =>
                  current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
                )
              }
            />
          </MemoryRouter>
        </ChakraProvider>
      );
    };
    render(<StatefulView />);
    await user.click(screen.getByRole('checkbox', { name: 'Select Checkout flow' }));
    await user.keyboard('{Shift>}');
    await user.click(screen.getByRole('checkbox', { name: 'Select Profile flow' }));
    await user.keyboard('{/Shift}');
    expect(screen.getByRole('checkbox', { name: 'Select Checkout flow' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select Refund flow' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select Profile flow' })).toBeChecked();
    expect(screen.getByText('4 selected')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Select all scenarios on this page' }));
    expect(screen.getByRole('checkbox', { name: 'Select Checkout flow' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select Profile flow' })).not.toBeChecked();
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('offers Priority, Author, explicit sorting, and page-size dropdowns above the table', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const onPriorityChange = vi.fn();
    const onAuthorChange = vi.fn();
    const onSortDirectionChange = vi.fn();
    const onPageSizeChange = vi.fn();
    const StatefulCatalog = () => {
      const [priority, setPriority] = useState('');
      const [sort, setSort] = useState<TestScenarioCatalogViewProps['sort']>();
      return (
        <TestScenarioCatalogView
          {...defaultProps}
          scenarios={scenarios}
          pagination={pagination}
          isLoading={false}
          onPageChange={vi.fn()}
          priority={priority}
          sort={sort}
          onPriorityChange={(value) => {
            onPriorityChange(value);
            setPriority(value);
          }}
          onSortChange={(value) => {
            onSortChange(value);
            setSort(value);
          }}
          onAuthorChange={onAuthorChange}
          onSortDirectionChange={onSortDirectionChange}
          onPageSizeChange={onPageSizeChange}
        />
      );
    };
    render(
      <ChakraProvider>
        <MemoryRouter>
          <StatefulCatalog />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Priority' }));
    await user.click(screen.getByRole('checkbox', { name: 'High' }));
    expect(onPriorityChange).toHaveBeenLastCalledWith('high');
    expect(screen.getByRole('button', { name: 'Priority:High' })).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Medium' }));
    expect(onPriorityChange).toHaveBeenLastCalledWith('high,medium');
    expect(screen.getByRole('button', { name: 'Priority: 2' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByRole('button', { name: 'Priority: 2' })).toHaveAttribute('aria-expanded', 'false');
    await user.click(screen.getByRole('button', { name: 'Author' }));
    await user.click(screen.getByRole('checkbox', { name: 'Ada Lovelace' }));
    expect(onAuthorChange).toHaveBeenCalledWith(['user-1']);
    await user.click(screen.getByRole('button', { name: 'Done' }));
    await user.click(screen.getByRole('button', { name: 'Sort: Run order' }));
    await user.click(screen.getByRole('button', { name: /^Key$/ }));
    await user.click(screen.getByRole('button', { name: 'Sort descending' }));
    await user.selectOptions(screen.getByLabelText('Rows per page'), '50');
    expect(onPriorityChange).toHaveBeenCalledWith('high,medium');
    expect(onAuthorChange).toHaveBeenCalledWith(['user-1']);
    expect(onSortChange).toHaveBeenCalledWith('scenarioKey');
    expect(onSortDirectionChange).toHaveBeenCalledWith('asc');
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
    expect(screen.queryByText('Press / to search')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Run/i })).not.toBeInTheDocument();
  });

  it('renders a fallback for null details', () => {
    renderView({ scenarios: [{ ...scenarios[0], scenarioKey: 'TMS-1', details: null }] });

    expect(screen.getByText('TMS-1')).toBeInTheDocument();
  });

  it('keeps the active search and filters visible without filling the search field', () => {
    renderView({ search: 'checkout', priority: 'high', authorId: 'user-1' });

    expect(screen.getByRole('textbox', { name: 'Search scenarios' })).toHaveValue('checkout');
    expect(screen.getByText('1 search term active')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Priority:High' })).toBeInTheDocument();
  });

  it('requires count-based delete confirmation for the exact selected UUIDs', async () => {
    const user = userEvent.setup();
    const onDeleteSelected = vi.fn(async (ids: string[]) => ({
      succeededIds: ids,
      failedIds: [],
      unattemptedIds: [],
      uncertainIds: [],
    }));
    renderView({ selectedIds: ['scenario-1', 'scenario-2'], onDeleteSelected });
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('heading', { name: 'Delete 2 selected scenarios?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onDeleteSelected).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete 2 scenarios' }));
    expect(onDeleteSelected).toHaveBeenCalledWith(['scenario-1', 'scenario-2']);
  });

  it('reports partial deletion instead of silently closing the confirmation', async () => {
    const user = userEvent.setup();
    renderView({
      selectedIds: ['scenario-1', 'scenario-2', 'scenario-3'],
      onDeleteSelected: vi.fn(async () => ({
        succeededIds: ['scenario-1'], failedIds: ['scenario-2'], unattemptedIds: ['scenario-3'], uncertainIds: [],
        errorMessage: 'Permission denied',
      })),
    });
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete 3 scenarios' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Permission denied');
    expect(screen.getByRole('alert')).toHaveTextContent('1 failed');
    expect(screen.getByRole('alert')).toHaveTextContent('1 not attempted');
  });

  it('closes the bulk toolbar with a keyboard accessible clear control', async () => {
    const user = userEvent.setup();
    const toggleSelected = vi.fn();
    const StatefulCatalog = () => {
      const [selectedIds, setSelectedIds] = useState(['scenario-1', 'scenario-2']);
      return (
        <ChakraProvider>
          <MemoryRouter>
            <TestScenarioCatalogView
              scenarios={scenarios}
              pagination={pagination}
              isLoading={false}
              onPageChange={vi.fn()}
              {...defaultProps}
              selectedIds={selectedIds}
              toggleSelected={(id) => {
                toggleSelected(id);
                setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
              }}
            />
          </MemoryRouter>
        </ChakraProvider>
      );
    };
    render(<StatefulCatalog />);
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(toggleSelected).toHaveBeenCalledWith('scenario-1');
    expect(toggleSelected).toHaveBeenCalledWith('scenario-2');
    expect(screen.queryByRole('button', { name: 'Run selected' })).not.toBeInTheDocument();
  });

  it('renders a fallback for null priority', () => {
    renderView({ scenarios: [{ ...scenarios[0], scenarioKey: 'TMS-1', details: null, priority: null }] });

    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('TMS-1')).toBeInTheDocument();
  });

  it('maps every scenario title to its own detail route while keeping actions separate', () => {
    renderView({
      scenarios: [
        ...scenarios,
        {
          id: 'scenario-2',
          projectId: 'project-1',
          folderId: null,
          folderName: null,
          createdById: 'user-2',
          scenarioKey: 'TMS-1',
          title: 'Refund flow',
          details: null,
          priority: null,
          createdBy: { id: 'user-2', name: 'Grace Hopper', email: 'grace@example.com' },
          createdAt: '2026-09-03T10:00:00.000Z',
          updatedAt: '2026-09-03T11:00:00.000Z',
        },
      ],
    });

    expect(screen.getByRole('link', { name: 'Checkout flow' })).toHaveAttribute('href', '/test-scenarios/scenario-1?originProject=project-1&originKind=all');
    expect(screen.getByRole('link', { name: 'Refund flow' })).toHaveAttribute('href', '/test-scenarios/scenario-2?originProject=project-1&originKind=all');
    expect(screen.getByText('Grace H.')).toBeInTheDocument();
    expect(screen.queryByText('grace@example.com')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Grace Hopper (grace@example.com)')).not.toBeInTheDocument();
    expect(screen.getByText('Grace H.').closest('[data-tooltip-content]')).toHaveAttribute(
      'data-tooltip-content', 'Grace Hopper (grace@example.com)',
    );
    expect(screen.queryAllByTestId('context-menu-button')).toHaveLength(0);
  });

  it('reports the create action from the catalog header', async () => {
    const user = userEvent.setup();
    const onCreateScenario = vi.fn();

    renderView({ onCreateScenario });

    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));

    expect(onCreateScenario).toHaveBeenCalledTimes(1);
  });

  it('confirms whole-subtree deletion and sends scenarios to No folder', async () => {
    const user = userEvent.setup();
    const restoreData = {
      folders: [{ id: 'folder-1', projectId: 'project-1', name: 'Authentication', description: null, parentId: null, position: 0 }],
      scenarios: [{ scenarioId: 'scenario-1', folderId: 'folder-1', expectedRevision: 2 }],
    };
    const onDeleteFolder = vi.fn(async () => ({ deleted: true as const, restoreData }));
    const restoreFolderDeletion = vi.fn(async () => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderView({
      folders: [
        {
          id: 'folder-1', name: 'Authentication', parentId: null, position: 0, scenarioCount: 1,
          children: [
            { id: 'child-1', name: 'Payments', parentId: 'folder-1', scenarioCount: 2, children: [{ id: 'child-3', name: 'Profile', parentId: 'child-1', scenarioCount: 1, children: [] }] },
            { id: 'child-2', name: 'Promo codes', parentId: 'folder-1', scenarioCount: 3, children: [{ id: 'child-4', name: 'Cart', parentId: 'child-2', scenarioCount: 0, children: [] }] },
          ],
        },
      ],
      scope: { kind: 'folder', id: 'folder-1' },
      onDeleteFolder,
      restoreFolderDeletion,
    });
    await user.click(screen.getByRole('button', { name: 'Folder actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete folder' }));
    expect(screen.getByRole('heading', { name: 'Delete folder “Authentication”?' })).toBeInTheDocument();
    expect(screen.getByText('Its 4 subfolders “Payments”, “Profile”, “Promo codes”, “Cart” will be deleted as well. All 7 scenarios from these folders will move to No folder. Scenarios are not deleted.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDeleteFolder).toHaveBeenCalledWith('folder-1');
    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    expect(restoreFolderDeletion).toHaveBeenCalledWith(restoreData);
  });

  it('explains that scenarios in a folder without children are not deleted', async () => {
    const user = userEvent.setup();
    renderView({
      folders: [{ id: 'folder-1', name: 'Authentication', parentId: null, position: 0, scenarioCount: 5, children: [] }],
      scope: { kind: 'folder', id: 'folder-1' },
    });

    await user.click(screen.getByRole('button', { name: 'Folder actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete folder' }));

    expect(screen.getByText('All 5 scenarios in this folder will move to No folder. Scenarios are not deleted.')).toBeInTheDocument();
  });

  it('moves a suite row down when dropped on a later row', async () => {
    const onReorderSuite = vi.fn(async () => {});
    const members = [
      { suiteId: 'suite-1', testScenarioId: 'scenario-1', position: 0, createdAt: '' },
      { suiteId: 'suite-1', testScenarioId: 'scenario-2', position: 1, createdAt: '' },
    ];
    renderView({ organizationTab: 'suites', scenarios: [scenarios[0], { ...scenarios[0], id: 'scenario-2', title: 'Second scenario' }], pagination: { ...pagination, total: 2 }, suites: [{ id: 'suite-1', name: 'Regression', description: null, purpose: null, release: null, membershipRevision: 0, members }], scope: { kind: 'suite', id: 'suite-1' }, onReorderSuite });
    const target = screen.getByTestId('test-scenario-scenario-2');
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({ top: 100, bottom: 140, height: 40 } as DOMRect);
    const dataTransfer = { setData: vi.fn(), effectAllowed: '', types: ['application/x-testportal-scenarios'], getData: () => JSON.stringify({ projectId: 'project-1', scenarioIds: ['scenario-1'] }) };
    fireEvent.dragStart(screen.getByTestId('test-scenario-scenario-1'), { dataTransfer });
    fireEvent.drop(target, { dataTransfer, clientY: 135 });
    await waitFor(() => expect(onReorderSuite).toHaveBeenCalledWith('suite-1', ['scenario-2', 'scenario-1']));
  });

  it('drags an unselected suite row to reorder without changing the selection', async () => {
    const onSuiteOperationComplete = vi.fn();
    const onReorderSuite = vi.fn(async () => {});
    const members = [
      { suiteId: 'suite-1', testScenarioId: 'scenario-1', position: 0, createdAt: '' },
      { suiteId: 'suite-1', testScenarioId: 'scenario-2', position: 1, createdAt: '' },
    ];

    renderView({
      organizationTab: 'suites',
      scenarios: [scenarios[0], { ...scenarios[0], id: 'scenario-2', title: 'Second scenario' }],
      pagination: { ...pagination, total: 2 },
      suites: [{ id: 'suite-1', name: 'Regression', description: null, purpose: null, release: null, membershipRevision: 0, members }],
      scope: { kind: 'suite', id: 'suite-1' },
      selectedIds: ['scenario-1'],
      onSuiteOperationComplete,
      onReorderSuite,
    });
    const dragHandle = screen.getByRole('button', { name: 'Drag Second scenario to another suite or reorder' });
    fireEvent.dragStart(dragHandle, { dataTransfer: { setData: vi.fn(), effectAllowed: '' } });
    fireEvent.drop(screen.getByTestId('test-scenario-scenario-1'), {
      dataTransfer: {
        types: ['application/x-testportal-scenarios'],
        getData: () => JSON.stringify({ projectId: 'project-1', scenarioIds: ['scenario-2'] }),
      },
    });
    await waitFor(() => expect(onReorderSuite).toHaveBeenCalledWith('suite-1', ['scenario-2', 'scenario-1']));
    expect(screen.getByRole('checkbox', { name: 'Select Checkout flow' })).toBeChecked();

    expect(screen.getByRole('button', { name: 'Run suite' })).toBeInTheDocument();
    expect(onSuiteOperationComplete).not.toHaveBeenCalled();
  });

  it('keeps suite membership Undo available after ten seconds', async () => {
    renderView({
      organizationTab: 'suites',
      scope: { kind: 'suite', id: 'suite-1' },
      selectedIds: ['scenario-1'],
      suites: [{ id: 'suite-1', name: 'Smoke R2.4', description: null, purpose: null, release: null, membershipRevision: 1, members: [{ testScenarioId: 'scenario-1' }] }],
    });
    vi.useFakeTimers();
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Remove from suite' }));
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Remove 1 scenario' })); });
      expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
      act(() => { vi.advanceTimersByTime(10000); });
      expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('checkbox', { name: 'Select Checkout flow' }));
      expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
    } finally { vi.useRealTimers(); }
  });

  it('keeps suite membership Undo when switching suites', async () => {
    const user = userEvent.setup();
    const onScopeChange = vi.fn();
    renderView({
      organizationTab: 'suites',
      scope: { kind: 'suite', id: 'suite-1' },
      selectedIds: ['scenario-1'],
      suites: [
        { id: 'suite-1', name: 'Smoke R2.4', description: null, purpose: null, release: null, membershipRevision: 1, members: [{ testScenarioId: 'scenario-1' }] },
        { id: 'suite-2', name: 'Regression', description: null, purpose: null, release: null, membershipRevision: 0, members: [] },
      ],
      onScopeChange,
    });
    await user.click(screen.getByRole('button', { name: 'Remove from suite' }));
    await user.click(screen.getByRole('button', { name: 'Remove 1 scenario' }));
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
    await user.click(screen.getByText('Regression'));
    expect(onScopeChange).toHaveBeenCalledWith({ kind: 'suite', id: 'suite-2' });
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  it('removes selected suite membership and restores it through Undo', async () => {
    const user = userEvent.setup();
    const removeSuiteMembership = vi.fn(async () => ({
      restoreData: { suiteId: 'suite-1', addedScenarioIds: [], removedMembers: [{ scenarioId: 'scenario-1', position: 0 }] },
      expectedMembershipRevision: 2,
      expectedScenarioIds: [],
    }));
    const restoreSuiteMembership = vi.fn(async () => {});
    renderView({
      organizationTab: 'suites',
      scope: { kind: 'suite', id: 'suite-1' },
      selectedIds: ['scenario-1'],
      suites: [{ id: 'suite-1', name: 'Smoke R2.4', description: null, purpose: null, release: null, membershipRevision: 1, members: [{ testScenarioId: 'scenario-1' }] }],
      removeSuiteMembership,
      restoreSuiteMembership,
    });

    await user.click(screen.getByRole('button', { name: 'Remove from suite' }));
    await user.click(screen.getByRole('button', { name: 'Remove 1 scenario' }));
    await waitFor(() => expect(removeSuiteMembership).toHaveBeenCalledWith('suite-1', ['scenario-1']));
    expect(screen.getByRole('status', { name: 'Suite membership notification' })).toHaveTextContent('1 scenario removed from Smoke R2.4');
    expect(screen.queryByText(/Undo is available for 10 seconds/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    await waitFor(() => expect(restoreSuiteMembership).toHaveBeenCalledWith(expect.objectContaining({
      restoreData: { suiteId: 'suite-1', addedScenarioIds: [], removedMembers: [{ scenarioId: 'scenario-1', position: 0 }] },
      expectedMembershipRevision: 2,
      expectedScenarioIds: [],
    })));
  });

  it('moves a dragged suite row to another suite and offers conditional Undo', async () => {
    const user = userEvent.setup();
    const moveSuiteMembership = vi.fn(async () => ({
      restoreData: { sourceSuiteId: 'suite-1', destinationSuiteId: 'suite-2', sourceMembers: [], destinationAddedScenarioIds: [] },
      expectedSourceMembershipRevision: 2,
      expectedDestinationMembershipRevision: 3,
      expectedSourceScenarioIds: [],
      expectedDestinationScenarioIds: ['scenario-1'],
      alreadyInDestination: ['scenario-1'],
    }));
    const restoreSuiteMove = vi.fn(async () => {});
    renderView({
      organizationTab: 'suites',
      scenarios: [scenarios[0]],
      pagination: { ...pagination, total: 1 },
      suites: [
        { id: 'suite-1', name: 'Source', description: null, purpose: null, release: null, membershipRevision: 1, members: [{ testScenarioId: 'scenario-1' }] },
        { id: 'suite-2', name: 'Destination', description: null, purpose: null, release: null, membershipRevision: 2, members: [] },
      ],
      scope: { kind: 'suite', id: 'suite-1' },
      moveSuiteMembership,
      restoreSuiteMove,
    });
    const dataTransfer = {
      setData: vi.fn(),
      effectAllowed: '',
      types: ['application/x-testportal-scenarios'],
      getData: () => JSON.stringify({ projectId: 'project-1', scenarioIds: ['scenario-1'] }),
    };
    fireEvent.dragStart(screen.getByRole('button', { name: 'Drag Checkout flow to another suite or reorder' }), { dataTransfer });
    fireEvent.drop(screen.getByRole('button', { name: /Destination 0/ }), { dataTransfer });
    await waitFor(() => expect(moveSuiteMembership).toHaveBeenCalledWith('suite-1', 'suite-2', ['scenario-1']));
    expect(screen.getByRole('status', { name: 'Suite membership notification' })).toHaveTextContent('AUTH-1 is already in Destination — removed from Source');
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    await waitFor(() => expect(restoreSuiteMove).toHaveBeenCalled());
  });

  it('prevents duplicate Undo requests while restoration is pending', async () => {
    const user = userEvent.setup();
    let finishRestore: (() => void) | undefined;
    const restoreSuiteMembership = vi.fn(() => new Promise<void>((resolve) => { finishRestore = resolve; }));
    renderView({
      organizationTab: 'suites',
      scope: { kind: 'suite', id: 'suite-1' },
      selectedIds: ['scenario-1'],
      suites: [{ id: 'suite-1', name: 'Smoke R2.4', description: null, purpose: null, release: null, membershipRevision: 1, members: [{ testScenarioId: 'scenario-1' }] }],
      removeSuiteMembership: vi.fn(async () => ({
        restoreData: { suiteId: 'suite-1', addedScenarioIds: [], removedMembers: [{ scenarioId: 'scenario-1', position: 0 }] },
        expectedMembershipRevision: 2,
        expectedScenarioIds: [],
      })),
      restoreSuiteMembership,
    });

    await user.click(screen.getByRole('button', { name: 'Remove from suite' }));
    await user.click(screen.getByRole('button', { name: 'Remove 1 scenario' }));
    const undo = await screen.findByRole('button', { name: 'Undo' });
    await user.click(undo);
    await waitFor(() => expect(restoreSuiteMembership).toHaveBeenCalledTimes(1));
    expect(undo).toBeDisabled();
    finishRestore?.();
  });

  it('shows scenario bulk actions in the requested order without a More menu', () => {
    renderView({ selectedIds: ['scenario-1'] });
    const toolbar = screen.getByRole('toolbar', { name: 'Bulk scenario actions' });
    expect(screen.queryByRole('button', { name: 'More bulk actions' })).not.toBeInTheDocument();
    expect(toolbar.textContent).toMatch(/Run selected.*Add to suite.*Delete/);
  });

  it('hides the bulk Move menu in suite scope while retaining membership actions', () => {
    const onMoveSelected = vi.fn(async () => ({
      succeededIds: [],
      failedIds: [],
      unattemptedIds: [],
      uncertainIds: [],
    }));
    renderView({
      organizationTab: 'suites',
      scope: { kind: 'suite', id: 'suite-1' },
      selectedIds: ['scenario-1'],
      suites: [{ id: 'suite-1', name: 'Regression', description: null, purpose: null, release: null, membershipRevision: 1, members: [{ testScenarioId: 'scenario-1' }] }],
      onMoveSelected,
    });
    expect(screen.queryByRole('button', { name: 'More bulk actions' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove from suite' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Run selected' })).toBeInTheDocument();
    expect(onMoveSelected).not.toHaveBeenCalled();
  });



  it('retains folder menu moves independently from suite membership', async () => {
    const user = userEvent.setup();
    const onUpdateFolder = vi.fn(async () => {});
    renderView({
      folders: [
        { id: 'folder-1', name: 'Authentication', parentId: null, position: 0, scenarioCount: 0, children: [] },
        { id: 'folder-2', name: 'Archive', parentId: null, position: 1, scenarioCount: 0, children: [] },
      ],
      scope: { kind: 'folder', id: 'folder-1' },
      onUpdateFolder,
    });
    await user.click(screen.getByRole('button', { name: 'Folder actions' }));
    await user.click(screen.getByRole('menuitem', { name: /^Move$/ }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Parent folder' }), 'folder-2');
    await user.click(screen.getByRole('button', { name: /^Move$/ }));
    expect(onUpdateFolder).toHaveBeenCalledWith('folder-1', { parentId: 'folder-2' });
  });

  it('renders pagination from the response metadata and reports page selection', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    renderView({
      pagination: { page: 1, limit: 10, total: 11, totalPages: 2 },
      onPageChange,
    });

    const table = screen.getByRole('table');
    const pagination = screen.getByRole('navigation', { name: 'Test Scenario pagination' });
    const summary = screen.getByText('1–10 of 11');

    expect(table).toBeInTheDocument();
    expect(pagination).toBeInTheDocument();
    expect(summary).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next Page' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(summary).toBeInTheDocument();
  });
});
