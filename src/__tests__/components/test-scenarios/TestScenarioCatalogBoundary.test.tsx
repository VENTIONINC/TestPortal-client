// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { act, render, screen } from '@testing-library/react';
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

vi.mock('@/components/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/ui')>();
  return {
    ...actual,
    Tooltip: ({ children }: { children: ReactNode }) => children,
  };
});

const restoreProject = vi.hoisted(() => vi.fn());
vi.mock('@/redux/slices/projects', () => ({ useProjectsActions: () => ({ setSelectedProjectId: restoreProject }) }));

vi.mock('@/hooks/useSelectedProject', () => ({
  useSelectedProject: vi.fn(),
}));
vi.mock('@/redux/apis/generatedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/generatedApi')>();

  return {
    ...actual,
    useGetApiV2TestScenariosQuery: vi.fn(),
    useGetApiV2TestScenariosAuthorsQuery: vi.fn(() => ({
      currentData: { authors: [] },
      isLoading: false,
      error: undefined,
    })),
    useLazyGetApiV2TestScenariosSelectionQuery: vi.fn(() => [
      vi.fn(() => ({ unwrap: async () => ({ scenarioIds: [], total: 0 }) })),
      { isLoading: false },
    ]),
    useDeleteApiV2TestScenariosByScenarioIdMutation: vi.fn(() => [
      vi.fn(() => ({ unwrap: async () => {} })),
      { isLoading: false },
    ]),
  };
});
vi.mock('@/redux/apis/extendedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/extendedApi')>();
  const query = vi.fn(() => ({ currentData: [], isLoading: false, error: undefined }));
  const mutation = vi.fn(() => [vi.fn(() => ({ unwrap: () => Promise.resolve({}) })), { isLoading: false }]);
  const queryResult = vi.fn(() => ({ currentData: undefined, isFetching: false, error: undefined }));
  return {
    ...actual,
    useGetApiV2TestScenarioFoldersQuery: query,
    useGetApiV2TestSuitesQuery: query,
    useGetApiV2TestScenariosPriorityCountsQuery: queryResult,
    usePatchApiV2TestScenariosBulkFolderMutation: mutation,
    usePostApiV2TestSuitesBySuiteIdMembersMutation: mutation,
    useDeleteApiV2TestSuitesBySuiteIdMembersMutation: mutation,
    usePutApiV2TestSuitesBySuiteIdMembersOrderMutation: mutation,
    usePostApiV2TestSuitesBySuiteIdMembershipChangesMutation: mutation,
    usePostApiV2TestSuitesBySuiteIdMembershipRestorationMutation: mutation,
    usePostApiV2TestSuitesMovesMutation: mutation,
    usePostApiV2TestSuitesMoveRestorationMutation: mutation,
    usePostApiV2TestScenarioFoldersMutation: mutation,
    usePatchApiV2TestScenarioFoldersByFolderIdMutation: mutation,
    useDeleteApiV2TestScenarioFoldersByFolderIdMutation: mutation,
    usePostApiV2TestScenarioFoldersRestorationMutation: mutation,
    usePostApiV2TestScenariosFolderRestorationMutation: mutation,
    usePostApiV2TestSuitesMutation: mutation,
    usePatchApiV2TestSuitesBySuiteIdMutation: mutation,
    useDeleteApiV2TestSuitesBySuiteIdMutation: mutation,
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
      folderId: null,
      folderName: null,
      createdById: 'user-1',
      scenarioKey: 'TMS-1',
      title: `${projectId} scenario`,
      details: `${projectId} details`,
      priority: null,
      createdBy: { id: 'user-1', name: `${projectId} creator`, email: `${projectId}@example.com` },
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-02T11:00:00.000Z',
    } satisfies TestScenarioSummary,
  ],
  total: 11,
  page,
  limit: 25,
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
    vi.useFakeTimers();
    const user = userEvent.setup();
    const { rerender } = render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalog organizationTab="scenarios" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    act(() => vi.advanceTimersByTime(500));
    vi.useRealTimers();

    await user.click(screen.getByRole('button', { name: 'Next Page' }));
    expect(mockedScenarioQuery).toHaveBeenLastCalledWith(
      { projectId: 'project-a', page: 2, limit: 25, sortField: 'updatedAt', sortDirection: 'desc' },
      { skip: false },
    );
    expect(screen.getByText('project-a scenario')).toBeInTheDocument();
    expect(screen.queryByText('project-a details')).not.toBeInTheDocument();
    expect(screen.getByText('project-a c.')).toBeInTheDocument();

    selectedProjectId = 'project-b';
    rerender(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalog organizationTab="scenarios" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    expect(mockedScenarioQuery).toHaveBeenLastCalledWith(
      { projectId: 'project-b', page: 1, limit: 25, sortField: 'updatedAt', sortDirection: 'desc' },
      { skip: false },
    );
    expect(screen.queryByText('project-a scenario')).not.toBeInTheDocument();
    expect(screen.queryByText('project-a details')).not.toBeInTheDocument();
    expect(screen.queryByText('project-a c.')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Searching scenarios…');
  });
  it('consumes a return URL project once and allows a subsequent deliberate project change', () => {
    restoreProject.mockClear();
    const content = () => (
      <ChakraProvider>
        <MemoryRouter initialEntries={['/test-management?projectId=project-a&folderId=unfiled']}>
          <TestScenarioCatalog organizationTab="scenarios" />
        </MemoryRouter>
      </ChakraProvider>
    );
    const view = render(content());
    selectedProjectId = 'project-b';
    view.rerender(content());
    expect(restoreProject).not.toHaveBeenCalled();
  });
});
