// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { useState, useMemo } from 'react';

import { formatChartLabel } from '@/utils/dateUtils';
import { MetricsBarChart } from '@/components/ui/components/Charts/MetricsBarChart';
import { BarChartView, BarChartValueMode, CategorySeries, CategoriesChartDatum } from '@/types/charts';

export const HistoryRegressionRunChart = ({
  data,
}: {
  data: { date: string; metrics: { passed: number; total: number; skipped: number } }[];
}) => {
  const [view, setView] = useState<BarChartView>('multiple');
  const [valueMode, setValueMode] = useState<BarChartValueMode>('count');
  const series: CategorySeries[] = [
    { name: 'passed', label: 'passed', color: 'dashboard.green' },
    { name: 'failed', label: 'failed', color: 'dashboard.red' },
    { name: 'skipped', label: 'skipped', color: 'dashboard.gray' },
  ];

  const { chartData: mapToDataToChart, maxValue } = useMemo(
    () =>
      (data ?? []).reduce(
        (acc, { date, metrics }) => {
          const passed = metrics?.passed ?? 0;
          const total = metrics?.total ?? 0;
          const skipped = metrics.skipped ?? 0;
          const failed = total - passed - skipped;

          acc.chartData.push({ date: formatChartLabel(date), passed, failed, skipped });
          acc.maxValue = Math.max(acc.maxValue, passed, failed, skipped);

          return acc;
        },
        { chartData: [] as CategoriesChartDatum[], maxValue: 0 },
      ),
    [data],
  );

  return (
    <MetricsBarChart
      title="History of regression run (API+UI)"
      data={mapToDataToChart}
      series={series}
      view={view}
      showValueToggle={true}
      onViewChange={setView}
      valueMode={valueMode}
      onValueModeChange={setValueMode}
      stackedBarSize={52}
      multipleBarSize={10}
      yDomain={[0, maxValue]}
    />
  );
};
