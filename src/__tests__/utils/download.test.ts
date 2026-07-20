// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { getDownloadFilename } from '@/utils/download';

describe('getDownloadFilename', () => {
  it('prefers a content-disposition filename over the fallback', () => {
    const headers = new Headers({ 'content-disposition': 'attachment; filename="backend-skill.md"' });

    expect(getDownloadFilename(headers, 'testing-guide-SKILL.md')).toBe('backend-skill.md');
  });

  it('uses a human-readable name-based fallback when a filename is missing', () => {
    expect(getDownloadFilename(undefined, 'testing-guide-SKILL.md')).toBe('testing-guide-SKILL.md');
    expect(getDownloadFilename(undefined, 'testing-guide.zip')).toBe('testing-guide.zip');
  });
});
