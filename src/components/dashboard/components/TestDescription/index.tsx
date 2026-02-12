import { Box, Flex, SimpleGrid } from '@chakra-ui/react';
import { useChart } from '@chakra-ui/charts';
import { PiDotsNineBold } from 'react-icons/pi';
import { FaCircleCheck, FaRegCircleXmark } from 'react-icons/fa6';

import { TestDescriptionData, TestDescriptionProps } from '../../types';
import { Stats, DonutChart, QualityChart } from './components';

const mockData: TestDescriptionData = {
  title: 'Test runs',
  stats: [
    { label: 'Test runs', value: 68, status: 'runs', icon: PiDotsNineBold, color: 'dashboard.base' },
    { label: 'Test passed', value: 50, status: 'passed', icon: FaCircleCheck, color: 'dashboard.green' },
    { label: 'Test failed', value: 18, status: 'failed', icon: FaRegCircleXmark, color: 'dashboard.red' },
  ],
  totalRuns: 68,
  passRate: 73,
  passRateDelta: 3,
};

export const TestDescription = ({ data = mockData, isGrid }: TestDescriptionProps) => {
  const passed = data.stats.find((stat) => stat.status === 'passed')?.value ?? 0;
  const failed = data.stats.find((stat) => stat.status === 'failed')?.value ?? 0;
  const donutData = [
    { name: 'passed', value: passed, color: 'dashboard.green' },
    { name: 'failed', value: failed, color: 'dashboard.red' },
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
    color: index < filledSegments ? 'dashboard.green' : 'dashboard.gray',
  }));
  const qualityChart = useChart({
    data: qualityData,
    series: qualityData.map((item) => ({ name: item.name, color: item.color })),
  });

  if (isGrid) {
    return (
      <Flex direction="column" gap={3} w="full">
        <Stats stats={data.stats} columns={3} />
        <SimpleGrid columns={{ base: 1, xl: 2 }} gap={3} w="full">
          <DonutChart data={data} title={data.title} passed={passed} failed={failed} donutChart={donutChart} />
          <QualityChart qualityChart={qualityChart} data={data} w="full" />
        </SimpleGrid>
      </Flex>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Stats stats={data.stats} />
      <DonutChart data={data} title={data.title} passed={passed} failed={failed} donutChart={donutChart} />
      <QualityChart qualityChart={qualityChart} data={data} />
    </Box>
  );
};
