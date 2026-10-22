// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ project: vi.fn(), scenario: vi.fn() }));

vi.mock('@/redux/apis/extendedApi', () => ({
  useGetApiV2ManualTestRunsQuery: mocks.project,
  useGetApiV2TestScenariosByScenarioIdManualRunsQuery: mocks.scenario,
}));

import { useManualTestRunHistory } from '@/components/manual-test-runs/hooks/useManualTestRunHistory';

const query = { currentData: undefined, error: undefined, isLoading: false, isFetching: false, refetch: vi.fn() };
const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

describe('useManualTestRunHistory', () => {
  it('applies a trimmed exact key only on Apply and preserves other immediate filters', () => {
    mocks.project.mockReturnValue(query);
    mocks.scenario.mockReturnValue(query);
    const { result } = renderHook(() => useManualTestRunHistory('project-1'), { wrapper });
    const initial = mocks.project.mock.calls.at(-1)?.[0];
    expect(initial).toMatchObject({ projectId: 'project-1', page: 1 });
    expect(initial?.sourceScenarioKey).toBeUndefined();

    act(() => result.current.setSourceScenarioKey('  AUTH-LOGIN  '));
    expect(mocks.project.mock.calls.at(-1)?.[0]).toEqual(initial);

    act(() => result.current.setStatus('passed'));
    expect(mocks.project.mock.calls.at(-1)?.[0]).toMatchObject({ status: 'passed' });
    expect(mocks.project.mock.calls.at(-1)?.[0].sourceScenarioKey).toBeUndefined();

    act(() => result.current.applyFilters());
    expect(mocks.project.mock.calls.at(-1)?.[0]).toMatchObject({ status: 'passed', sourceScenarioKey: 'AUTH-LOGIN' });

    act(() => result.current.setSourceScenarioKey('   '));
    act(() => result.current.applyFilters());
    expect(mocks.project.mock.calls.at(-1)?.[0].sourceScenarioKey).toBeUndefined();
    expect(mocks.project.mock.calls.at(-1)?.[0]).toMatchObject({ status: 'passed' });
  });

  it('keeps the previous applied key on invalid input and resets both values on clear or scope change', () => {
    mocks.project.mockReturnValue(query);
    mocks.scenario.mockReturnValue(query);
    const { result, rerender } = renderHook(({ projectId, scenarioId }: { projectId: string; scenarioId?: string }) => useManualTestRunHistory(projectId, scenarioId), {
      initialProps: { projectId: 'project-1' },
      wrapper,
    });

    act(() => result.current.setSourceScenarioKey('R1'));
    act(() => result.current.applyFilters());
    const applied = mocks.project.mock.calls.at(-1)?.[0];
    act(() => result.current.setSourceScenarioKey('x'.repeat(101)));
    expect(result.current.dateError).toContain('100 characters or fewer');
    act(() => result.current.applyFilters());
    expect(mocks.project.mock.calls.at(-1)?.[0]).toEqual(applied);

    act(() => result.current.clearFilters());
    expect(mocks.project.mock.calls.at(-1)?.[0].sourceScenarioKey).toBeUndefined();
    act(() => result.current.setSourceScenarioKey('R2'));
    rerender({ projectId: 'project-2' });
    expect(result.current.filters.sourceScenarioKey).toBe('');
    expect(result.current.page).toBe(1);
  });

  it('omits the project key predicate from nested scenario history', () => {
    mocks.project.mockReturnValue(query);
    mocks.scenario.mockReturnValue(query);
    const { result } = renderHook(() => useManualTestRunHistory('project-1', 'scenario-1'), { wrapper });
    act(() => result.current.setSourceScenarioKey('R1'));
    act(() => result.current.applyFilters());
    expect(mocks.scenario.mock.calls.at(-1)?.[0].sourceScenarioKey).toBeUndefined();
    expect(mocks.project.mock.calls.at(-1)?.[1]).toMatchObject({ skip: true });
  });
});
