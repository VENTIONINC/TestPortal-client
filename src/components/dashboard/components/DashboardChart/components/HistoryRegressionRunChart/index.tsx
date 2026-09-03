// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState, useMemo } from 'react';

import { mapDashboardStatusChartData } from '@/components/dashboard/utils/statusMetrics';
import { formatChartLabel } from '@/utils/dateUtils';
import { MetricsBarChart } from '@/components/ui/components/Charts/MetricsBarChart';
import { BarChartView, BarChartValueMode, CategorySeries, CategoriesChartDatum } from '@/types/charts';
import { type DashboardResponse } from '@/redux/apis/generatedApi';

export const HistoryRegressionRunChart = ({ data }: { data?: DashboardResponse['history'] }) => {
  const [view, setView] = useState<BarChartView>('multiple');
  const [valueMode, setValueMode] = useState<BarChartValueMode>('count');
  const series: CategorySeries[] = [
    { name: 'passed', label: 'passed', color: 'dashboard.green' },
    { name: 'failed', label: 'failed', color: 'dashboard.red' },
    { name: 'skipped', label: 'skipped', color: 'dashboard.gray' },
    { name: 'timedOut', label: 'timed out', color: 'dashboard.yellow' },
  ];

  const { chartData: mapToDataToChart, maxValue } = useMemo(
    () => {
      const mapped = mapDashboardStatusChartData(data);

      return {
        chartData: mapped.chartData.map(({ date, passed, failed, skipped, timedOut }) => ({
          date: formatChartLabel(date),
          passed,
          failed,
          skipped,
          timedOut,
        })) as CategoriesChartDatum[],
        maxValue: mapped.maxValue,
      };
    },
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
