import { useState } from 'react';

import { useColorModeValue } from '@/components/ui';
import {
  BarChartView,
  BarChartValueMode,
  CategorySeries,
  CategoriesChartDatum,
  MetricsBarChart,
} from '@/components/charts/MetricsBarChart';

const mockData: CategoriesChartDatum[] = [
  { date: 'nighty 1', passed: 500, failed: 200, skipped: 50 },
  { date: 'nighty 2', passed: 480, failed: 210, skipped: 40 },
  { date: 'nighty 3', passed: 470, failed: 220, skipped: 30 },
  { date: 'nighty 4', passed: 460, failed: 230, skipped: 100 },
  { date: 'nighty 5', passed: 450, failed: 240, skipped: 200 },
  { date: 'nighty 6', passed: 440, failed: 250, skipped: 50 },
  { date: 'nighty 7', passed: 430, failed: 260, skipped: 100 },
];

export const HistoryRegressionRunChart = () => {
  const [view, setView] = useState<BarChartView>('multiple');
  const [valueMode, setValueMode] = useState<BarChartValueMode>('count');
  const series: CategorySeries[] = [
    { name: 'passed', label: 'passed', color: 'dashboard.green' },
    { name: 'failed', label: 'failed', color: 'dashboard.red' },
    { name: 'skipped', label: 'skipped', color: 'dashboard.gray' },
  ];

  return (
    <MetricsBarChart
      data={mockData}
      series={series}
      view={view}
      showValueToggle={true}
      onViewChange={setView}
      valueMode={valueMode}
      onValueModeChange={setValueMode}
      stackedBarSize={52}
      multipleBarSize={10}
      yDomain={[0, 700]}
    />
  );
};
