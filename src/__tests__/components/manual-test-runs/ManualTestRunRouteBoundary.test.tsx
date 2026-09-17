// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ManualTestRunRouteBoundary } from '@/components/manual-test-runs';
import { ChakraProvider } from '@/components/ui';

const routeParams = vi.hoisted(() => ({ runId: 'run-1' as string | undefined }));
const selectedProject = vi.hoisted(() => ({ id: 'project-a' as string | undefined }));
const navigate = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useParams: () => routeParams, useNavigate: () => navigate };
});
vi.mock('@/hooks/useSelectedProject', () => ({
  useSelectedProject: () => ({ selectedProjectId: selectedProject.id, project: undefined, isLoading: false }),
}));

const renderBoundary = (children: (scope: { projectId: string; runId: string }) => ReactNode) =>
  render(
    <ChakraProvider>
      <MemoryRouter>
        <ManualTestRunRouteBoundary>{children}</ManualTestRunRouteBoundary>
      </MemoryRouter>
    </ChakraProvider>,
  );

describe('ManualTestRunRouteBoundary', () => {
  beforeEach(() => {
    routeParams.runId = 'run-1';
    selectedProject.id = 'project-a';
    navigate.mockReset();
  });

  it('passes the selected project and route run identity to the scoped child', () => {
    renderBoundary(({ projectId, runId }) => <div>{projectId}:{runId}</div>);
    expect(screen.getByText('project-a:run-1')).toBeInTheDocument();
  });

  it('clears the old scope immediately when the selected project changes', () => {
    const { rerender } = renderBoundary(({ projectId, runId }) => <div>{projectId}:{runId}</div>);

    selectedProject.id = 'project-b';
    rerender(
      <ChakraProvider>
        <MemoryRouter>
          <ManualTestRunRouteBoundary>{({ projectId, runId }) => <div>{projectId}:{runId}</div>}</ManualTestRunRouteBoundary>
        </MemoryRouter>
      </ChakraProvider>,
    );

    expect(screen.queryByText('project-a:run-1')).not.toBeInTheDocument();
    expect(screen.getByText('project-b:run-1')).toBeInTheDocument();
  });

  it('renders an unavailable state and does not invoke the child for a missing run ID', () => {
    routeParams.runId = '  ';
    const child = vi.fn(() => <div>child</div>);

    renderBoundary(child);

    expect(screen.getByText('Manual Test Run unavailable')).toBeInTheDocument();
    expect(child).not.toHaveBeenCalled();
  });
});
