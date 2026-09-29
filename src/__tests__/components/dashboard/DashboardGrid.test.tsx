// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { WIDGET_DESCRIPTIONS } from '@/components/dashboard/containers/DashboardGrid';

describe('WIDGET_DESCRIPTIONS', () => {
  it('defines help text for all six dashboard widgets', () => {
    expect(Object.keys(WIDGET_DESCRIPTIONS)).toHaveLength(6);
    expect(WIDGET_DESCRIPTIONS.statistics).toMatch(/total test runs/i);
    expect(WIDGET_DESCRIPTIONS.productQuality).toMatch(/80%/);
    expect(WIDGET_DESCRIPTIONS.testRuns).toMatch(/donut chart/i);
    expect(WIDGET_DESCRIPTIONS.passRate).toMatch(/percentage view/i);
    expect(WIDGET_DESCRIPTIONS.issuesCategories).toMatch(/issue category/i);
    expect(WIDGET_DESCRIPTIONS.historyRegressionRuns).toMatch(/time bucket/i);
  });
});
