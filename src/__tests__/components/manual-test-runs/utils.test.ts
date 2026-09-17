// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import type { ManualTestRunStepRead } from '@/redux/apis/generatedApi';
import {
  getManualTestRunNotePatchPayload,
  getManualTestRunStepDrafts,
  getManualTestRunStepPatchPayload,
  isManualTestRunPassedEligible,
} from '@/components/manual-test-runs';

const step = (status: ManualTestRunStepRead['status'], notes: string | null = null) => ({
  id: 'step-1',
  position: 0,
  action: 'Open checkout',
  expectedResult: 'Checkout opens',
  status,
  notes,
  updatedAt: '2026-09-17T10:00:00.000Z',
});

describe('manual test run payload helpers', () => {
  it('omits unchanged normalized run notes and preserves interior newlines', () => {
    expect(getManualTestRunNotePatchPayload('  saved\ntext  ', 'saved\ntext')).toBeNull();
    expect(getManualTestRunNotePatchPayload('  first\n\nsecond  ', null)).toEqual({ notes: 'first\n\nsecond' });
  });

  it('uses null to clear a persisted note and never submits blank strings', () => {
    expect(getManualTestRunNotePatchPayload('   ', 'previous')).toEqual({ notes: null });
    expect(getManualTestRunNotePatchPayload(' \n\t ', null)).toBeNull();
  });

  it('includes only changed step status/notes and supports note clearing', () => {
    const saved = step('not_started', 'old note');
    expect(getManualTestRunStepPatchPayload({ status: 'not_started', notes: 'old note' }, saved)).toBeNull();
    expect(getManualTestRunStepPatchPayload({ status: 'passed', notes: '  new\nresult ' }, saved)).toEqual({
      status: 'passed',
      notes: 'new\nresult',
    });
    expect(getManualTestRunStepPatchPayload({ status: 'not_started', notes: '  ' }, saved)).toEqual({ notes: null });
  });

  it('initializes drafts from persisted step values without copying immutable content', () => {
    expect(getManualTestRunStepDrafts([step('skipped', 'saved')])).toEqual({
      'step-1': { status: 'skipped', notes: 'saved' },
    });
  });
});

describe('manual test run passed eligibility', () => {
  it.each([
    { name: 'zero steps', steps: [], eligible: true },
    { name: 'one passed step', steps: [{ status: 'passed' as const }], eligible: true },
    { name: 'passed and skipped steps', steps: [{ status: 'passed' as const }, { status: 'skipped' as const }], eligible: true },
    { name: 'all skipped steps', steps: [{ status: 'skipped' as const }], eligible: false },
    { name: 'mixed unresolved steps', steps: [{ status: 'passed' as const }, { status: 'not_started' as const }], eligible: false },
    { name: 'failed step', steps: [{ status: 'passed' as const }, { status: 'failed' as const }], eligible: false },
  ])('$name eligibility is $eligible', ({ steps, eligible }) => {
    expect(isManualTestRunPassedEligible(steps)).toBe(eligible);
  });
});
