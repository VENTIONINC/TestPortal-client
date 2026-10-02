// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import type { ManualTestRunSummaryRead } from '@/redux/apis/generatedApi';
import { ManualTestRunHistoryView, type ManualTestRunHistoryViewProps } from '@/components/manual-test-runs/components/ManualTestRunHistoryView';

vi.mock('@/components/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/ui')>();
  return {
    ...actual,
    Tooltip: ({ children, content }: { children: ReactNode; content: ReactNode }) => (
      <span title={typeof content === 'string' ? content : undefined}>{children}</span>
    ),
  };
});

const run: ManualTestRunSummaryRead = {
  id: 'run-1',
  projectId: 'project-1',
  sourceTestScenarioId: 'scenario-1',
  runKey: null,
  sourceScenarioKey: null,
  testScenarioId: null,
  executedById: null,
  executedBy: null,
  title: 'Deleted source snapshot',
  status: 'in_progress',
  startedAt: '2026-09-18T10:00:00.000Z',
  completedAt: null,
  updatedAt: '2026-09-18T10:00:00.000Z',
};

const defaultProps: ManualTestRunHistoryViewProps = {
  data: { runs: [run], total: 31, page: 1, limit: 30, totalPages: 2 },
  error: undefined,
  isLoading: false,
  isFetching: false,
  isNotFound: false,
  filters: { status: '', sourceTestScenarioId: '', sourceScenarioKey: '', startedOnOrAfter: '', startedOnOrBefore: '' },
  dateError: undefined,
  isFiltered: false,
  isProjectHistory: true,
  onStatusChange: vi.fn(),
  onSourceChange: vi.fn(),
  onStartDateChange: vi.fn(),
  onEndDateChange: vi.fn(),
  onSourceKeyChange: vi.fn(),
  onApplyFilters: vi.fn(),
  onClearFilters: vi.fn(),
  onPageChange: vi.fn(),
  onRetry: vi.fn(),
  onProjectHistory: vi.fn(),
  onSourceHistory: vi.fn(),
};

const renderView = (props: Partial<ManualTestRunHistoryViewProps> = {}) => render(
  <ChakraProvider>
    <MemoryRouter>
      <ManualTestRunHistoryView {...defaultProps} {...props} />
    </MemoryRouter>
  </ChakraProvider>,
);

describe('ManualTestRunHistoryView', () => {
  it('renders server rows, nullable fields, deleted provenance, resume and pagination', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderView({ onPageChange });

    expect(screen.getByText('Deleted source snapshot')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Run key' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Scenario key' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Source' })).toBeInTheDocument();
    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers.indexOf('Run key')).toBe(0);
    expect(headers.indexOf('Title')).toBe(1);
    const row = screen.getByTestId<HTMLTableRowElement>('manual-test-run-run-1');
    expect(row.cells[0]).toHaveTextContent('N/A');
    expect(within(row.cells[1]).getByRole('link', { name: 'Deleted source snapshot' })).toBeInTheDocument();
    expect(row.cells[3]).toHaveTextContent('N/A');
    expect(within(row.cells[4]).getByText('Source deleted')).toBeInTheDocument();
    expect(screen.getByText('Source deleted')).toBeInTheDocument();
    expect(screen.getByText('Executor unavailable')).toBeInTheDocument();
    expect(screen.getAllByText('Not available')).toHaveLength(1);
    expect(screen.getAllByText('View')).toHaveLength(1);
    expect(screen.queryByText('Resume')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next Page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('shows the project key filter and applies it explicitly', async () => {
    const user = userEvent.setup();
    const onSourceKeyChange = vi.fn();
    const onApplyFilters = vi.fn();
    renderView({ filters: { ...defaultProps.filters, sourceScenarioKey: ' R1 ' }, onSourceKeyChange, onApplyFilters });

    await user.type(screen.getByRole('textbox', { name: 'Scenario key' }), 'X');
    const infoIcon = screen.getByLabelText('Scenario key filter information');
    await user.hover(infoIcon);
    expect(infoIcon.parentElement).toHaveAttribute('title', 'Exact match, case-sensitive.');
    expect(onSourceKeyChange).toHaveBeenCalled();
    expect(onApplyFilters).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onApplyFilters).toHaveBeenCalledOnce();
  });

  it('shows captured keys on historical rows while preserving UUID source history actions', async () => {
    const user = userEvent.setup();
    const onSourceHistory = vi.fn();
    renderView({
      onSourceHistory,
      data: { runs: [{ ...run, runKey: 'RUN-2026-VERY-LONG-KEY', sourceScenarioKey: 'AUTH-LOGIN', testScenarioId: 'renamed-or-live' }], total: 1, page: 1, limit: 30, totalPages: 1 },
    });

    expect(screen.getByRole('columnheader', { name: 'Run key' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Scenario key' })).toBeInTheDocument();
    expect(screen.getByText('RUN-2026-VERY-LONG-KEY')).toBeInTheDocument();
    expect(screen.getByText('AUTH-LOGIN')).toBeInTheDocument();
    const row = screen.getByTestId<HTMLTableRowElement>('manual-test-run-run-1');
    expect(row.cells[0]).toHaveTextContent('RUN-2026-VERY-LONG-KEY');
    expect(within(row.cells[1]).getByRole('link', { name: 'Deleted source snapshot' })).toBeInTheDocument();
    expect(row.cells[3]).toHaveTextContent('AUTH-LOGIN');
    expect(within(row.cells[4]).getByRole('button', { name: 'View source history' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'View source history' }));
    expect(onSourceHistory).toHaveBeenCalledWith(expect.objectContaining({ sourceTestScenarioId: 'scenario-1', sourceScenarioKey: 'AUTH-LOGIN' }));
  });

  it('distinguishes loading, error and filtered-empty states', () => {
    const { rerender } = renderView({ data: undefined, isLoading: true });
    expect(screen.getByLabelText('Loading Manual Test Runs')).toBeInTheDocument();

    rerender(<ChakraProvider><MemoryRouter><ManualTestRunHistoryView {...defaultProps} data={undefined} isLoading={false} error={{ status: 503 }} /></MemoryRouter></ChakraProvider>);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load Manual Test Runs');

    rerender(<ChakraProvider><MemoryRouter><ManualTestRunHistoryView {...defaultProps} data={{ runs: [], total: 0, page: 1, limit: 30, totalPages: 0 }} isFiltered={true} /></MemoryRouter></ChakraProvider>);
    expect(screen.getByText('No Manual Test Runs match these filters.')).toBeInTheDocument();
  });
});


it('offers Resume only for the current executor', () => {
  renderView({ currentUserId: 'user-1', data: { runs: [{ ...run, executedById: 'user-1' }, { ...run, id: 'run-2', executedById: 'user-2' }], total: 2, page: 1, limit: 30, totalPages: 1 } });
  expect(screen.getAllByText('Resume')).toHaveLength(1);
  expect(screen.getAllByText('View')).toHaveLength(1);
});
