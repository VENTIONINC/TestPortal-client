// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import test from 'node:test';
import assert from 'node:assert/strict';

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

  assert.deepEqual(metrics, {
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

  assert.equal(metrics.total, 6100);
  assert.equal(metrics.passed, 3055);
  assert.equal(metrics.failed, 3040);
  assert.equal(metrics.skipped, 2);
  assert.equal(metrics.timedOut, 3);
});

test('mapDashboardStatusChartData keeps failed distinct from skipped and timedOut', () => {
  const mapped = mapDashboardStatusChartData([
    {
      date: '2026-07-01',
      metrics: { total: 6100, passed: 3055, failed: 3040, skipped: 2, timedOut: 3 },
    },
  ]);

  assert.deepEqual(mapped.chartData, [
    {
      date: '2026-07-01',
      total: 6100,
      passed: 3055,
      failed: 3040,
      skipped: 2,
      timedOut: 3,
    },
  ]);
  assert.equal(mapped.maxValue, 3055);
});
