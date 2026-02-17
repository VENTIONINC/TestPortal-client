import { useState, useMemo } from 'react';

import { useColorModeValue } from '@/components/ui';
import {
  BarChartView,
  BarChartValueMode,
  CategorySeries,
  CategoriesChartDatum,
  MetricsBarChart,
} from '@/components/ui/components/Charts/MetricsBarChart';

const mockData: CategoriesChartDatum[] = [
  { date: 'nighty 1', passed: 500, failed: 200, skipped: 50 },
  { date: 'nighty 2', passed: 480, failed: 210, skipped: 40 },
  { date: 'nighty 3', passed: 470, failed: 220, skipped: 30 },
  { date: 'nighty 4', passed: 460, failed: 230, skipped: 100 },
  { date: 'nighty 5', passed: 450, failed: 240, skipped: 200 },
  { date: 'nighty 6', passed: 440, failed: 250, skipped: 50 },
  { date: 'nighty 7', passed: 430, failed: 260, skipped: 100 },
];

export const HistoryRegressionRunChart = ({ data }) => {
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

          acc.chartData.push({ date, passed, failed, skipped });
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
