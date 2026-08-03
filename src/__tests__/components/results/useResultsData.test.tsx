// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useResultsData } from '@/components/results/hooks/useResultsData';
import { ResultsFilters } from '@/types';

const queryMock = vi.hoisted(() =>
  vi.fn((params: unknown) => {
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
  type: '',
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
});
