// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { expect, test } from 'vitest';

import {
  aggregateDashboardStatusMetrics,
  mapDashboardStatusChartData,
  normalizeDashboardStatusMetrics,
} from './statusMetrics.js';

test('normalizeDashboardStatusMetrics preserves explicit mixed-status counts', () => {
  const metrics = normalizeDashboardStatusMetrics({
    total: 6100,
    passed: 3055,
    failed: 3040,
    skipped: 2,
    timedOut: 3,
  });

  expect(metrics).toEqual({
    total: 6100,
    passed: 3055,
    failed: 3040,
    skipped: 2,
    timedOut: 3,
  });
});

test('aggregateDashboardStatusMetrics uses explicit history buckets for summary widgets', () => {
  const metrics = aggregateDashboardStatusMetrics([
    {
      date: '2026-07-01',
      metrics: { total: 6100, passed: 3055, failed: 3040, skipped: 2, timedOut: 3 },
    },
  ]);

  expect(metrics.total).toBe(6100);
  expect(metrics.passed).toBe(3055);
  expect(metrics.failed).toBe(3040);
  expect(metrics.skipped).toBe(2);
  expect(metrics.timedOut).toBe(3);
});

test('mapDashboardStatusChartData keeps failed distinct from skipped and timedOut', () => {
  const mapped = mapDashboardStatusChartData([
    {
      date: '2026-07-01',
      metrics: { total: 6100, passed: 3055, failed: 3040, skipped: 2, timedOut: 3 },
    },
  ]);

  expect(mapped.chartData).toEqual([
    {
      date: '2026-07-01',
      total: 6100,
      passed: 3055,
      failed: 3040,
      skipped: 2,
      timedOut: 3,
    },
  ]);
  expect(mapped.maxValue).toBe(3055);
});
