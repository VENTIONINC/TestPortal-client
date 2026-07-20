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
