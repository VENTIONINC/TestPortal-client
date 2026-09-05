// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

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

const scenarios: TestScenarioSummary[] = [
  {
    id: 'scenario-1',
    projectId: 'project-1',
    createdById: 'user-1',
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

const renderView = (props: Partial<TestScenarioCatalogViewProps> = {}) =>
  render(
    <ChakraProvider>
      <MemoryRouter>
        <TestScenarioCatalogView
          scenarios={scenarios}
          pagination={pagination}
          isLoading={false}
          onPageChange={vi.fn()}
          {...props}
        />
      </MemoryRouter>
    </ChakraProvider>,
  );

describe('TestScenarioCatalogView', () => {
  it('renders the loading state', () => {
    renderView({ scenarios: [], isLoading: true });

    expect(screen.getByLabelText('Loading Test Scenarios')).toBeInTheDocument();
    expect(screen.getByText('Loading Test Scenarios...')).toBeInTheDocument();
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
    expect(screen.getAllByRole('columnheader')).toHaveLength(6);
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Title',
      'Details',
      'Created by',
      'Created',
      'Updated',
      '',
    ]);
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByRole('row', { name: /Checkout flow/ })).toBeInTheDocument();
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

  it('renders a fallback for null details', () => {
    renderView({ scenarios: [{ ...scenarios[0], details: null }] });

    expect(screen.getByText('No details')).toBeInTheDocument();
  });

  it('maps every scenario title to its own detail route while keeping actions separate', () => {
    renderView({
      scenarios: [
        ...scenarios,
        {
          id: 'scenario-2',
          projectId: 'project-1',
          createdById: 'user-2',
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

    expect(table.compareDocumentPosition(pagination) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(pagination.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /^2$/ }));

    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(summary).toBeInTheDocument();
  });
});
