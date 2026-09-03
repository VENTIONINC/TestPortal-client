// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

let generatedApi: typeof import('@/redux/apis/generatedApi').generatedApi;
let store: typeof import('@/redux/store').store;

beforeAll(async () => {
  vi.stubEnv('VITE_API_URL', 'http://localhost');
  ({ generatedApi } = await import('@/redux/apis/generatedApi'));
  ({ store } = await import('@/redux/store'));
});

afterAll(() => {
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.restoreAllMocks();
  store.dispatch(generatedApi.util.resetApiState());
});

describe('Dashboard API', () => {
  it('serializes dashboard filters without an environment parameter', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ summary: {}, history: [], metadata: {} }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    const requestSubscription = store.dispatch(
      generatedApi.endpoints.getApiV2ProjectsByProjectIdDashboard.initiate({
        projectId: 'project-123',
        period: '14',
        type: 'e2e',
        granularity: 'daily',
      }),
    );

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());

    const request = fetchMock.mock.calls[0][0] as Request;
    const url = new URL(request.url);

    expect(url.pathname).toBe('/api/v2/projects/project-123/dashboard');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      period: '14',
      type: 'e2e',
      granularity: 'daily',
    });
    expect(url.searchParams.has('environment')).toBe(false);

    requestSubscription.abort();
  });
});
