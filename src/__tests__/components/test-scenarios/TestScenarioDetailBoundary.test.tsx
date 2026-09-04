// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { TestScenarioDetailBoundary } from '@/components/test-scenarios/containers/TestScenarioDetailBoundary';
import { TestScenarioEditBoundary } from '@/components/test-scenarios/containers/TestScenarioEditBoundary';
import { ChakraProvider } from '@/components/ui';
import { useTestScenarioContextMenu } from '@/components/test-scenarios/hooks/useTestScenarioContextMenu';
import {
  useGetApiV2TestScenariosByScenarioIdQuery,
  usePatchApiV2TestScenariosByScenarioIdMutation,
} from '@/redux/apis/generatedApi';

const routeParams = vi.hoisted(() => ({ scenarioId: 'scenario-1' as string | undefined }));
const selectedProject = vi.hoisted(() => ({ id: 'project-a' }));
const navigate = vi.fn();
const contextMenu = vi.fn();
const updateScenario = vi.fn();
const refetch = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();

  return { ...actual, useParams: () => routeParams, useNavigate: () => navigate };
});
vi.mock('@/hooks/useSelectedProject', () => ({
  useSelectedProject: () => ({ selectedProjectId: selectedProject.id, project: undefined, isLoading: false }),
}));
vi.mock('@/components/test-scenarios/hooks/useTestScenarioContextMenu', () => ({
  useTestScenarioContextMenu: vi.fn(),
}));
vi.mock('@/redux/apis/generatedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/generatedApi')>();

  return {
    ...actual,
    useGetApiV2TestScenariosByScenarioIdQuery: vi.fn(),
    usePatchApiV2TestScenariosByScenarioIdMutation: vi.fn(),
  };
});

const mockedDetailQuery = vi.mocked(useGetApiV2TestScenariosByScenarioIdQuery);
const mockedUpdateMutation = vi.mocked(usePatchApiV2TestScenariosByScenarioIdMutation);
const mockedContextMenu = vi.mocked(useTestScenarioContextMenu);

const scenarioFor = (projectId: string) => ({
  id: 'scenario-1',
  projectId,
  createdById: 'user-1',
  title: `${projectId} scenario`,
  contentMd: `# ${projectId} scenario`,
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-02T11:00:00.000Z',
});

const renderWithRouter = (content: ReactNode) =>
  render(
    <ChakraProvider>
      <MemoryRouter>{content}</MemoryRouter>
    </ChakraProvider>,
  );

describe('Test Scenario route boundaries', () => {
  beforeEach(() => {
    routeParams.scenarioId = 'scenario-1';
    selectedProject.id = 'project-a';
    navigate.mockReset();
    contextMenu.mockReset();
    updateScenario.mockReset();
    refetch.mockReset();
    mockedDetailQuery.mockReset();
    mockedContextMenu.mockReturnValue(contextMenu);
    mockedUpdateMutation.mockReturnValue([updateScenario, { isLoading: false }] as never);
    mockedDetailQuery.mockImplementation((args) => {
      const projectId = (args as { projectId: string }).projectId;
      const scenario = scenarioFor(projectId);

      return {
        data: scenario,
        currentData: scenario,
        isLoading: false,
        isFetching: false,
        error: undefined,
        refetch,
      } as never;
    });
  });

  it('requests the same project-scoped detail contract for read-only and edit routes', () => {
    const { unmount } = renderWithRouter(<TestScenarioDetailBoundary />);

    expect(mockedDetailQuery).toHaveBeenLastCalledWith({ scenarioId: 'scenario-1', projectId: 'project-a' });
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    unmount();
    renderWithRouter(<TestScenarioEditBoundary />);

    expect(mockedDetailQuery).toHaveBeenLastCalledWith({ scenarioId: 'scenario-1', projectId: 'project-a' });
    expect(screen.getByRole('textbox', { name: 'Markdown' })).toHaveValue('# project-a scenario');
  });

  it('clears the edit form immediately and requests the new project scope after a project switch', () => {
    const { rerender } = renderWithRouter(<TestScenarioEditBoundary />);

    expect(screen.getByRole('textbox', { name: 'Markdown' })).toHaveValue('# project-a scenario');

    selectedProject.id = 'project-b';
    mockedDetailQuery.mockReturnValue({
      data: scenarioFor('project-a'),
      currentData: undefined,
      isLoading: true,
      isFetching: true,
      error: undefined,
      refetch,
    } as never);
    rerender(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioEditBoundary />
        </MemoryRouter>
      </ChakraProvider>,
    );

    expect(mockedDetailQuery).toHaveBeenLastCalledWith({ scenarioId: 'scenario-1', projectId: 'project-b' });
    expect(screen.queryByDisplayValue('# project-a scenario')).not.toBeInTheDocument();
    expect(screen.getByText('Loading Test Scenario...')).toBeInTheDocument();
  });

  it('clears read-only details immediately when the selected project changes', () => {
    const { rerender } = renderWithRouter(<TestScenarioDetailBoundary />);

    expect(screen.getByTestId('markdown-preview')).toHaveTextContent('project-a scenario');

    selectedProject.id = 'project-b';
    mockedDetailQuery.mockReturnValue({
      data: scenarioFor('project-a'),
      currentData: scenarioFor('project-a'),
      isLoading: true,
      isFetching: true,
      error: undefined,
      refetch,
    } as never);
    rerender(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioDetailBoundary />
        </MemoryRouter>
      </ChakraProvider>,
    );

    expect(mockedDetailQuery).toHaveBeenLastCalledWith({ scenarioId: 'scenario-1', projectId: 'project-b' });
    expect(screen.queryByText('project-a scenario')).not.toBeInTheDocument();
    expect(screen.getByText('Loading Test Scenario...')).toBeInTheDocument();
  });

  it('renders the shared unavailable state for a missing route scenario ID', () => {
    routeParams.scenarioId = '  ';

    renderWithRouter(<TestScenarioDetailBoundary />);

    expect(screen.getByText('Test Scenario unavailable')).toBeInTheDocument();
    expect(mockedDetailQuery).not.toHaveBeenCalled();
  });
});
