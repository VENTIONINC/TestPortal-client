// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState } from 'react';

import { formatChartLabel } from '@/utils/dateUtils';
import { MetricsBarChart } from '@/components/ui/components/Charts/MetricsBarChart';
import { BarChartView, BarChartValueMode, CategorySeries, CategoriesChartDatum } from '@/types/charts';

export const IssuesCategoriesChart = ({
  data,
}: {
  data: {
    date: string;
    metrics: { issues: { bug: number; environment: number; script: number; performance: number; other: number } };
  }[];
}) => {
  const [view, setView] = useState<BarChartView>('multiple');
  const [valueMode, setValueMode] = useState<BarChartValueMode>('count');
  const series: CategorySeries[] = [
    { name: 'bug', label: 'bug', color: 'dashboard.purple' },
    { name: 'environment', label: 'environment', color: 'dashboard.pink' },
    { name: 'script', label: 'script', color: 'dashboard.yellow' },
    { name: 'performance', label: 'performance', color: 'dashboard.blue' },
    { name: 'other', label: 'other', color: 'dashboard.gray' },
  ];

  const { chartData: mapToDataToChart, maxValue } = useMemo(
    () =>
      (data ?? []).reduce(
        (acc, { date, metrics: { issues } }) => {
          const bug = issues?.bug ?? 0;
          const environment = issues?.environment ?? 0;
          const script = issues?.script ?? 0;
          const performance = issues?.performance ?? 0;
          const other = issues?.other ?? 0;

          acc.chartData.push({ date: formatChartLabel(date), bug, environment, script, performance, other });
          acc.maxValue = Math.max(acc.maxValue, bug, environment, script, performance, other);

          return acc;
        },
        { chartData: [] as CategoriesChartDatum[], maxValue: 0 },
      ),
    [data],
  );

  return (
    <MetricsBarChart
      title="Issues categories"
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
