// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import { baseApi } from '@/redux/apis/baseApi';
import { extendedApi } from '@/redux/apis/extendedApi';
import { store } from '@/redux/store';

afterEach(() => {
  vi.restoreAllMocks();
  store.dispatch(extendedApi.util.resetApiState());
});

describe('Skill download endpoints', () => {
  it('uses the metadata-provided ZIP URL on the authenticated base API', async () => {
    const downloadUrl = '/api/v2/skills/custom-skill/archive';
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('zip-content'));

    const result = await store.dispatch(
      extendedApi.endpoints.downloadSkillArchive.initiate({ downloadUrl, name: 'custom-skill' }),
    );
    const request = fetchMock.mock.calls[0][0] as Request;

    expect(new URL(request.url).pathname).toBe(downloadUrl);
    expect(request.method).toBe('GET');
    expect(result.data).toMatchObject({ fileName: 'custom-skill.zip' });
    expect(result.data?.blob).toMatchObject({ size: 11 });
    expect(extendedApi.reducerPath).toBe(baseApi.reducerPath);
    expect(extendedApi.endpoints).toHaveProperty('downloadSkillArchive');
    expect(Object.keys(extendedApi.endpoints).filter((endpoint) => endpoint.toLowerCase().includes('markdown'))).toEqual([]);
  });
});

describe('Results endpoint', () => {
  it('serializes the selected dates in the results request', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [],
          rawResults: [],
          availableTags: [],
          total: 0,
          rawTotal: 0,
          page: 1,
          totalPages: 0,
        }),
        { headers: { 'content-type': 'application/json' } },
      ),
    );

    await store
      .dispatch(
        extendedApi.endpoints.getResults.initiate({
          projectId: 'project-1',
          from: '2026-07-01',
          to: '2026-07-07',
          dates: ['2026-07-02', '2026-07-04'],
        }),
      )
      .unwrap();

    const request = fetchMock.mock.calls[0][0] as Request;
    expect(new URL(request.url).searchParams.get('dates')).toBe('2026-07-02,2026-07-04');
  });
});

describe('Category source-of-truth API contracts', () => {
  it('does not serialize retired category filters on the generated issue list', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ issues: [], total: 0, page: 1, totalPages: 0 }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    await store
      .dispatch(
        extendedApi.endpoints.getApiV2Issues.initiate({
          projectId: 'project-1',
          name: 'checkout',
          category: 'Bug',
        } as never),
      )
      .unwrap();

    const request = fetchMock.mock.calls[0][0] as Request;
    expect(new URL(request.url).searchParams.get('category')).toBeNull();
  });

  it('refreshes results, issues, and dashboard data after analysis feedback changes a category', async () => {
    const requestCounts = new Map<string, number>();
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const request = input as Request;
      const path = new URL(request.url).pathname;
      requestCounts.set(path, (requestCounts.get(path) ?? 0) + 1);

      if (request.method === 'PATCH') {
        return new Response(JSON.stringify({ id: 'result-1' }), { headers: { 'content-type': 'application/json' } });
      }

      return new Response(JSON.stringify(path.includes('/issues') ? { issues: [], total: 0, page: 1, totalPages: 0 } : {}), {
        headers: { 'content-type': 'application/json' },
      });
    });

    const results = store.dispatch(extendedApi.endpoints.getApiV2Results.initiate({ projectId: 'project-1' }));
    const issues = store.dispatch(extendedApi.endpoints.getApiV2Issues.initiate({ projectId: 'project-1' }));
    const dashboard = store.dispatch(
      extendedApi.endpoints.getApiV2ProjectsByProjectIdDashboard.initiate({
        projectId: 'project-1',
      }),
    );
    await Promise.all([results, issues, dashboard]);

    await store
      .dispatch(
        extendedApi.endpoints.patchApiV2ResultsByResultIdAnalysisFeedback.initiate({
          resultId: 'result-1',
          updateResultAnalysisFeedbackRequest: { analysisFeedbackCategory: 'bug' },
        }),
      )
      .unwrap();

    await vi.waitFor(() => {
      expect(requestCounts.get('/api/v2/results')).toBe(2);
      expect(requestCounts.get('/api/v2/issues')).toBe(2);
      expect(requestCounts.get('/api/v2/projects/project-1/dashboard')).toBe(2);
    });

    results.unsubscribe();
    issues.unsubscribe();
    dashboard.unsubscribe();
  });
});

describe('Custom skill mutation endpoints', () => {
  const responseMetadata = {
    id: 'persisted-skill-id',
    name: 'custom-skill',
    title: 'Custom skill',
    description: 'Custom skill description',
    category: 'Engineering',
    source: 'custom' as const,
    readOnly: false,
    downloadUrl: '/api/v2/skills/persisted-skill-id/archive',
  };

  it.each([
    {
      endpoint: 'createCustomSkill' as const,
      method: 'POST',
      path: '/api/v2/skills',
      input: { package: new File(['zip-content'], 'skill.zip', { type: 'application/zip' }), title: '  Title  ', category: '  Category  ' },
    },
    {
      endpoint: 'replaceCustomSkill' as const,
      method: 'PUT',
      path: '/api/v2/skills/persisted-skill-id',
      input: { id: 'persisted-skill-id', package: new File(['zip-content'], 'skill.zip', { type: 'application/zip' }), title: '  Title  ', category: '  Category  ' },
    },
  ])('serializes $endpoint as multipart FormData', async ({ endpoint, method, path, input }) => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(responseMetadata), {
        status: method === 'POST' ? 201 : 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    if (endpoint === 'createCustomSkill') {
      await store.dispatch(extendedApi.endpoints.createCustomSkill.initiate(input)).unwrap();
    } else {
      await store.dispatch(extendedApi.endpoints.replaceCustomSkill.initiate(input)).unwrap();
    }

    const request = fetchMock.mock.calls[0][0] as Request;
    const rawBody = await request.clone().text();
    const body = await request.formData();

    expect(new URL(request.url).pathname).toBe(path);
    expect(request.method).toBe(method);
    expect(request.headers.get('content-type')).toMatch(/^multipart\/form-data; boundary=/);
    expect(body.get('title')).toBe('Title');
    expect(body.get('category')).toBe('Category');
    expect(body.get('package')).not.toBe('[object Object]');
    expect(rawBody).toContain('name="package"');
    expect(rawBody).toContain('Content-Type: application/zip');
  });

  it('invalidates subscribed Skills queries after a successful mutation', async () => {
    let catalogRequests = 0;
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const request = input as Request;

      if (request.method === 'GET') {
        catalogRequests += 1;
        return new Response(JSON.stringify({ skills: [] }), {
          headers: { 'content-type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(responseMetadata), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      });
    });
    const subscription = store.dispatch(extendedApi.endpoints.getApiV2Skills.initiate());
    await subscription;

    await store
      .dispatch(
        extendedApi.endpoints.createCustomSkill.initiate({
          package: new File(['zip-content'], 'skill.zip', { type: 'application/zip' }),
          title: 'Title',
          category: 'Category',
        }),
      )
      .unwrap();

    await vi.waitFor(() => expect(catalogRequests).toBe(2));
    expect(fetchMock).toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('re-exports stable-ID deletion from the authenticated Skills API', () => {
    expect(extendedApi.reducerPath).toBe(baseApi.reducerPath);
    expect(extendedApi.endpoints).toHaveProperty('deleteApiV2SkillsById');
  });
});
