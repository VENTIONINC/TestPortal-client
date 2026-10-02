// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTestScenarioDetail } from '@/components/test-scenarios/hooks/useTestScenarioDetail';
import { useGetApiV2TestScenariosByScenarioIdQuery, type TestScenario } from '@/redux/apis/generatedApi';

vi.mock('@/redux/apis/generatedApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/redux/apis/generatedApi')>();

  return { ...actual, useGetApiV2TestScenariosByScenarioIdQuery: vi.fn() };
});

const mockedDetailQuery = vi.mocked(useGetApiV2TestScenariosByScenarioIdQuery);

const scenario: TestScenario = {
  id: 'scenario-1',
  projectId: 'project-1',
  createdById: 'user-1',
  title: 'Checkout flow',
  contentMd: '# Checkout flow',
  details: 'Original details',
  objective: 'Complete checkout',
  preconditions: 'Signed in',
  testData: null,
  expectedResult: 'Order exists',
  notes: null,
  steps: [],
  contentMdHash: 'hash-1',
  contentMdFormatVersion: 1,
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-02T11:00:00.000Z',
};

describe('useTestScenarioDetail', () => {
  beforeEach(() => {
    mockedDetailQuery.mockReset();
  });

  it('refreshes persisted metadata when only full-scenario details changes', async () => {
    let response = scenario;
    mockedDetailQuery.mockImplementation(
      () =>
        ({
          data: response,
          currentData: response,
          isLoading: false,
          isFetching: false,
          error: undefined,
          refetch: vi.fn(),
        }) as never,
    );

    const { result, rerender } = renderHook(() => useTestScenarioDetail('project-1', 'scenario-1'));

    await waitFor(() => expect(result.current.scenario?.details).toBe('Original details'));

    response = { ...scenario, details: 'Updated details' };
    rerender();

    await waitFor(() => expect(result.current.scenario?.details).toBe('Updated details'));
  });
});
