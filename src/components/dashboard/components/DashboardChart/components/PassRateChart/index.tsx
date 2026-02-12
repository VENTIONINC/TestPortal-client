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
  { date: 'Dec 8', passed: 9, failed: 1 },
  { date: 'Dec 9', passed: 8, failed: 2 },
  { date: 'Dec 10', passed: 7, failed: 3 },
  { date: 'Dec 11', passed: 6, failed: 4 },
  { date: 'Dec 12', passed: 5, failed: 5 },
  { date: 'Dec 13', passed: 4, failed: 6 },
  { date: 'Dec 14', passed: 3, failed: 7 },
];

export const PassRateChart = () => {
  const [view, setView] = useState<BarChartView>('multiple');
  const [valueMode, setValueMode] = useState<BarChartValueMode>('count');
  const series: CategorySeries[] = [
    { name: 'passed', label: 'passed', color: 'dashboard.green' },
    { name: 'failed', label: 'failed', color: 'dashboard.red' },
  ];

  return (
    <MetricsBarChart
      title="Pass rate"
      data={mockData}
      series={series}
      view={view}
      onViewChange={setView}
      valueMode={valueMode}
      onValueModeChange={setValueMode}
      stackedBarSize={52}
      multipleBarSize={10}
      yDomain={[0, 50]}
    />
  );
};
