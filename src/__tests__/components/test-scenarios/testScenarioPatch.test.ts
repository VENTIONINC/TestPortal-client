// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { getTestScenarioPatchPayload } from '@/components/test-scenarios/utils';

const persisted = { title: 'Checkout', contentMd: '# Checkout\n\nExact source\n' };

describe('Test Scenario PATCH payload helper', () => {
  it('returns only a changed title', () => {
    expect(getTestScenarioPatchPayload({ ...persisted, title: 'Checkout v2' }, persisted)).toEqual({
      title: 'Checkout v2',
    });
  });

  it('returns only changed Markdown without trimming whitespace or line breaks', () => {
    const contentMd = '  # Checkout v2  \n\n\tIndented\n';

    expect(getTestScenarioPatchPayload({ ...persisted, contentMd }, persisted)).toEqual({ contentMd });
  });

  it('returns both changed fields', () => {
    expect(
      getTestScenarioPatchPayload({ title: 'Updated', contentMd: 'Updated source' }, persisted),
    ).toEqual({ title: 'Updated', contentMd: 'Updated source' });
  });

  it('returns null for a no-op save', () => {
    expect(getTestScenarioPatchPayload(persisted, persisted)).toBeNull();
  });
});
