// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { baseApi } from '@/redux/apis/baseApi';
import { extendedApi, getSkillArchiveDownloadPath, getSkillMarkdownDownloadPath } from '@/redux/apis/extendedApi';

describe('Skill download endpoints', () => {
  it('addresses both artifacts by encoded persisted ID on the authenticated base API', () => {
    const skillId = 'custom skill/id';

    expect(getSkillMarkdownDownloadPath(skillId)).toBe('/api/v2/skills/custom%20skill%2Fid/download');
    expect(getSkillArchiveDownloadPath(skillId)).toBe('/api/v2/skills/custom%20skill%2Fid/archive');
    expect(extendedApi.reducerPath).toBe(baseApi.reducerPath);
  });
});
