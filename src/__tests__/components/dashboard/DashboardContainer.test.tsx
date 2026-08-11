// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen } from '@testing-library/react';
import { saveAs } from 'file-saver';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useGetApiV2ProjectsByProjectIdDashboardQuery } from '@/redux/apis/generatedApi';
import { useExportDashboardPdfMutation } from '@/redux/apis/extendedApi';
import { DashboardContainer } from '@/components/dashboard/containers';

const filterState = vi.hoisted(() => ({ current: { type: 'all', period: '14' } }));

vi.mock('@/redux/apis/generatedApi', () => ({
  useGetApiV2ProjectsByProjectIdDashboardQuery: vi.fn(),
}));

vi.mock('@/redux/apis/extendedApi', () => ({
  useExportDashboardPdfMutation: vi.fn(),
}));

vi.mock('@/redux/slices/projects', () => ({
  useSelectedProjectId: vi.fn(() => 'project-123'),
}));

vi.mock('@/hooks', () => ({
  normalizeExecutionTypeFilters: (filters: Record<string, string>) => ({
    ...filters,
    type: filters.type || 'all',
  }),
  useFiltersWithUrl: vi.fn(() => ({
    formMethods: {},
    filterProps: {
      filters: filterState.current,
      initialFilters: { type: 'all', period: '' },
      onApplyFilters: vi.fn(),
    },
  })),
  useExecutionTypeOptions: vi.fn(() => ({
    options: [
      { label: 'All', value: 'all' },
      { label: 'Custom Release', value: 'Custom Release' },
    ],
    isLoading: false,
    effectiveType: filterState.current.type,
  })),
}));

vi.mock('@/contexts/FilterContext', () => ({
  FilterProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('react-hook-form', () => ({
  FormProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@chakra-ui/react', () => ({
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/components/Templates/MainTemplate', () => ({
  MainTemplate: ({ children, actionButton }: { children: React.ReactNode; actionButton: React.ReactNode }) => (
    <main>
      {actionButton}
      {children}
    </main>
  ),
}));

vi.mock('@/components/ui', () => ({
  Alert: {
    Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Indicator: () => null,
    Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Title: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  },
  Filter: () => null,
  toaster: { create: vi.fn() },
}));

vi.mock('@/components/dashboard/containers/DashboardGrid', () => ({
  DashboardGrid: () => null,
}));

vi.mock('@/components/dashboard/containers/DashboardExportSelect', () => ({
  DashboardExportSelect: ({ onSelect }: { onSelect: (mode: 'standard' | 'ai') => void }) => (
    <button type="button" onClick={() => onSelect('ai')}>
      Export with AI
    </button>
  ),
}));

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

const mockedDashboardQuery = vi.mocked(useGetApiV2ProjectsByProjectIdDashboardQuery);
const mockedExportDashboardPdf = vi.mocked(useExportDashboardPdfMutation);
const mockedSaveAs = vi.mocked(saveAs);

describe('DashboardContainer', () => {
  const exportDashboardPdf = vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue(new Blob(['pdf'])) }));

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-07T12:00:00'));
    mockedDashboardQuery.mockReturnValue({ data: undefined, isLoading: false, error: undefined } as never);
    mockedExportDashboardPdf.mockReturnValue([exportDashboardPdf, {}] as never);
    filterState.current = { type: 'all', period: '14' };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('requests dashboard data for every environment while preserving the selected period', () => {
    render(<DashboardContainer />);

    expect(mockedDashboardQuery).toHaveBeenCalledWith({ projectId: 'project-123', period: '14' });
  });

  it('uses the exact selected execution type for dashboard data and PDF export', async () => {
    filterState.current = { type: 'Custom Release', period: '14' };
    render(<DashboardContainer />);

    expect(mockedDashboardQuery).toHaveBeenCalledWith({
      projectId: 'project-123',
      period: '14',
      type: 'Custom Release',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Export with AI' }));
    await Promise.resolve();
    await Promise.resolve();

    expect(exportDashboardPdf).toHaveBeenCalledWith({
      pdfExportRequest: expect.objectContaining({ executionType: 'Custom Release' }),
    });
  });

  it('exports dashboard PDF data and filename without an environment filter', async () => {
    render(<DashboardContainer />);

    fireEvent.click(screen.getByRole('button', { name: 'Export with AI' }));
    await Promise.resolve();
    await Promise.resolve();

    expect(exportDashboardPdf).toHaveBeenCalledWith({
      pdfExportRequest: {
        project: 'project-123',
        executionType: 'all',
        periodStart: '2026-07-25',
        periodEnd: '2026-08-07',
        granularity: 'daily',
        includeAiInsights: true,
      },
    });
    expect(mockedSaveAs).toHaveBeenCalledWith(expect.any(Blob), 'dashboard-project-123-2026-07-25-2026-08-07-ai.pdf');
  });
});
