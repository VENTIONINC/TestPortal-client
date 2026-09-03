// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { TestScenarioCatalogContainer } from '@/components/test-scenarios/containers/TestScenarioCatalogContainer';
import { useGetApiV2TestScenariosQuery, type GetApiV2TestScenariosApiArg } from '@/redux/apis/generatedApi';

vi.mock('@/redux/apis/generatedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/generatedApi')>();

  return {
    ...actual,
    useGetApiV2TestScenariosQuery: vi.fn(),
  };
});

const mockedScenarioQuery = vi.mocked(useGetApiV2TestScenariosQuery);

const createResponse = (page: number) => ({
  scenarios: [
    {
      id: `scenario-${page}`,
      projectId: 'project-1',
      createdById: 'user-1',
      title: `Scenario page ${page}`,
      contentMd: `# Scenario page ${page}`,
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-02T11:00:00.000Z',
    },
  ],
  total: 11,
  page,
  limit: 10,
  totalPages: 2,
});

describe('TestScenarioCatalogContainer', () => {
  beforeEach(() => {
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
        <TestScenarioCatalogContainer projectId="project-1" />
      </ChakraProvider>,
    );

    expect(mockedScenarioQuery).toHaveBeenCalledWith({ projectId: 'project-1', page: 1, limit: 10 });
    expect(screen.getByText('Scenario page 1')).toBeInTheDocument();
  });

  it('requests the selected page for the same project and limit', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <TestScenarioCatalogContainer projectId="project-1" />
      </ChakraProvider>,
    );

    await user.click(screen.getByRole('button', { name: /^2$/ }));

    expect(mockedScenarioQuery).toHaveBeenLastCalledWith({ projectId: 'project-1', page: 2, limit: 10 });
    expect(screen.getByText('Scenario page 2')).toBeInTheDocument();
    expect(screen.queryByText('# Scenario page 2')).not.toBeInTheDocument();
  });
});
