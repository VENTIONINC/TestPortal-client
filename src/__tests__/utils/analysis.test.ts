// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { getEffectiveResultCategory, normalizeResultCategory } from '@/utils';

describe('result category normalization', () => {
  it.each([
    [' BUG ', 'bug'],
    ['Performance', 'performance'],
    [' environment ', 'infra'],
    ['infra', 'infra'],
    ['other', 'other'],
  ])('normalizes %j to %j', (value, expected) => {
    expect(normalizeResultCategory(value)).toBe(expected);
  });

  it.each(['', 'unknown', 42, {}, false])('returns uncategorized for malformed value %j', (value) => {
    expect(normalizeResultCategory(value)).toBeUndefined();
  });

  it('uses the normalized AI category when feedback is nullish', () => {
    expect(getEffectiveResultCategory(' Environment ', null)).toBe('infra');
    expect(getEffectiveResultCategory(' SCRIPT ', undefined)).toBe('script');
  });

  it('uses feedback when present even when it is empty or malformed', () => {
    expect(getEffectiveResultCategory('bug', '')).toBeUndefined();
    expect(getEffectiveResultCategory('bug', 'not-a-category')).toBeUndefined();
  });

  it('normalizes a valid feedback override', () => {
    expect(getEffectiveResultCategory('bug', ' Environment ')).toBe('infra');
  });
});
