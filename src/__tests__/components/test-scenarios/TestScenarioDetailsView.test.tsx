// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { TestScenarioDetailsView } from '@/components/test-scenarios/components/TestScenarioDetailsView';
import type { TestScenario } from '@/redux/apis/generatedApi';

const scenario: TestScenario = {
  folderId: null, id: 'scenario-1', projectId: 'project-1', createdById: 'user-1', title: 'Checkout', scenarioKey: null,
  details: 'Details content', priority: 'high', relatedIssueUrl: 'https://example.test/TP-20',
  preconditions: 'Ready', testData: 'Input', contentMd: '# Checkout', contentMdHash: 'hash',
  contentMdFormatVersion: 1, createdAt: '', updatedAt: '',
  steps: [{ id: 'step-1', position: 0, action: 'Run', expectedResult: 'Works' }],
};
const renderView = (overrides: Partial<TestScenario> = {}) => render(
  <ChakraProvider><MemoryRouter><TestScenarioDetailsView scenario={{ ...scenario, ...overrides }} onContextMenu={vi.fn()} /></MemoryRouter></ChakraProvider>,
);
describe('TestScenarioDetailsView', () => {
  it('shows TP-20 sections read-only and retains step expected results', () => {
    renderView();
    const fields = screen.getByRole('heading', { name: 'Scenario fields' });
    const setup = screen.getByRole('heading', { name: 'Test setup' });
    const steps = screen.getByRole('heading', { name: 'Scenario steps (1)' });
    expect(fields.compareDocumentPosition(setup) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(setup.compareDocumentPosition(steps) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText('Details content')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Works')).toBeInTheDocument();
    expect(screen.queryByText('Objective')).not.toBeInTheDocument();
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'https://example.test/TP-20' })).toHaveAttribute('rel', 'noopener noreferrer');
  });
  it('shows consistent empty metadata without a link', () => {
    renderView({ priority: null, relatedIssueUrl: null });
    expect(screen.getAllByText('No value')).toHaveLength(2);
    expect(screen.queryByRole('link', { name: /example.test/ })).not.toBeInTheDocument();
  });
  it('does not render an unsafe related issue URL as a link', () => {
    renderView({ relatedIssueUrl: 'javascript:alert(1)' });
    expect(screen.queryByRole('link', { name: 'javascript:alert(1)' })).not.toBeInTheDocument();
  });
});
