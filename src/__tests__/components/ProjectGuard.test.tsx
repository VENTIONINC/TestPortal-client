// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ProjectGuard } from '@/components/ProjectGuard';
import { PATHS } from '@/types/paths';
import { useGetApiV2ProjectsQuery } from '@/redux/apis/generatedApi';
import { useIsInitialized, useProjectsActions, useSelectedProjectId } from '@/redux/slices/projects';

vi.mock('@/components/ui/LoadingPlaceholder', () => ({
  LoadingPlaceholder: () => <div>Loading projects</div>,
}));
vi.mock('@/redux/apis/generatedApi', () => ({
  useGetApiV2ProjectsQuery: vi.fn(),
}));
vi.mock('@/redux/slices/projects', () => ({
  useIsInitialized: vi.fn(),
  useProjectsActions: vi.fn(),
  useSelectedProjectId: vi.fn(),
}));

const navigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();

  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

const mockedProjectsQuery = vi.mocked(useGetApiV2ProjectsQuery);
const mockedIsInitialized = vi.mocked(useIsInitialized);
const mockedSelectedProjectId = vi.mocked(useSelectedProjectId);
const mockedProjectsActions = vi.mocked(useProjectsActions);

afterEach(() => {
  navigate.mockReset();
  mockedProjectsQuery.mockReset();
  mockedIsInitialized.mockReset();
  mockedSelectedProjectId.mockReset();
  mockedProjectsActions.mockReset();
});

describe('ProjectGuard', () => {
  it('redirects authenticated routes to project settings when no project is available', async () => {
    const setIsInitialized = vi.fn();

    mockedProjectsQuery.mockReturnValue({ data: [], isLoading: false } as never);
    mockedIsInitialized.mockReturnValue(false);
    mockedSelectedProjectId.mockReturnValue('');
    mockedProjectsActions.mockReturnValue({ setIsInitialized, setSelectedProjectId: vi.fn() } as never);

    render(
      <MemoryRouter>
        <ProjectGuard>
          <div>Test Scenario catalog</div>
        </ProjectGuard>
      </MemoryRouter>,
    );

    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith(PATHS.USER_SETTINGS_PROJECTS));
    expect(setIsInitialized).toHaveBeenCalledWith(true);
    expect(screen.queryByText('Test Scenario catalog')).not.toBeInTheDocument();
  });
});

