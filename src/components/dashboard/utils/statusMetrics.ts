// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

export interface DashboardStatusMetrics {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  timedOut: number;
}

export interface DashboardStatusHistoryEntry {
  date: string;
  metrics?: Partial<DashboardStatusMetrics> | null;
}

export interface DashboardSummaryFallback {
  totalRuns?: number | null;
  failures?: number | null;
}

export interface DashboardStatusChartDatum extends DashboardStatusMetrics {
  date: string;
}

const toCount = (value: number | null | undefined) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

export const emptyDashboardStatusMetrics = (): DashboardStatusMetrics => ({
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  timedOut: 0,
});

export const normalizeDashboardStatusMetrics = (
  metrics?: Partial<DashboardStatusMetrics> | null,
): DashboardStatusMetrics => {
  const passed = toCount(metrics?.passed);
  const failed = toCount(metrics?.failed);
  const skipped = toCount(metrics?.skipped);
  const timedOut = toCount(metrics?.timedOut);
  const total = toCount(metrics?.total) || passed + failed + skipped + timedOut;

  return { total, passed, failed, skipped, timedOut };
};

export const aggregateDashboardStatusMetrics = (
  history?: DashboardStatusHistoryEntry[] | null,
  summary?: DashboardSummaryFallback | null,
): DashboardStatusMetrics => {
  if (history?.length) {
    return history.reduce<DashboardStatusMetrics>((acc, entry) => {
      const metrics = normalizeDashboardStatusMetrics(entry.metrics);

      acc.total += metrics.total;
      acc.passed += metrics.passed;
      acc.failed += metrics.failed;
      acc.skipped += metrics.skipped;
      acc.timedOut += metrics.timedOut;

      return acc;
    }, emptyDashboardStatusMetrics());
  }

  const total = toCount(summary?.totalRuns);
  const failed = toCount(summary?.failures);

  return {
    total,
    passed: Math.max(total - failed, 0),
    failed,
    skipped: 0,
    timedOut: 0,
  };
};

export const mapDashboardStatusChartData = (history?: DashboardStatusHistoryEntry[] | null) =>
  (history ?? []).reduce(
    (acc, entry) => {
      const metrics = normalizeDashboardStatusMetrics(entry.metrics);

      acc.chartData.push({
        date: entry.date,
        ...metrics,
      });
      acc.maxValue = Math.max(acc.maxValue, metrics.passed, metrics.failed, metrics.skipped, metrics.timedOut);

      return acc;
    },
    { chartData: [] as DashboardStatusChartDatum[], maxValue: 0 },
  );
