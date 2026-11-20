// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { TestScenariosPage } from '@/pages/TestScenarios';
import { ScenarioPageTabs } from '@/pages/TestScenarios/TestManagementTabs';

const projectState = vi.hoisted(() => ({ id: 'project-1', missingCounts: false, refreshingCounts: false, failedCounts: false, requestedProjects: [] as string[], runArgs: [] as Array<{ show?: string; period?: string }>, activeRunCount: undefined as number | undefined }));
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
  useGetApiV2ManualTestRunsQuery: (arg: { projectId: string; show?: string; period?: string }) => {
    projectState.runArgs.push(arg);
    return {
      currentData: projectState.missingCounts
        ? undefined
        : { total: projectState.activeRunCount ?? (arg.projectId === 'project-1' ? 27 : 4) },
      isFetching: projectState.refreshingCounts,
      error: projectState.failedCounts ? { status: 500 } : undefined,
    };
  },
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
    projectState.runArgs = [];
    projectState.activeRunCount = undefined;
  });

  it('counts only runs in progress, including zero', () => {
    projectState.activeRunCount = 0;
    renderPage();
    expect(screen.getByRole('tab', { name: /Manual runs 0/ })).toBeInTheDocument();
    expect(projectState.runArgs).toContainEqual(expect.objectContaining({ show: 'in_progress', period: 'any_time' }));
  });

  it('opens Suites from a project-scoped suite return link', () => {
    renderPage('/test-management?projectId=project-1&tab=suites&suiteId=suite-1');
    expect(screen.getByRole('tab', { name: /Suites/ })).toHaveAttribute('aria-selected', 'true');
  });
  it('keeps Suites active when viewing a scenario opened from a suite', () => {
    render(<ChakraProvider><MemoryRouter initialEntries={['/test-scenarios/123?originProject=project-1&originKind=suite&originId=suite-1']}><ScenarioPageTabs /></MemoryRouter></ChakraProvider>);
    expect(screen.getByRole('tab', { name: /Suites/ })).toHaveAttribute('aria-selected', 'true');
  });
  it('falls back to Scenarios if the originating suite no longer exists', () => {
    render(<ChakraProvider><MemoryRouter initialEntries={['/test-scenarios/123?originProject=project-1&originKind=suite&originId=removed']}><ScenarioPageTabs /></MemoryRouter></ChakraProvider>);
    expect(screen.getByRole('tab', { name: /Scenarios/ })).toHaveAttribute('aria-selected', 'true');
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
    const tabList = screen.getByRole('tablist', { name: 'Test Management' });
    expect(getComputedStyle(scenariosTab).fontSize).toBe('var(--chakra-font-sizes-sm)');
    expect(getComputedStyle(scenariosTab).borderBottomWidth).toBe('0px');
    const indicator = document.querySelector('[data-scope="tabs"][data-part="indicator"]');
    expect(indicator).not.toBeInTheDocument();
    expect(getComputedStyle(suitesTab).fontSize).toBe('var(--chakra-font-sizes-sm)');
    expect(getComputedStyle(tabList).paddingInlineStart).toBe('var(--chakra-spacing-6)');
  });

  it('switches to the Suites context when its tab is selected', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('tab', { name: /Suites/ }));

    expect(screen.getByRole('tab', { name: /Suites/ })).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => expect(catalogTab).toHaveBeenLastCalledWith('suites'));
  });

  it('navigates from a scenario page to the selected Test Management section', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider><MemoryRouter initialEntries={['/test-scenarios/123/edit']}>
        <Routes>
          <Route path="/test-scenarios/:id/edit" element={<ScenarioPageTabs />} />
          <Route path="/test-management" element={<TestScenariosPage />} />
        </Routes>
      </MemoryRouter></ChakraProvider>,
    );
    expect(screen.getByRole('tab', { name: /Scenarios 12/ })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('tab', { name: /Suites 2/ }));
    expect(screen.getByRole('tab', { name: /Suites 2/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Test Scenario catalog: suites')).toBeInTheDocument();
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
