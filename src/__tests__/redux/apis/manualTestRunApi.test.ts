// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import { extendedApi } from '@/redux/apis/extendedApi';
import { store } from '@/redux/store';

afterEach(() => {
  vi.restoreAllMocks();
  store.dispatch(extendedApi.util.resetApiState());
});

describe('Manual Test Run API integration', () => {
  it('does not retry a start mutation after a transport/server failure', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'temporary failure' }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await store.dispatch(
      extendedApi.endpoints.postApiV2TestScenariosByScenarioIdManualRuns.initiate({
        scenarioId: 'scenario-1',
        projectId: 'project-1',
        manualTestRunStartRequest: {},
      }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('serializes the selected project and run identity on detail retrieval', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'run-1', projectId: 'project-1' }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    await store.dispatch(
      extendedApi.endpoints.getApiV2ManualTestRunsByRunId.initiate({ runId: 'run-1', projectId: 'project-1' }),
    );

    const request = fetchMock.mock.calls[0][0] as Request;
    const url = new URL(request.url);
    expect(url.pathname).toBe('/api/v2/manual-test-runs/run-1');
    expect(url.searchParams.get('projectId')).toBe('project-1');
  });

  it('serializes combined project history filters and keeps nested history free of a source filter', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(
      JSON.stringify({ runs: [], total: 0, page: 1, limit: 30, totalPages: 0 }),
      { headers: { 'content-type': 'application/json' } },
    ));

    await store.dispatch(extendedApi.endpoints.getApiV2ManualTestRuns.initiate({
      projectId: 'project-1',
      page: 2,
      limit: 30,
      startedFrom: '2026-09-18T00:00:00.000Z',
      startedBefore: '2026-09-19T00:00:00.000Z',
      testScenarioId: 'scenario-1',
      status: 'failed',
    }));
    await store.dispatch(extendedApi.endpoints.getApiV2TestScenariosByScenarioIdManualRuns.initiate({
      projectId: 'project-1',
      scenarioId: 'scenario-1',
      page: 1,
      limit: 30,
      startedFrom: '2026-09-18T00:00:00.000Z',
      startedBefore: '2026-09-19T00:00:00.000Z',
      status: 'passed',
    }));

    const getRequestUrl = (input: unknown) => new URL(typeof input === 'string' ? input : (input as Request).url);
    const projectUrl = getRequestUrl(fetchMock.mock.calls[0][0]).searchParams;
    const nestedUrl = getRequestUrl(fetchMock.mock.calls[1][0]).searchParams;
    expect(projectUrl.get('projectId')).toBe('project-1');
    expect(projectUrl.get('page')).toBe('2');
    expect(projectUrl.get('testScenarioId')).toBe('scenario-1');
    expect(projectUrl.get('status')).toBe('failed');
    expect(nestedUrl.get('scenarioId')).toBeNull();
    expect(nestedUrl.get('testScenarioId')).toBeNull();
    expect(nestedUrl.get('status')).toBe('passed');
  });

  it('refetches the matching detail and project history after a successful scoped write', async () => {
    const run = {
      id: 'run-1',
      projectId: 'project-1',
      sourceTestScenarioId: 'scenario-1',
      testScenarioId: null,
      executedById: null,
      executedBy: null,
      status: 'in_progress',
      startedAt: '2026-09-17T10:00:00.000Z',
      completedAt: null,
      updatedAt: '2026-09-17T10:00:00.000Z',
      title: 'Snapshot',
      details: null,
      objective: null,
      preconditions: null,
      testData: null,
      expectedResult: null,
      scenarioNotes: null,
      notes: null,
      steps: [],
    };
    const requestCounts = new Map<string, number>();
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const request = input as Request;
      const path = new URL(request.url).pathname;
      requestCounts.set(path, (requestCounts.get(path) ?? 0) + 1);
      if (path === '/api/v2/manual-test-runs') {
        return new Response(JSON.stringify({ runs: [], total: 0, page: 1, limit: 30, totalPages: 0 }), {
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ ...run, notes: request.method === 'PATCH' ? 'saved' : null }), {
        headers: { 'content-type': 'application/json' },
      });
    });

    const detail = store.dispatch(
      extendedApi.endpoints.getApiV2ManualTestRunsByRunId.initiate({ runId: 'run-1', projectId: 'project-1' }),
    );
    const history = store.dispatch(extendedApi.endpoints.getApiV2ManualTestRuns.initiate({ projectId: 'project-1' }));
    await Promise.all([detail, history]);

    await store.dispatch(
      extendedApi.endpoints.patchApiV2ManualTestRunsByRunId.initiate({
        runId: 'run-1',
        projectId: 'project-1',
        manualTestRunUpdateRequest: { notes: 'saved' },
      }),
    );

    await vi.waitFor(() => {
      expect(requestCounts.get('/api/v2/manual-test-runs/run-1')).toBeGreaterThanOrEqual(2);
      expect(requestCounts.get('/api/v2/manual-test-runs')).toBeGreaterThanOrEqual(2);
    });
    detail.unsubscribe();
    history.unsubscribe();
  });
});
