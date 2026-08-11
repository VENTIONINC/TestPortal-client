// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useResultsData } from '@/components/results/hooks/useResultsData';
import { ResultsFilters } from '@/types';
import { GetResultsResponse } from '@/types/apis';

const queryMock = vi.hoisted(() =>
  vi.fn<(params: unknown) => { data: GetResultsResponse | undefined; isFetching: boolean }>((params: unknown) => {
    void params;
    return { data: undefined, isFetching: false };
  }),
);

vi.mock('@/redux/apis/extendedApi', () => ({
  useGetResultsQuery: queryMock,
}));

const filters: ResultsFilters = {
  tags: [],
  specId: '',
  specFile: '',
  specName: '',
  environment: '',
  type: 'all',
  status: 'failed',
  reviewStatus: '',
  errorMessage: '',
  issueName: '',
  from: '2026-07-01',
  to: '2026-07-07',
  page: 1,
};

describe('useResultsData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    queryMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces upper date changes before requesting filtered results', () => {
    const { rerender } = renderHook(
      ({ selectedDates }) =>
        useResultsData({
          effectiveFilters: filters,
          debouncedFilters: filters,
          selectedDates,
          selectedProjectId: 'project-1',
        }),
      { initialProps: { selectedDates: ['2026-07-02'] } },
    );

    expect(queryMock.mock.lastCall?.[0]).toMatchObject({ dates: ['2026-07-02'] });

    rerender({ selectedDates: ['2026-07-02', '2026-07-04'] });
    act(() => vi.advanceTimersByTime(199));
    expect(queryMock.mock.lastCall?.[0]).toMatchObject({ dates: ['2026-07-02'] });

    act(() => vi.advanceTimersByTime(1));
    expect(queryMock.mock.lastCall?.[0]).toMatchObject({ dates: ['2026-07-04', '2026-07-02'] });
  });

  it('returns available tags when filtered and raw results are empty', () => {
    queryMock.mockReturnValue({
      data: {
        results: [],
        rawResults: [],
        availableTags: ['L1', 'L2', 'L3'],
        total: 0,
        rawTotal: 0,
        page: 1,
        totalPages: 0,
      },
      isFetching: false,
    });

    const { result } = renderHook(() =>
      useResultsData({
        effectiveFilters: { ...filters, tags: ['L1', 'L2'] },
        debouncedFilters: { ...filters, tags: ['L1', 'L2'] },
        selectedDates: ['2026-07-02'],
        selectedProjectId: 'project-1',
      }),
    );

    expect(result.current.availableTags).toEqual(['L1', 'L2', 'L3']);
    expect(result.current.rawResults).toEqual([]);
  });

  it('omits the type request parameter when All is selected', () => {
    renderHook(() =>
      useResultsData({
        effectiveFilters: filters,
        debouncedFilters: filters,
        selectedDates: ['2026-07-02'],
        selectedProjectId: 'project-1',
      }),
    );

    expect(queryMock.mock.lastCall?.[0]).toMatchObject({ type: undefined });
  });

  it('submits the exact selected execution type', () => {
    const releaseFilters = { ...filters, type: 'Custom Release' };

    renderHook(() =>
      useResultsData({
        effectiveFilters: releaseFilters,
        debouncedFilters: releaseFilters,
        selectedDates: ['2026-07-02'],
        selectedProjectId: 'project-1',
      }),
    );

    expect(queryMock.mock.lastCall?.[0]).toMatchObject({ type: 'Custom Release' });
  });
});
