// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { ChakraProvider } from '@/components/ui';
import { TestScenarioDetailsView } from '@/components/test-scenarios/components/TestScenarioDetailsView';
import type { TestScenario } from '@/redux/apis/generatedApi';

vi.mock('@/components/test-scenarios/components/SuitePicker', () => ({
  SuitePicker: () => <button type="button">Add to suite</button>,
}));

const scenario: TestScenario = {
  revision: 1, suites: [{ id: 'suite-1', name: 'Smoke R2.4' }], createdBy: { id: 'user-1', name: 'Creator', email: 'creator@example.test' }, updatedBy: null,
  folderId: 'folder-1', id: 'scenario-1', projectId: 'project-1', createdById: 'user-1', title: 'Checkout', scenarioKey: 'TMS-1',
  details: 'Details content', priority: 'high', relatedIssueUrl: 'https://example.test/TP-20',
  preconditions: 'Ready\nUser is logged out', testData: 'Input', contentMd: '# Checkout', contentMdHash: 'hash',
  contentMdFormatVersion: 1, createdAt: '2026-10-20T10:00:00.000Z', updatedAt: '2026-10-26T10:00:00.000Z',
  steps: [
    { id: 'step-2', position: 2, action: 'Confirm order', expectedResult: 'Email sent' },
    { id: 'step-1', position: 1, action: 'Open product page', expectedResult: null },
    { id: 'step-3', position: 3, action: 'Check final summary', expectedResult: '' },
  ],
};
const renderView = (overrides: Partial<TestScenario> = {}, showSavedConfirmation = false) => render(
  <ChakraProvider><MemoryRouter><TestScenarioDetailsView
    scenario={{ ...scenario, ...overrides }}
    folderName="Checkout"
    backLabel="Checkout"
    backPath="/test-management?projectId=project-1&folderId=folder-1"
    projectId="project-1"
    onEdit={vi.fn()}
    onContextMenu={vi.fn()}
    onAddSuiteComplete={vi.fn()}
    onRemoveSuite={vi.fn()}
    removingSuiteIds={[]}
    showSavedConfirmation={showSavedConfirmation}
  /></MemoryRouter></ChakraProvider>,
);

describe('TestScenarioDetailsView', () => {
  it('shows save confirmation until the next action', async () => {
    const user = userEvent.setup();
    renderView({}, true);
    expect(screen.getByText('Changes saved.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.queryByText('Changes saved.')).not.toBeInTheDocument();
  });
  it('places folder and priority in the sidebar and the scenario key in the breadcrumb', () => {
    renderView();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('TMS-1');
    expect(screen.getByTestId('scenario-detail-sidebar')).toHaveTextContent('Folder');
    expect(screen.getByTestId('scenario-detail-sidebar')).toHaveTextContent('Priority');
    expect(screen.getByTestId('scenario-detail-main')).toContainElement(screen.getByRole('heading', { name: 'Checkout' }));
  });
  it('shows the scenario header, setup, ordered action/result table and responsive navigation', () => {
    renderView();
    expect(screen.getByText('TMS-1')).toBeInTheDocument();
    expect(screen.getAllByText('Checkout')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Checkout' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByText('Preconditions').compareDocumentPosition(screen.getByText('Steps')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const rows = screen.getAllByRole('row', { hidden: true });
    expect(rows[1]).toHaveTextContent('1Open product pageNo expected result');
    expect(rows[2]).toHaveTextContent('2Confirm orderEmail sent');
    expect(rows[3]).toHaveTextContent('3Check final summaryNo expected result');
    expect(screen.getByTestId('scenario-mobile-steps')).toBeInTheDocument();
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText(/Ready\s+User is logged out/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Checkout' })).toHaveAttribute('href', '/test-management?projectId=project-1&folderId=folder-1');
    expect(screen.getByRole('link', { name: 'https://example.test/TP-20' })).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.queryByText('Start manual run')).not.toBeInTheDocument();
    expect(screen.queryByText('Run history')).not.toBeInTheDocument();
    expect(screen.queryByText('Clone')).not.toBeInTheDocument();
  });

  it('shows empty setup, empty steps, suite state and metadata fallbacks', () => {
    renderView({ preconditions: null, testData: '', relatedIssueUrl: null, steps: [], suites: [], createdAt: '', updatedAt: '', createdBy: null as never });
    expect(screen.getAllByText('No value')).toHaveLength(3);
    expect(screen.getByText('No steps saved.')).toBeInTheDocument();
    expect(screen.getByText('No suites yet.')).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.textContent === 'Created Unknown by Unknown')).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.textContent === 'Updated Unknown by Unknown')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /example.test/ })).not.toBeInTheDocument();
  });

  it('does not render an unsafe related issue URL as a link', () => {
    renderView({ relatedIssueUrl: 'javascript:alert(1)' });
    expect(screen.queryByRole('link', { name: 'javascript:alert(1)' })).not.toBeInTheDocument();
  });

  it('allows an absolute HTTP related issue link', () => {
    renderView({ relatedIssueUrl: 'http://example.test/TP-21' });
    expect(screen.getByRole('link', { name: 'http://example.test/TP-21' })).toHaveAttribute('target', '_blank');
  });
});
