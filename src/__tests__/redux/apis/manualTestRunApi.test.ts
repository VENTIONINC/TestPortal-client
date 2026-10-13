// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import { extendedApi } from '@/redux/apis/extendedApi';
import { store } from '@/redux/store';

afterEach(() => {
  vi.useRealTimers();
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
        manualTestRunStartRequest: {
          environmentProfileId: 'profile-1',
          browser: 'Chrome 129',
          operatingSystem: null,
          build: 'build-42',
        },
      }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await (fetchMock.mock.calls[0][0] as Request).json()).toEqual({
      environmentProfileId: 'profile-1', browser: 'Chrome 129', operatingSystem: null, build: 'build-42',
    });
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

  it('scopes environment profile CRUD and cache refreshes to the selected project', async () => {
    const profile = {
      id: 'profile-1', projectId: 'project-1', ownerId: 'user-1', name: 'Chrome staging',
      browser: 'Chrome 129', operatingSystem: null, device: null, apiEnvironment: 'Staging',
      createdAt: '2026-10-09T10:00:00.000Z', updatedAt: '2026-10-09T10:00:00.000Z',
    };
    const counts = new Map<string, number>();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const request = input as Request;
      const url = new URL(request.url);
      const key = `${request.method}:${url.pathname}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
      if (request.method === 'DELETE') return new Response(null, { status: 204 });
      return new Response(JSON.stringify(request.method === 'GET' ? [profile] : profile), {
        headers: { 'content-type': 'application/json' },
      });
    });

    const projectOneProfiles = store.dispatch(extendedApi.endpoints.getApiV2ProjectsByProjectIdManualRunEnvironmentProfiles.initiate({ projectId: 'project-1' }));
    const projectTwoProfiles = store.dispatch(extendedApi.endpoints.getApiV2ProjectsByProjectIdManualRunEnvironmentProfiles.initiate({ projectId: 'project-2' }));
    await Promise.all([projectOneProfiles, projectTwoProfiles]);
    await store.dispatch(extendedApi.endpoints.postApiV2ProjectsByProjectIdManualRunEnvironmentProfiles.initiate({
      projectId: 'project-1',
      manualRunEnvironmentProfileCreateRequest: { name: 'Chrome staging', browser: 'Chrome 129', apiEnvironment: 'Staging' },
    }));
    await vi.waitFor(() => expect(counts.get('GET:/api/v2/projects/project-1/manual-run-environment-profiles')).toBeGreaterThanOrEqual(2));
    expect(counts.get('GET:/api/v2/projects/project-2/manual-run-environment-profiles')).toBe(1);

    await store.dispatch(extendedApi.endpoints.patchApiV2ProjectsByProjectIdManualRunEnvironmentProfilesAndProfileId.initiate({
      projectId: 'project-1', profileId: 'profile-1',
      manualRunEnvironmentProfileUpdateRequest: { name: 'Chrome staging updated' },
    }));
    await vi.waitFor(() => expect(counts.get('GET:/api/v2/projects/project-1/manual-run-environment-profiles')).toBeGreaterThanOrEqual(3));
    await store.dispatch(extendedApi.endpoints.deleteApiV2ProjectsByProjectIdManualRunEnvironmentProfilesAndProfileId.initiate({ projectId: 'project-1', profileId: 'profile-1' }));
    await vi.waitFor(() => expect(counts.get('GET:/api/v2/projects/project-1/manual-run-environment-profiles')).toBeGreaterThanOrEqual(4));

    const createRequest = fetchMock.mock.calls.find(([input]) => {
      const request = input as Request;
      return request.method === 'POST';
    })?.[0] as Request;
    expect(new URL(createRequest.url).pathname).toBe('/api/v2/projects/project-1/manual-run-environment-profiles');
    expect(await createRequest.json()).toEqual({ name: 'Chrome staging', browser: 'Chrome 129', apiEnvironment: 'Staging' });
    projectOneProfiles.unsubscribe();
    projectTwoProfiles.unsubscribe();
  });

  it('loads the authenticated active-user directory', async () => {
    const users = [{ id: 'user-2', name: 'Alex User', email: 'alex@example.com' }];
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(users), { headers: { 'content-type': 'application/json' } }),
    );

    const result = await store.dispatch(extendedApi.endpoints.getApiV2Users.initiate());

    expect(result.data).toEqual(users);
    expect(new URL((fetchMock.mock.calls[0][0] as Request).url).pathname).toBe('/api/v2/users');
  });

  it('sends executor reassignment with project scope and does not retry a failed mutation', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Executor must be an active user' }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const resultPromise = store.dispatch(extendedApi.endpoints.patchApiV2ManualTestRunsByRunIdExecutor.initiate({
      projectId: 'project-1',
      runId: 'run-1',
      manualTestRunExecutorReassignmentRequest: { executedById: 'user-2' },
    }));
    await vi.runAllTimersAsync();
    await resultPromise;

    expect(fetchMock).toHaveBeenCalledOnce();
    const request = fetchMock.mock.calls[0][0] as Request;
    const url = new URL(request.url);
    expect(request.method).toBe('PATCH');
    expect(url.pathname).toBe('/api/v2/manual-test-runs/run-1/executor');
    expect(url.searchParams.get('projectId')).toBe('project-1');
    expect(await request.json()).toEqual({ executedById: 'user-2' });
  }, 15000);

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

  it('refreshes only the reassigned run and its matching project/scenario histories', async () => {
    const run = {
      id: 'run-1',
      projectId: 'project-1',
      sourceTestScenarioId: 'scenario-1',
      testScenarioId: 'scenario-1',
      executedById: 'user-1',
      executedBy: { id: 'user-1', name: 'Current User', email: 'current@example.com' },
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
    const reassignedRun = {
      ...run,
      executedById: 'user-2',
      executedBy: { id: 'user-2', name: 'Next User', email: 'next@example.com' },
      updatedAt: '2026-09-17T11:00:00.000Z',
    };
    const counts = new Map<string, number>();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = new URL((input as Request).url);
      const key = `${url.pathname}:${url.searchParams.get('projectId') ?? ''}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
      if (url.pathname.endsWith('/executor')) {
        return new Response(JSON.stringify(reassignedRun), { headers: { 'content-type': 'application/json' } });
      }
      if (url.pathname.endsWith('/run-1')) {
        return new Response(JSON.stringify(run), { headers: { 'content-type': 'application/json' } });
      }
      if (url.pathname.endsWith('/manual-runs')) {
        return new Response(JSON.stringify({ runs: [], total: 0, page: 1, limit: 30, totalPages: 0 }), {
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ runs: [], total: 0, page: 1, limit: 30, totalPages: 0 }), {
        headers: { 'content-type': 'application/json' },
      });
    });

    const detail = store.dispatch(extendedApi.endpoints.getApiV2ManualTestRunsByRunId.initiate({ runId: 'run-1', projectId: 'project-1' }));
    const projectHistory = store.dispatch(extendedApi.endpoints.getApiV2ManualTestRuns.initiate({ projectId: 'project-1' }));
    const otherProjectHistory = store.dispatch(extendedApi.endpoints.getApiV2ManualTestRuns.initiate({ projectId: 'project-2' }));
    const scenarioHistory = store.dispatch(extendedApi.endpoints.getApiV2TestScenariosByScenarioIdManualRuns.initiate({ scenarioId: 'scenario-1', projectId: 'project-1' }));
    await Promise.all([detail, projectHistory, otherProjectHistory, scenarioHistory]);

    await store.dispatch(extendedApi.endpoints.patchApiV2ManualTestRunsByRunIdExecutor.initiate({
      projectId: 'project-1',
      runId: 'run-1',
      manualTestRunExecutorReassignmentRequest: { executedById: 'user-2' },
    }));

    await vi.waitFor(() => {
      expect(counts.get('/api/v2/manual-test-runs/run-1:project-1')).toBeGreaterThanOrEqual(2);
      expect(counts.get('/api/v2/manual-test-runs:project-1')).toBeGreaterThanOrEqual(2);
      expect(counts.get('/api/v2/test-scenarios/scenario-1/manual-runs:project-1')).toBeGreaterThanOrEqual(2);
    });
    expect(counts.get('/api/v2/manual-test-runs:project-2')).toBe(1);
    detail.unsubscribe();
    projectHistory.unsubscribe();
    otherProjectHistory.unsubscribe();
    scenarioHistory.unsubscribe();
    expect(fetchMock).toHaveBeenCalled();
  });
});
