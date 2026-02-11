import { Box } from '@chakra-ui/react';
import { useChart } from '@chakra-ui/charts';

import { TestDescriptionData, TestDescriptionProps } from '../../types';
import { Stats, DonutChart, QualityChart } from './components';

const mockData: TestDescriptionData = {
  title: 'Test runs',
  stats: [
    { label: 'Test runs', value: 68, status: 'runs' },
    { label: 'Test passed', value: 50, status: 'passed' },
    { label: 'Test failed', value: 18, status: 'failed' },
  ],
  totalRuns: 68,
  passRate: 73,
  passRateDelta: 3,
};

export const TestDescription = ({ data = mockData }: TestDescriptionProps) => {
  const passed = data.stats.find((stat) => stat.status === 'passed')?.value ?? 0;
  const failed = data.stats.find((stat) => stat.status === 'failed')?.value ?? 0;
  const donutData = [
    { name: 'passed', value: passed, color: 'green.400' },
    { name: 'failed', value: failed, color: 'orange.400' },
  ];
  const donutChart = useChart({
    data: donutData,
    series: donutData.map((item) => ({ name: item.name, color: item.color })),
  });
  const qualitySegments = 24;
  const filledSegments = Math.round((data.passRate / 100) * qualitySegments);
  const qualityData = Array.from({ length: qualitySegments }, (_, index) => ({
    name: `segment-${index + 1}`,
    value: 1,
    color: index < filledSegments ? 'blue.500' : 'gray.600',
  }));
  const qualityChart = useChart({
    data: qualityData,
    series: qualityData.map((item) => ({ name: item.name, color: item.color })),
  });

  return (
    <Box>
      <Stats stats={data.stats} />
      <DonutChart data={data} title={data.title} passed={passed} failed={failed} donutChart={donutChart} />

      <QualityChart qualityChart={qualityChart} data={data} />
    </Box>
  );
};
