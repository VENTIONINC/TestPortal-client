// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { getTestScenarioPatchPayload } from '@/components/test-scenarios/utils';

const persisted = { title: 'Checkout', contentMd: '# Checkout\n\nExact source\n' };
const persistedWithDetails = { ...persisted, details: 'Existing details' };

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
    expect(getTestScenarioPatchPayload({ title: 'Updated', contentMd: 'Updated source' }, persisted)).toEqual({
      title: 'Updated',
      contentMd: 'Updated source',
    });
  });

  it('returns only normalized details for a details-only change', () => {
    expect(
      getTestScenarioPatchPayload(
        { ...persistedWithDetails, details: '  Updated details\n  with indentation  ' },
        persistedWithDetails,
      ),
    ).toEqual({ details: 'Updated details\n  with indentation' });
  });

  it('returns null when details differ only by outer whitespace', () => {
    expect(
      getTestScenarioPatchPayload({ ...persistedWithDetails, details: '  Existing details  ' }, persistedWithDetails),
    ).toBeNull();
  });

  it('sends null when existing details are cleared', () => {
    expect(getTestScenarioPatchPayload({ ...persistedWithDetails, details: ' \n\t ' }, persistedWithDetails)).toEqual({
      details: null,
    });
  });

  it('treats blank input as a no-op when persisted details are already null', () => {
    expect(getTestScenarioPatchPayload({ ...persisted, details: '  ' }, { ...persisted, details: null })).toBeNull();
  });

  it('combines normalized details with title and byte-for-byte Markdown changes', () => {
    const contentMd = '  # Updated  \n\n\tExact source\n';

    expect(
      getTestScenarioPatchPayload(
        { title: 'Updated', contentMd, details: '  Updated details  ' },
        persistedWithDetails,
      ),
    ).toEqual({ title: 'Updated', contentMd, details: 'Updated details' });
  });

  it('returns null for a no-op save', () => {
    expect(getTestScenarioPatchPayload(persisted, persisted)).toBeNull();
  });
});
