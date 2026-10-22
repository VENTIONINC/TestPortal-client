// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import { extendedApi } from '@/redux/apis/extendedApi';
import { resultDetailApi } from '@/redux/apis/resultDetailApi';
import { scenarioManagementApi } from '@/redux/apis/scenarioManagementApi';
import { store } from '@/redux/store';

afterEach(() => {
  vi.restoreAllMocks();
  store.dispatch(extendedApi.util.resetApiState());
});

describe('Result Spec scenario links API', () => {
  it('serializes trimmed title/key search as a project-scoped server query', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ scenarios: [], total: 0, page: 1, limit: 10, totalPages: 0 }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    await store.dispatch(scenarioManagementApi.endpoints.getApiV2TestScenariosForResultLinkManagement.initiate({
      projectId: 'project-1',
      page: 1,
      limit: 10,
      search: ' PAY-2 ',
    })).unwrap();

    const request = fetchMock.mock.calls[0][0] as Request;
    const params = new URL(request.url).searchParams;
    expect(params.get('projectId')).toBe('project-1');
    expect(params.get('page')).toBe('1');
    expect(params.get('limit')).toBe('10');
    expect(params.get('search')).toBe(' PAY-2 ');
  });

  it('refreshes subscribed Result details for the mutated project without refetching other projects', async () => {
    const requestCounts = new Map<string, number>();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const request = input as Request;
      const url = new URL(request.url);
      const path = url.pathname;

      if (request.method === 'POST') {
        return new Response(JSON.stringify({ scenarioId: 'scenario-1', specId: 'spec-1' }), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        });
      }

      const projectId = url.searchParams.get('projectId') ?? 'unknown';
      if (path.startsWith('/api/v2/results/')) {
        const key = `detail:${projectId}:${path.split('/').pop()}`;
        requestCounts.set(key, (requestCounts.get(key) ?? 0) + 1);
        return new Response(JSON.stringify({ id: path.split('/').pop(), spec: { id: 'spec-1' }, relatedTestScenarios: [] }), {
          headers: { 'content-type': 'application/json' },
        });
      }

      if (path.endsWith('/spec-links')) {
        const key = `links:${projectId}:${path.split('/')[4]}`;
        requestCounts.set(key, (requestCounts.get(key) ?? 0) + 1);
        return new Response(JSON.stringify({ scenarioId: path.split('/')[4], projectId, specs: [], total: 0, page: 1, limit: 10, totalPages: 0 }), {
          headers: { 'content-type': 'application/json' },
        });
      }

      requestCounts.set(`catalog:${projectId}`, (requestCounts.get(`catalog:${projectId}`) ?? 0) + 1);

      return new Response(JSON.stringify({ scenarios: [], total: 0, page: 1, limit: 10, totalPages: 0 }), {
        headers: { 'content-type': 'application/json' },
      });
    });

    const resultOne = store.dispatch(resultDetailApi.endpoints.getResultDetailWithRelatedScenarios.initiate({ resultId: 'result-1', projectId: 'project-1' }));
    const resultTwo = store.dispatch(resultDetailApi.endpoints.getResultDetailWithRelatedScenarios.initiate({ resultId: 'result-2', projectId: 'project-1' }));
    const otherProject = store.dispatch(resultDetailApi.endpoints.getResultDetailWithRelatedScenarios.initiate({ resultId: 'result-2', projectId: 'project-2' }));
    const catalog = store.dispatch(scenarioManagementApi.endpoints.getApiV2TestScenariosForResultLinkManagement.initiate({ projectId: 'project-1', page: 1, limit: 10 }));
    const otherCatalog = store.dispatch(scenarioManagementApi.endpoints.getApiV2TestScenariosForResultLinkManagement.initiate({ projectId: 'project-2', page: 1, limit: 10 }));
    const links = store.dispatch(extendedApi.endpoints.getApiV2TestScenariosByScenarioIdSpecLinks.initiate({ scenarioId: 'scenario-1', projectId: 'project-1', page: 1, limit: 10 }));
    const otherLinks = store.dispatch(extendedApi.endpoints.getApiV2TestScenariosByScenarioIdSpecLinks.initiate({ scenarioId: 'scenario-1', projectId: 'project-2', page: 1, limit: 10 }));

    await Promise.all([resultOne, resultTwo, otherProject, catalog, otherCatalog, links, otherLinks]);
    expect(requestCounts.get('catalog:project-2')).toBe(1);
    await store.dispatch(extendedApi.endpoints.postApiV2TestScenariosByScenarioIdSpecLinks.initiate({
      scenarioId: 'scenario-1',
      projectId: 'project-1',
      testScenarioSpecLinkBody: { specId: 'spec-1' },
    })).unwrap();

    await vi.waitFor(() => {
      expect(requestCounts.get('detail:project-1:result-1')).toBe(2);
      expect(requestCounts.get('detail:project-1:result-2')).toBe(2);
      expect(requestCounts.get('links:project-1:scenario-1')).toBe(2);
    });
    expect(requestCounts.get('detail:project-2:result-2')).toBe(1);
    expect(requestCounts.get('catalog:project-2')).toBe(1);
    expect(requestCounts.get('links:project-2:scenario-1')).toBe(1);
    const writeRequest = fetchMock.mock.calls.find(([input]) => (input as Request).method === 'POST')?.[0] as Request;
    expect(new URL(writeRequest.url).searchParams.get('projectId')).toBe('project-1');
    expect(await writeRequest.clone().json()).toEqual({ specId: 'spec-1' });

    resultOne.unsubscribe();
    resultTwo.unsubscribe();
    otherProject.unsubscribe();
    catalog.unsubscribe();
    otherCatalog.unsubscribe();
    links.unsubscribe();
    otherLinks.unsubscribe();
  });

  it('does not retry failed link writes', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'temporary failure' }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await store.dispatch(extendedApi.endpoints.postApiV2TestScenariosByScenarioIdSpecLinks.initiate({
      scenarioId: 'scenario-1',
      projectId: 'project-1',
      testScenarioSpecLinkBody: { specId: 'spec-1' },
    }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not retry failed unlink writes', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'temporary failure' }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await store.dispatch(extendedApi.endpoints.deleteApiV2TestScenariosByScenarioIdSpecLinksAndSpecId.initiate({
      scenarioId: 'scenario-1',
      specId: 'spec-1',
      projectId: 'project-1',
    }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
