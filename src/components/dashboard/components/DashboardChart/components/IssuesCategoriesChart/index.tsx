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
  { date: 'Dec 8', bug: 1, environment: 2, script: 4, performance: 1 },
  { date: 'Dec 9', bug: 10, environment: 7, script: 8, performance: 2 },
  { date: 'Dec 10', bug: 11, environment: 10, script: 20, performance: 8 },
  { date: 'Dec 11', bug: 21, environment: 14, script: 21, performance: 10 },
  { date: 'Dec 12', bug: 22, environment: 18, script: 28, performance: 13 },
  { date: 'Dec 13', bug: 28, environment: 30, script: 40, performance: 26 },
  { date: 'Dec 14', bug: 37, environment: 34, script: 43, performance: 30 },
];

export const IssuesCategoriesChart = () => {
  const [view, setView] = useState<BarChartView>('multiple');
  const [valueMode, setValueMode] = useState<BarChartValueMode>('count');
  const series: CategorySeries[] = [
    { name: 'bug', label: 'bug', color: 'dashboard.purple' },
    { name: 'environment', label: 'environment', color: 'dashboard.pink' },
    { name: 'script', label: 'script', color: 'dashboard.yellow' },
    { name: 'performance', label: 'performance', color: 'dashboard.blue' },
  ];

  return (
    <MetricsBarChart
      title="Issues categories"
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
