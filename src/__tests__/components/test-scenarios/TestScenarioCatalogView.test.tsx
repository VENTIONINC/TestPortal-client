// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
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
    Tooltip: ({ children }: { children: ReactNode }) => children,
  };
});

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
    createdBy: { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' },
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-02T11:00:00.000Z',
  },
];

const pagination = {
  page: 1,
  limit: 10,
  total: 1,
  totalPages: 1,
};

const defaultProps: Omit<TestScenarioCatalogViewProps, 'scenarios' | 'pagination' | 'isLoading' | 'onPageChange'> = {
  search: '',
  onSearchChange: vi.fn(),
  sort: undefined,
  sortDirection: 'desc',
  onSortChange: vi.fn(),
  columnFilters: { scenarioKey: '', title: '', details: '', folder: '', createdBy: '' },
  onColumnFilterChange: vi.fn(),
  scope: { kind: 'all' },
  onScopeChange: vi.fn(),
  folders: [],
  suites: [],
  organizationLoading: false,
  selectedIds: [],
  toggleSelected: vi.fn(),
  onMoveSelected: vi.fn(async () => {}),
  onAddSelectedToSuite: vi.fn(async () => {}),
  onRemoveSelectedFromSuite: vi.fn(async () => {}),
  onReorderSuite: vi.fn(async () => {}),
  onCreateFolder: vi.fn(async () => {}),
  onUpdateFolder: vi.fn(async () => {}),
  onDeleteFolder: vi.fn(async () => {}),
  onCreateSuite: vi.fn(async () => {}),
  onUpdateSuite: vi.fn(async () => {}),
  onDeleteSuite: vi.fn(async () => {}),
  includeDescendants: true,
  onIncludeDescendantsChange: vi.fn(),
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
  it('shows folder and unfiled navigation without suite navigation in Scenarios', () => {
    renderView({ organizationTab: 'scenarios', suites: [{ id: 'suite-1', name: 'Release checks', description: null, purpose: null, release: null }] });

    expect(screen.getByRole('button', { name: /Unfiled/ })).toBeInTheDocument();
    expect(screen.getByText('Folders')).toBeInTheDocument();
    expect(screen.queryByText('Suites')).not.toBeInTheDocument();
  });

  it('shows suite selection without folder navigation in Suites', () => {
    renderView({
      organizationTab: 'suites',
      scope: { kind: 'suite' },
      folders: [{ id: 'folder-1', name: 'Smoke', parentId: null, scenarioCount: 1 }],
      suites: [{ id: 'suite-1', name: 'Release checks', description: null, purpose: null, release: null }],
    });

    expect(screen.getByText('Suites')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Release checks/ })).toBeInTheDocument();
    expect(screen.queryByText('Folders')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Unfiled/ })).not.toBeInTheDocument();
    expect(screen.getByText('Select a suite to view its scenarios.')).toBeInTheDocument();
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
    expect(screen.queryByRole('button', { name: 'Next Page' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Test Scenario' })).toBeInTheDocument();
  });

  it('renders summary metadata in order with a final untitled actions column', async () => {
    const user = userEvent.setup();
    const onContextMenu = vi.fn();

    renderView({ onContextMenu });

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(9);
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Select',
      'Scenario key',
      'Title',
      'Details',
      'Folder',
      'Created by',
      'Created',
      'Updated',
      '',
    ]);
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByRole('row', { name: /Checkout flow/ })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'AUTH-1' })).toBeInTheDocument();
    expect(screen.getByText('Details with **Markdown** <strong>HTML</strong>')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByText(/9\/1\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/9\/2\/2026/)).toBeInTheDocument();
    expect(screen.queryByText('# Checkout flow')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Checkout flow' })).toHaveAttribute('href', '/test-scenarios/scenario-1');

    const actions = screen.getByRole('button', { name: 'Actions for Checkout flow' });
    expect(actions).toBeInTheDocument();

    await user.click(actions);

    expect(onContextMenu).toHaveBeenCalledWith(expect.anything(), scenarios[0]);
  });

  it('offers sort and filter controls on the supported columns and removes the global sort selector', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const onColumnFilterChange = vi.fn();
    renderView({ onSortChange, onColumnFilterChange });

    expect(screen.queryByLabelText('Sort scenarios')).not.toBeInTheDocument();
    for (const column of ['Scenario key', 'Title', 'Details', 'Folder', 'Created by', 'Created', 'Updated']) {
      const accessibleName = column === 'Created' ? 'Sort by Created descending' : `Sort by ${column}`;
      expect(screen.getByRole('button', { name: accessibleName })).toBeInTheDocument();
    }
    for (const column of ['Scenario key', 'Title', 'Details', 'Folder', 'Created by']) {
      expect(screen.getByRole('button', { name: `Filter by ${column}` })).toBeInTheDocument();
    }
    expect(screen.queryByRole('button', { name: 'Filter by Created' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Filter by Updated' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sort by Title' }));
    expect(onSortChange).toHaveBeenCalledWith('title');
    await user.click(screen.getByRole('button', { name: 'Filter by Title' }));
    await user.type(screen.getByRole('textbox', { name: 'Title filter' }), 'checkout');
    expect(onColumnFilterChange).toHaveBeenCalledWith('title', 't');
  });

  it('renders a fallback for null details', () => {
    renderView({ scenarios: [{ ...scenarios[0], scenarioKey: null, details: null }] });

    expect(screen.getByText('No details')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
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
          scenarioKey: null,
          title: 'Refund flow',
          details: null,
          createdBy: { id: 'user-2', name: 'Grace Hopper', email: 'grace@example.com' },
          createdAt: '2026-09-03T10:00:00.000Z',
          updatedAt: '2026-09-03T11:00:00.000Z',
        },
      ],
    });

    expect(screen.getByRole('link', { name: 'Checkout flow' })).toHaveAttribute('href', '/test-scenarios/scenario-1');
    expect(screen.getByRole('link', { name: 'Refund flow' })).toHaveAttribute('href', '/test-scenarios/scenario-2');
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('grace@example.com')).toBeInTheDocument();
    expect(screen.getAllByTestId('context-menu-button')).toHaveLength(2);
  });

  it('reports the create action from the catalog header', async () => {
    const user = userEvent.setup();
    const onCreateScenario = vi.fn();

    renderView({ onCreateScenario });

    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));

    expect(onCreateScenario).toHaveBeenCalledTimes(1);
  });

  it('requires a deletion disposition and explains child-folder promotion', async () => {
    const user = userEvent.setup();
    const onDeleteFolder = vi.fn(async () => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderView({
      folders: [{ id: 'folder-1', name: 'Authentication', parentId: null, position: 0, scenarioCount: 2, children: [] }],
      scope: { kind: 'folder', id: 'folder-1' },
      onDeleteFolder,
    });
    await user.click(screen.getByRole('button', { name: 'Actions for folder Authentication' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Move direct scenarios to' }), 'unfiled');
    expect(screen.getByText(/Child folders will be promoted/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDeleteFolder).toHaveBeenCalledWith('folder-1', 'unfiled');
  });

  it('confirms suite membership changes and submits the ordered member UUID list', async () => {
    const user = userEvent.setup();
    const onAddSelectedToSuite = vi.fn(async () => {});
    const onReorderSuite = vi.fn(async () => {});
    const members = [
      { suiteId: 'suite-1', testScenarioId: 'scenario-1', position: 0, createdAt: '' },
      { suiteId: 'suite-1', testScenarioId: 'scenario-2', position: 1, createdAt: '' },
    ];

    renderView({
      suites: [{ id: 'suite-1', name: 'Regression', description: null, purpose: null, release: null, members }],
      scope: { kind: 'suite', id: 'suite-1' },
      selectedIds: ['scenario-1'],
      onAddSelectedToSuite,
      onReorderSuite,
    });
    await user.click(screen.getByRole('button', { name: 'Manage suite order (2)' }));
    await user.click(screen.getByRole('button', { name: 'Move member 1 down' }));
    expect(onReorderSuite).toHaveBeenCalledWith('suite-1', ['scenario-2', 'scenario-1']);

    await user.click(screen.getByRole('button', { name: 'Add to suite…' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Suite' }), 'suite-1');
    await user.click(screen.getByRole('button', { name: 'Add to suite' }));
    expect(onAddSelectedToSuite).toHaveBeenCalledWith('suite-1');
  });

  it('hides bulk Move in suite scope while retaining membership actions', () => {
    const onMoveSelected = vi.fn(async () => {});
    renderView({ scope: { kind: 'suite', id: 'suite-1' }, selectedIds: ['scenario-1'], onMoveSelected });
    expect(screen.queryByRole('button', { name: 'Move…' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove from suite' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to suite…' })).toBeInTheDocument();
    expect(onMoveSelected).not.toHaveBeenCalled();
  });

  it.each(['all', 'folder', 'unfiled'] as const)('retains bulk folder assignment in %s scope', async (kind) => {
    const user = userEvent.setup();
    const onMoveSelected = vi.fn(async () => {});
    renderView({ scope: { kind, id: 'folder-1' }, selectedIds: ['scenario-1'], onMoveSelected });
    await user.click(screen.getByRole('button', { name: 'Move…' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Destination folder' }), '__unfiled__');
    await user.click(screen.getByRole('button', { name: 'Move 1 scenario' }));
    expect(onMoveSelected).toHaveBeenCalledWith(null);
  });

  it('retains folder menu moves independently from suite membership', async () => {
    const user = userEvent.setup();
    const onUpdateFolder = vi.fn(async () => {});
    renderView({
      folders: [
        { id: 'folder-1', name: 'Authentication', parentId: null, position: 0, scenarioCount: 0, children: [] },
        { id: 'folder-2', name: 'Archive', parentId: null, position: 1, scenarioCount: 0, children: [] },
      ],
      scope: { kind: 'folder', id: 'folder-1' }, onUpdateFolder,
    });
    await user.click(screen.getByRole('button', { name: 'Actions for folder Authentication' }));
    await user.click(screen.getByRole('menuitem', { name: /^Move$/ }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Parent folder' }), 'folder-2');
    await user.click(screen.getByRole('button', { name: /^Move$/ }));
    expect(onUpdateFolder).toHaveBeenCalledWith('folder-1', { parentId: 'folder-2' });
  });

  it('closes a stale Move dialog when switching into a suite and does not reopen it on return', async () => {
    const user = userEvent.setup();
    const onMoveSelected = vi.fn(async () => {});
    const props = { scenarios, pagination, isLoading: false, onPageChange: vi.fn(), ...defaultProps, selectedIds: ['scenario-1'], onMoveSelected };
    const tree = (scope: TestScenarioCatalogViewProps['scope']) => (
      <ChakraProvider><MemoryRouter><TestScenarioCatalogView {...props} scope={scope} /></MemoryRouter></ChakraProvider>
    );
    const view = render(tree({ kind: 'all' }));
    await user.click(screen.getByRole('button', { name: 'Move…' }));
    expect(screen.getByRole('combobox', { name: 'Destination folder' })).toBeInTheDocument();
    view.rerender(tree({ kind: 'suite', id: 'suite-1' }));
    expect(screen.queryByRole('combobox', { name: 'Destination folder' })).not.toBeInTheDocument();
    view.rerender(tree({ kind: 'all' }));
    expect(screen.queryByRole('combobox', { name: 'Destination folder' })).not.toBeInTheDocument();
    expect(onMoveSelected).not.toHaveBeenCalled();
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
    const summary = screen.getByText('Showing 1-10 of 11 Test Scenarios');

    expect(table).toBeInTheDocument();
    expect(pagination).toBeInTheDocument();
    expect(summary).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^2$/ }));

    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(summary).toBeInTheDocument();
  });
});
