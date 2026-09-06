// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { TestScenarioCatalog } from '@/components/test-scenarios/containers/TestScenarioCatalogBoundary';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import {
  useGetApiV2TestScenariosQuery,
  type GetApiV2TestScenariosApiArg,
  type TestScenarioSummary,
} from '@/redux/apis/generatedApi';

vi.mock('@/hooks/useSelectedProject', () => ({
  useSelectedProject: vi.fn(),
}));
vi.mock('@/redux/apis/generatedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/generatedApi')>();

  return {
    ...actual,
    useGetApiV2TestScenariosQuery: vi.fn(),
  };
});
vi.mock('@/components/test-scenarios/hooks/useTestScenarioContextMenu', () => ({
  useTestScenarioContextMenu: () => vi.fn(),
}));

const mockedSelectedProject = vi.mocked(useSelectedProject);
const mockedScenarioQuery = vi.mocked(useGetApiV2TestScenariosQuery);
let selectedProjectId = 'project-a';

const createResponse = (projectId: string, page: number) => ({
  scenarios: [
    {
      id: `${projectId}-scenario`,
      projectId,
      createdById: 'user-1',
      title: `${projectId} scenario`,
      details: `${projectId} details`,
      createdBy: { id: 'user-1', name: `${projectId} creator`, email: `${projectId}@example.com` },
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-02T11:00:00.000Z',
    } satisfies TestScenarioSummary,
  ],
  total: 11,
  page,
  limit: 10,
  totalPages: 2,
});

describe('TestScenarioCatalog project boundary', () => {
  beforeEach(() => {
    selectedProjectId = 'project-a';
    mockedSelectedProject.mockImplementation(() => ({
      selectedProjectId,
      project: undefined,
      isLoading: false,
    }));
    mockedScenarioQuery.mockImplementation((args) => {
      const queryArgs = args as GetApiV2TestScenariosApiArg;

      if (queryArgs.projectId === 'project-b') {
        return { currentData: undefined, isLoading: true, isFetching: true, error: undefined } as never;
      }

      return {
        currentData: createResponse(queryArgs.projectId, queryArgs.page ?? 1),
        isLoading: false,
        isFetching: false,
        error: undefined,
      } as never;
    });
  });

  it('resets to page 1 and hides the previous project while the new request is pending', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalog />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: /^2$/ }));
    expect(screen.getByText('project-a scenario')).toBeInTheDocument();
    expect(screen.getByText('project-a details')).toBeInTheDocument();
    expect(screen.getByText('project-a creator')).toBeInTheDocument();

    selectedProjectId = 'project-b';
    rerender(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalog />
        </MemoryRouter>
      </ChakraProvider>,
    );

    expect(mockedScenarioQuery).toHaveBeenLastCalledWith({ projectId: 'project-b', page: 1, limit: 10 });
    expect(screen.queryByText('project-a scenario')).not.toBeInTheDocument();
    expect(screen.queryByText('project-a details')).not.toBeInTheDocument();
    expect(screen.queryByText('project-a creator')).not.toBeInTheDocument();
    expect(screen.getByText('Loading Test Scenarios...')).toBeInTheDocument();
  });
});
