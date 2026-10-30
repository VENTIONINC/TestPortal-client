// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState, type ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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
  search: '',
  projectScenarioCount: 1,
  unfiledScenarioCount: 0,
  pageSize: 25,
  pageSizes: [10, 25, 50, 100],
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
  onAddSelectedToSuite: vi.fn(async () => ({ succeededIds: [], failedIds: [], unattemptedIds: [], uncertainIds: [] })),
  onDeleteSelected: vi.fn(async () => ({ succeededIds: [], failedIds: [], unattemptedIds: [], uncertainIds: [] })),
  onRemoveSelectedFromSuite: vi.fn(async () => ({
    succeededIds: [],
    failedIds: [],
    unattemptedIds: [],
    uncertainIds: [],
  })),
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
  it('shows folders and No folder last without suite navigation in Scenarios', () => {
    renderView({
      organizationTab: 'scenarios',
      suites: [{ id: 'suite-1', name: 'Release checks', description: null, purpose: null, release: null }],
    });

    expect(screen.getByRole('button', { name: /No folder/ })).toBeInTheDocument();
    expect(screen.getByText('Folders')).toBeInTheDocument();
    expect(screen.queryByText('Suites')).not.toBeInTheDocument();
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

  it('creates folders with descriptions and shows the selected folder description', async () => {
    const user = userEvent.setup();
    const onCreateFolder = vi.fn(async () => {});
    renderView({
      onCreateFolder,
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
    await user.type(screen.getByLabelText('Name'), 'OAuth');
    await user.type(screen.getByLabelText('Description (optional)'), 'OAuth cases');
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(onCreateFolder).toHaveBeenCalledWith('OAuth', 'folder-1', 'OAuth cases');
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
    await user.click(screen.getByRole('button', { name: 'Actions for folder Authentication' }));
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    await user.clear(screen.getByLabelText('Description (optional)'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onUpdateFolder).toHaveBeenCalledWith('folder-1', { name: 'Authentication', description: null });
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
    expect(screen.queryByRole('button', { name: /No folder/ })).not.toBeInTheDocument();
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

  it('renders compact summary metadata in the specified order', async () => {
    const user = userEvent.setup();
    const onContextMenu = vi.fn();

    renderView({ onContextMenu });

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
    expect(screen.getByRole('link', { name: 'Checkout flow' })).toHaveAttribute('href', '/test-scenarios/scenario-1');

    const actions = screen.getByRole('button', { name: 'Actions for Checkout flow' });
    expect(actions).toBeInTheDocument();

    await user.click(actions);

    expect(onContextMenu).toHaveBeenCalledWith(expect.anything(), scenarios[0]);
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
    renderView({ onSortChange, onPriorityChange, onAuthorChange, onSortDirectionChange, onPageSizeChange });

    await user.selectOptions(screen.getByLabelText('Priority'), 'high');
    await user.selectOptions(screen.getByLabelText('Author'), 'user-1');
    await user.selectOptions(screen.getByLabelText('Sort by'), 'scenarioKey');
    await user.selectOptions(screen.getByLabelText('Sort direction'), 'asc');
    await user.selectOptions(screen.getByLabelText('Rows per page'), '50');
    expect(onPriorityChange).toHaveBeenCalledWith('high');
    expect(onAuthorChange).toHaveBeenCalledWith('user-1');
    expect(onSortChange).toHaveBeenCalledWith('scenarioKey');
    expect(onSortDirectionChange).toHaveBeenCalledWith('asc');
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
    expect(screen.queryByText('Press / to search')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Run/i })).not.toBeInTheDocument();
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

  it('closes the bulk toolbar with a keyboard accessible clear control', async () => {
    const user = userEvent.setup();
    const toggleSelected = vi.fn();
    renderView({ selectedIds: ['scenario-1', 'scenario-2'], toggleSelected });
    await user.click(screen.getByRole('button', { name: 'Close bulk scenario actions and clear selection' }));
    expect(toggleSelected).toHaveBeenCalledWith('scenario-1');
    expect(toggleSelected).toHaveBeenCalledWith('scenario-2');
    expect(screen.queryByRole('button', { name: /Run/i })).not.toBeInTheDocument();
  });

  it('renders a fallback for null priority', () => {
    renderView({ scenarios: [{ ...scenarios[0], scenarioKey: null, details: null, priority: null }] });

    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('—', { selector: 'p' })).toBeInTheDocument();
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
          priority: null,
          createdBy: { id: 'user-2', name: 'Grace Hopper', email: 'grace@example.com' },
          createdAt: '2026-09-03T10:00:00.000Z',
          updatedAt: '2026-09-03T11:00:00.000Z',
        },
      ],
    });

    expect(screen.getByRole('link', { name: 'Checkout flow' })).toHaveAttribute('href', '/test-scenarios/scenario-1');
    expect(screen.getByRole('link', { name: 'Refund flow' })).toHaveAttribute('href', '/test-scenarios/scenario-2');
    expect(screen.getByText('Grace H.')).toBeInTheDocument();
    expect(screen.queryByText('grace@example.com')).not.toBeInTheDocument();
    expect(screen.getByTitle('Grace Hopper (grace@example.com)')).toBeInTheDocument();
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
      folders: [
        { id: 'folder-1', name: 'Authentication', parentId: null, position: 0, scenarioCount: 2, children: [] },
      ],
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
    const onAddSelectedToSuite = vi.fn(async () => ({
      succeededIds: [],
      failedIds: [],
      unattemptedIds: [],
      uncertainIds: [],
    }));
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
    const onMoveSelected = vi.fn(async () => ({
      succeededIds: [],
      failedIds: [],
      unattemptedIds: [],
      uncertainIds: [],
    }));
    renderView({ scope: { kind: 'suite', id: 'suite-1' }, selectedIds: ['scenario-1'], onMoveSelected });
    expect(screen.queryByRole('button', { name: 'Move…' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove from suite' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to suite…' })).toBeInTheDocument();
    expect(onMoveSelected).not.toHaveBeenCalled();
  });

  it.each(['all', 'folder', 'unfiled'] as const)('retains bulk folder assignment in %s scope', async (kind) => {
    const user = userEvent.setup();
    const onMoveSelected = vi.fn(async () => ({
      succeededIds: [],
      failedIds: [],
      unattemptedIds: [],
      uncertainIds: [],
    }));
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
      scope: { kind: 'folder', id: 'folder-1' },
      onUpdateFolder,
    });
    await user.click(screen.getByRole('button', { name: 'Actions for folder Authentication' }));
    await user.click(screen.getByRole('menuitem', { name: /^Move$/ }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Parent folder' }), 'folder-2');
    await user.click(screen.getByRole('button', { name: /^Move$/ }));
    expect(onUpdateFolder).toHaveBeenCalledWith('folder-1', { parentId: 'folder-2' });
  });

  it('closes a stale Move dialog when switching into a suite and does not reopen it on return', async () => {
    const user = userEvent.setup();
    const onMoveSelected = vi.fn(async () => ({
      succeededIds: [],
      failedIds: [],
      unattemptedIds: [],
      uncertainIds: [],
    }));
    const props = {
      scenarios,
      pagination,
      isLoading: false,
      onPageChange: vi.fn(),
      ...defaultProps,
      selectedIds: ['scenario-1'],
      onMoveSelected,
    };
    const tree = (scope: TestScenarioCatalogViewProps['scope']) => (
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogView {...props} scope={scope} />
        </MemoryRouter>
      </ChakraProvider>
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
