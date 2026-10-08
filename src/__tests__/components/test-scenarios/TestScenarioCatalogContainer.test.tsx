// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { TestScenarioCatalogContainer } from '@/components/test-scenarios/containers/TestScenarioCatalogContainer';
import {
  useGetApiV2TestScenariosByScenarioIdQuery,
  useGetApiV2TestScenariosQuery,
  type GetApiV2TestScenariosApiArg,
  type TestScenarioSummary,
} from '@/redux/apis/generatedApi';
import { useTestScenarioContextMenu } from '@/components/test-scenarios/hooks/useTestScenarioContextMenu';

const navigate = vi.fn();
const contextMenu = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();

  return { ...actual, useNavigate: () => navigate };
});
vi.mock('@/components/test-scenarios/hooks/useTestScenarioContextMenu', () => ({
  useTestScenarioContextMenu: vi.fn(),
}));

vi.mock('@/redux/apis/generatedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/generatedApi')>();

  return {
    ...actual,
    useGetApiV2TestScenariosByScenarioIdQuery: vi.fn(),
    useGetApiV2TestScenariosQuery: vi.fn(),
  };
});
vi.mock('@/redux/apis/extendedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/extendedApi')>();
  const foldersQuery = vi.fn(() => ({ currentData: [{ id: 'folder-a', projectId: 'project-1', parentId: null, name: 'Authentication', position: 0, createdAt: '', updatedAt: '', scenarioCount: 3, _count: { scenarios: 3 }, children: [] }], isLoading: false, error: undefined }));
  const suitesQuery = vi.fn(() => ({ currentData: [{ id: 'suite-a', projectId: 'project-1', name: 'Regression', description: null, purpose: null, release: 'R1', createdAt: '', updatedAt: '', members: [] }], isLoading: false, error: undefined }));
  const mutation = vi.fn(() => [vi.fn(() => ({ unwrap: () => Promise.resolve({}) })), { isLoading: false }]);
  return {
    ...actual,
    useGetApiV2TestScenarioFoldersQuery: foldersQuery,
    useGetApiV2TestSuitesQuery: suitesQuery,
    usePatchApiV2TestScenariosBulkFolderMutation: mutation,
    usePostApiV2TestSuitesBySuiteIdMembersMutation: mutation,
    useDeleteApiV2TestSuitesBySuiteIdMembersMutation: mutation,
    usePutApiV2TestSuitesBySuiteIdMembersOrderMutation: mutation,
    usePostApiV2TestScenarioFoldersMutation: mutation,
    usePatchApiV2TestScenarioFoldersByFolderIdMutation: mutation,
    useDeleteApiV2TestScenarioFoldersByFolderIdMutation: mutation,
    usePostApiV2TestSuitesMutation: mutation,
    usePatchApiV2TestSuitesBySuiteIdMutation: mutation,
    useDeleteApiV2TestSuitesBySuiteIdMutation: mutation,
  };
});

const mockedScenarioQuery = vi.mocked(useGetApiV2TestScenariosQuery);
const mockedDetailQuery = vi.mocked(useGetApiV2TestScenariosByScenarioIdQuery);
const mockedContextMenu = vi.mocked(useTestScenarioContextMenu);

const createResponse = (page: number) => ({
  scenarios: [
    {
      id: `scenario-${page}`,
      projectId: 'project-1',
      folderId: null,
      folderName: null,
      createdById: 'user-1',
      scenarioKey: null,
      title: `Scenario page ${page}`,
      details: `Details page ${page}`,
      createdBy: { id: 'user-1', name: 'Ada Lovelace', email: 'ada@example.com' },
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-02T11:00:00.000Z',
    } satisfies TestScenarioSummary,
  ],
  total: 11,
  page,
  limit: 10,
  totalPages: 2,
});

describe('TestScenarioCatalogContainer', () => {
  beforeEach(() => {
    navigate.mockReset();
    contextMenu.mockReset();
    mockedDetailQuery.mockReset();
    mockedContextMenu.mockReturnValue(contextMenu);
    mockedScenarioQuery.mockImplementation((args) => {
      const queryArgs = args as GetApiV2TestScenariosApiArg;

      return {
        currentData: createResponse(queryArgs.page ?? 1),
        isLoading: false,
        isFetching: false,
        error: undefined,
      } as never;
    });
  });

  it('requests the selected project first with page 1 and limit 10', () => {
    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    expect(mockedScenarioQuery).toHaveBeenCalledWith({ projectId: 'project-1', page: 1, limit: 10 });
    expect(mockedDetailQuery).not.toHaveBeenCalled();
    expect(screen.getByText('Scenario page 1')).toBeInTheDocument();
  });

  it('requests the selected page for the same project and limit', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: /^2$/ }));

    expect(mockedScenarioQuery).toHaveBeenLastCalledWith({ projectId: 'project-1', page: 2, limit: 10 });
    expect(screen.getByText('Scenario page 2')).toBeInTheDocument();
    expect(screen.queryByText('# Scenario page 2')).not.toBeInTheDocument();
  });

  it('navigates to the create route from the catalog action', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));

    expect(navigate).toHaveBeenCalledWith('/test-scenarios/new');
  });

  it('combines folder scope and search in server requests and resets pagination', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Authentication 3/ }));
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({
      projectId: 'project-1', page: 1, limit: 10, folderId: 'folder-a', includeDescendants: true,
    });

    await user.type(screen.getByRole('textbox', { name: 'Search scenarios' }), 'login');
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({
      projectId: 'project-1', page: 1, limit: 10, folderId: 'folder-a', includeDescendants: true, search: 'login',
    });
  });

  it('keeps a selected sort while applying a debounced filter from another column', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Sort by Title' }));
    await user.click(screen.getByRole('button', { name: 'Sort by Title descending' }));
    await user.click(screen.getByRole('button', { name: 'Filter by Folder' }));
    await user.type(screen.getByRole('textbox', { name: 'Folder filter' }), 'Auth');
    await user.click(screen.getByRole('button', { name: 'Filter by Created by' }));
    await user.type(screen.getByRole('textbox', { name: 'Created by filter' }), 'Ada');

    await waitFor(() => expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({
      projectId: 'project-1', page: 1, limit: 10, sortField: 'title', sortDirection: 'asc', folder: 'Auth', createdBy: 'Ada',
    }));
    await user.click(screen.getByRole('button', { name: 'Clear Folder filter' }));
    await waitFor(() => {
      const latestArgs = mockedScenarioQuery.mock.calls.at(-1)?.[0];
      expect(latestArgs).toMatchObject({ sortField: 'title', sortDirection: 'asc', createdBy: 'Ada' });
      expect(latestArgs).not.toHaveProperty('folder');
    });
  });

  it('uses the backend unfiled scope rather than filtering loaded rows', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Unfiled' }));
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({
      projectId: 'project-1', page: 1, limit: 10, folderId: 'unfiled',
    });
  });

  it('filters suites on the server using the selected suite UUID', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider>
        <MemoryRouter>
          <TestScenarioCatalogContainer projectId="project-1" />
        </MemoryRouter>
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Regression 0/ }));
    expect(mockedScenarioQuery.mock.calls.at(-1)?.[0]).toMatchObject({
      projectId: 'project-1', page: 1, limit: 10, suiteId: 'suite-a',
    });
  });
});
