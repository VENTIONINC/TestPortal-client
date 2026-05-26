import { useMemo, useState } from 'react';

import { formatChartLabel } from '@/utils/dateUtils';
import { MetricsBarChart } from '@/components/ui/components/Charts/MetricsBarChart';
import { BarChartView, BarChartValueMode, CategorySeries, CategoriesChartDatum } from '@/types/charts';

export const PassRateChart = ({
  data,
}: {
  data: { date: string; metrics: { passed: number; failed: number } }[];
}) => {
  const [view, setView] = useState<BarChartView>('multiple');
  const [valueMode, setValueMode] = useState<BarChartValueMode>('count');
  const series: CategorySeries[] = [
    { name: 'passed', label: 'passed', color: 'dashboard.green' },
    { name: 'failed', label: 'failed', color: 'dashboard.red' },
  ];
  const { chartData: mapToDataToChart, maxValue } = useMemo(
    () =>
      (data ?? []).reduce(
        (acc, { date, metrics }) => {
          const passed = metrics?.passed ?? 0;
          const failed = metrics?.failed ?? 0;

          acc.chartData.push({ date: formatChartLabel(date), passed, failed });
          acc.maxValue = Math.max(acc.maxValue, passed, failed);

          return acc;
        },
        { chartData: [] as CategoriesChartDatum[], maxValue: 0 },
      ),
    [data],
  );

  return (
    <MetricsBarChart
      title="Pass rate"
      data={mapToDataToChart}
      series={series}
      view={view}
      onViewChange={setView}
      valueMode={valueMode}
      onValueModeChange={setValueMode}
      stackedBarSize={52}
      multipleBarSize={10}
      yDomain={[0, maxValue]}
    />
  );
};
