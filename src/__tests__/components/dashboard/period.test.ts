// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { getDashboardDateRange } from '@/components/dashboard/utils/period';

describe('getDashboardDateRange', () => {
  it('uses the UTC calendar day for Today', () => {
    expect(getDashboardDateRange('1', new Date('2026-08-06T22:30:00.000Z'))).toEqual({
      dateFrom: '2026-08-06',
      dateTo: '2026-08-06',
    });
  });

  it('uses the preceding UTC calendar day for Yesterday', () => {
    expect(getDashboardDateRange('yesterday', new Date('2026-08-06T22:30:00.000Z'))).toEqual({
      dateFrom: '2026-08-05',
      dateTo: '2026-08-05',
    });
  });
});
