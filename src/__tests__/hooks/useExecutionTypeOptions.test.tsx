// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { normalizeExecutionTypeFilters, useExecutionTypeOptions } from '@/hooks/useExecutionTypeOptions';

const queryMock = vi.hoisted(() =>
  vi.fn(() => ({
    data: undefined as string[] | undefined,
    isFetching: false,
    isError: false,
  })),
);

vi.mock('@/redux/apis/generatedApi', () => ({
  useGetApiV2ProjectsByIdExecutionTypesQuery: queryMock,
}));

describe('useExecutionTypeOptions', () => {
  beforeEach(() => {
    queryMock.mockReset();
    queryMock.mockReturnValue({ data: undefined, isFetching: false, isError: false });
  });

  it('maps exact project values after the All option', () => {
    queryMock.mockReturnValue({ data: ['Custom Release', 'Nightly'], isFetching: false, isError: false });

    const { result } = renderHook(() =>
      useExecutionTypeOptions({ projectId: 'project-1', selectedType: 'all' }),
    );

    expect(result.current.options).toEqual([
      { label: 'All', value: 'all' },
      { label: 'Custom Release', value: 'Custom Release' },
      { label: 'Nightly', value: 'Nightly' },
    ]);
    expect(queryMock).toHaveBeenCalledWith({ id: 'project-1' }, { skip: false });
  });

  it('normalizes an empty URL selection to All', () => {
    expect(normalizeExecutionTypeFilters({ type: '', period: '14' })).toEqual({
      type: 'all',
      period: '14',
    });
  });

  it('exposes loading state and only the All option before values load', () => {
    queryMock.mockReturnValue({ data: undefined, isFetching: true, isError: false });

    const { result } = renderHook(() =>
      useExecutionTypeOptions({ projectId: 'project-1', selectedType: 'all' }),
    );

    expect(result.current).toEqual({
      options: [{ label: 'All', value: 'all' }],
      isLoading: true,
      effectiveType: 'all',
    });
  });

  it('resets a selected type that is unavailable after a project change', async () => {
    const onInvalidType = vi.fn();
    queryMock.mockReturnValue({ data: ['Release'], isFetching: false, isError: false });

    renderHook(() =>
      useExecutionTypeOptions({
        projectId: 'project-2',
        selectedType: 'Nightly',
        onInvalidType,
      }),
    );

    await waitFor(() => expect(onInvalidType).toHaveBeenCalledWith('all'));
  });

  it('preserves a selected type that is available in the new project', async () => {
    const onInvalidType = vi.fn();
    queryMock.mockReturnValue({ data: ['Nightly'], isFetching: false, isError: false });

    const { result } = renderHook(() =>
      useExecutionTypeOptions({
        projectId: 'project-2',
        selectedType: 'Nightly',
        onInvalidType,
      }),
    );

    await waitFor(() => expect(onInvalidType).not.toHaveBeenCalled());
    expect(result.current.effectiveType).toBe('Nightly');
  });

  it('keeps effectiveType at all while project types are still loading', () => {
    queryMock.mockReturnValue({ data: undefined, isFetching: true, isError: false });

    const { result } = renderHook(() =>
      useExecutionTypeOptions({
        projectId: 'project-2',
        selectedType: 'Nightly',
      }),
    );

    expect(result.current.effectiveType).toBe('all');
  });

  it('resets an invalid selection when discovery fails', async () => {
    const onInvalidType = vi.fn();
    queryMock.mockReturnValue({ data: undefined, isFetching: false, isError: true });

    const { result } = renderHook(() =>
      useExecutionTypeOptions({
        projectId: 'project-2',
        selectedType: 'Nightly',
        onInvalidType,
      }),
    );

    await waitFor(() => expect(onInvalidType).toHaveBeenCalledWith('all'));
    expect(result.current.effectiveType).toBe('all');
  });
});
