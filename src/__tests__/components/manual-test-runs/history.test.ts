// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import {
  calendarDateToManualTestRunBoundary,
  getManualTestRunHistoryDateError,
} from '@/components/manual-test-runs/utils/history';

describe('manual test run history date filters', () => {
  it('serializes either boundary independently as an explicit RFC 3339 timestamp', () => {
    expect(calendarDateToManualTestRunBoundary('2026-09-18', 'from')).toMatch(/T.*Z$/);
    expect(calendarDateToManualTestRunBoundary('2026-09-18', 'before')).toMatch(/T.*Z$/);
  });

  it('uses the next local calendar midnight for the inclusive end date', () => {
    const start = calendarDateToManualTestRunBoundary('2026-09-18', 'from');
    const before = calendarDateToManualTestRunBoundary('2026-09-18', 'before');
    expect(start).toBeDefined();
    expect(before).toBeDefined();
    expect(new Date(before!).getTime()).toBeGreaterThan(new Date(start!).getTime());
  });

  it('handles a daylight-saving transition as a local calendar boundary', () => {
    const previousTimezone = process.env.TZ;
    process.env.TZ = 'America/New_York';
    try {
      const start = calendarDateToManualTestRunBoundary('2026-11-01', 'from');
      const before = calendarDateToManualTestRunBoundary('2026-11-01', 'before');
      expect(new Date(before!).getTime() - new Date(start!).getTime()).toBe(25 * 60 * 60 * 1000);
    } finally {
      if (previousTimezone === undefined) delete process.env.TZ;
      else process.env.TZ = previousTimezone;
    }
  });

  it('rejects invalid and reversed calendar ranges before submitting', () => {
    expect(getManualTestRunHistoryDateError({ startedOnOrAfter: '2026-02-30', startedOnOrBefore: '' })).toBe('The start date is invalid.');
    expect(getManualTestRunHistoryDateError({ startedOnOrAfter: '2026-09-19', startedOnOrBefore: '2026-09-18' })).toBe('The start date must be on or before the end date.');
    expect(getManualTestRunHistoryDateError({ startedOnOrAfter: '', startedOnOrBefore: '2026-09-18' })).toBeUndefined();
  });
});
