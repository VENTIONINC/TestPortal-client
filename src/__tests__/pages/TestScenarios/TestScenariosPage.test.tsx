// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { TestScenariosPage } from '@/pages/TestScenarios';

const projectState = vi.hoisted(() => ({ id: 'project-1', missingCounts: false, refreshingCounts: false, failedCounts: false, requestedProjects: [] as string[] }));
const catalogTab = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useSelectedProject', () => ({ useSelectedProject: () => ({ selectedProjectId: projectState.id }) }));
vi.mock('@/redux/apis/generatedApi', () => ({
  useGetApiV2TestScenariosQuery: (arg: { projectId: string }) => {
    projectState.requestedProjects.push(arg.projectId);
    return {
      currentData: projectState.missingCounts ? undefined : { total: arg.projectId === 'project-1' ? 12 : 3 },
      isFetching: projectState.refreshingCounts,
      error: projectState.failedCounts ? { status: 500 } : undefined,
    };
  },
}));
vi.mock('@/redux/apis/extendedApi', () => ({
  useGetApiV2TestSuitesQuery: (arg: { projectId: string }) => ({
    currentData: projectState.missingCounts
      ? undefined
      : arg.projectId === 'project-1'
        ? [{ id: 'suite-1' }, { id: 'suite-2' }]
        : [{ id: 'suite-3' }],
    isFetching: projectState.refreshingCounts,
    error: projectState.failedCounts ? { status: 500 } : undefined,
  }),
  useGetApiV2ManualTestRunsQuery: (arg: { projectId: string }) => ({
    currentData: projectState.missingCounts ? undefined : { total: arg.projectId === 'project-1' ? 27 : 4 },
    isFetching: projectState.refreshingCounts,
    error: projectState.failedCounts ? { status: 500 } : undefined,
  }),
}));

vi.mock('@/components/ui/components/Templates/MainTemplate', () => ({
  MainTemplate: ({ children, pageHeader }: { children: React.ReactNode; pageHeader: string }) => (
    <main>
      <h1>{pageHeader}</h1>
      {children}
    </main>
  ),
}));

vi.mock('@/components/test-scenarios', () => ({
  TestScenarioCatalog: ({ organizationTab }: { organizationTab: string }) => {
    catalogTab(organizationTab);
    return <div>Test Scenario catalog: {organizationTab}</div>;
  },
}));
vi.mock('@/components/manual-test-runs', () => ({
  ManualTestRunHistoryBoundary: () => <div>Manual run history</div>,
}));

const renderPage = (initialEntry = '/test-scenarios') =>
  render(
    <ChakraProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <TestScenariosPage />
      </MemoryRouter>
    </ChakraProvider>,
  );

describe('TestScenariosPage', () => {
  beforeEach(() => {
    catalogTab.mockReset();
    projectState.missingCounts = false;
    projectState.refreshingCounts = false;
    projectState.failedCounts = false;
    projectState.id = 'project-1';
    projectState.requestedProjects = [];
  });

  it('renders the catalog in the default Scenarios tab of Test Management', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Test Management' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Scenarios/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /Suites/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Manual runs/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Scenarios 12/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Suites 2/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Manual runs 27/ })).toBeInTheDocument();
    expect(screen.getByText('Test Scenario catalog: scenarios')).toBeInTheDocument();

    const scenariosTab = screen.getByRole('tab', { name: /Scenarios 12/ });
    const suitesTab = screen.getByRole('tab', { name: /Suites 2/ });
    expect(getComputedStyle(scenariosTab).fontSize).toBe('var(--chakra-font-sizes-sm)');
    expect(getComputedStyle(scenariosTab).borderBottomWidth).toBe('2px');
    expect(getComputedStyle(suitesTab).fontSize).toBe('var(--chakra-font-sizes-sm)');
  });

  it('switches to the Suites context when its tab is selected', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('tab', { name: /Suites/ }));

    expect(screen.getByRole('tab', { name: /Suites/ })).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => expect(catalogTab).toHaveBeenLastCalledWith('suites'));
  });

  it('selects Manual runs for the legacy route', () => {
    renderPage('/manual-test-runs');

    expect(screen.getByRole('tab', { name: /Manual runs/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Manual run history')).toBeInTheDocument();
  });

  it('shows unavailable count placeholders when totals have not loaded', () => {
    projectState.missingCounts = true;
    renderPage();

    expect(screen.getByLabelText('scenario count unavailable')).toBeInTheDocument();
    expect(screen.getByLabelText('suite count unavailable')).toBeInTheDocument();
    expect(screen.getByLabelText('manual run count unavailable')).toBeInTheDocument();
  });

  it('hides cached counts while refreshing or after a count request fails', () => {
    projectState.refreshingCounts = true;
    const { rerender } = renderPage();

    expect(screen.getByLabelText('scenario count unavailable')).toBeInTheDocument();
    expect(screen.getByLabelText('suite count unavailable')).toBeInTheDocument();
    expect(screen.getByLabelText('manual run count unavailable')).toBeInTheDocument();

    projectState.refreshingCounts = false;
    projectState.failedCounts = true;
    rerender(
      <ChakraProvider>
        <MemoryRouter initialEntries={['/test-scenarios']}>
          <TestScenariosPage />
        </MemoryRouter>
      </ChakraProvider>,
    );

    expect(screen.getByLabelText('scenario count unavailable')).toBeInTheDocument();
    expect(screen.getByLabelText('suite count unavailable')).toBeInTheDocument();
    expect(screen.getByLabelText('manual run count unavailable')).toBeInTheDocument();
  });

  it('requests counts using the selected project identity', () => {
    renderPage();

    expect(projectState.requestedProjects).toContain('project-1');
    expect(screen.getByRole('tab', { name: /Scenarios 12/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Suites 2/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Manual runs 27/ })).toBeInTheDocument();
  });

  it('replaces old counts when the selected project changes', () => {
    const { rerender } = renderPage();
    projectState.id = 'project-2';
    rerender(
      <ChakraProvider>
        <MemoryRouter initialEntries={['/test-scenarios']}>
          <TestScenariosPage />
        </MemoryRouter>
      </ChakraProvider>,
    );

    expect(screen.getByRole('tab', { name: /Scenarios 3/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Suites 1/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Manual runs 4/ })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Scenarios 12/ })).not.toBeInTheDocument();
    expect(projectState.requestedProjects).toContain('project-2');
  });
});
