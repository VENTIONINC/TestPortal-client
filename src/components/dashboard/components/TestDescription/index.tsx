// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Box, Flex, SimpleGrid } from '@chakra-ui/react';
import { useChart } from '@chakra-ui/charts';
import { PiDotsNineBold } from 'react-icons/pi';
import { FaCircleCheck, FaRegCircleXmark } from 'react-icons/fa6';

import { TestDescriptionProps } from '../../types';
import { Stats, DonutChart, QualityChart } from './components';

export const TestDescription = ({ summary, isGrid }: TestDescriptionProps) => {
  const { totalRuns = 0, passRate } = summary || {};

  const passed = passRate ?? 0;
  const failed = totalRuns && passRate ? totalRuns - passRate : 0;
  const stats = [
    { label: 'Test runs', value: totalRuns, status: 'runs' as const, icon: PiDotsNineBold, color: 'dashboard.base' },
    { label: 'Test passed', value: passed, status: 'passed' as const, icon: FaCircleCheck, color: 'dashboard.green' },
    { label: 'Test failed', value: failed, status: 'failed' as const, icon: FaRegCircleXmark, color: 'dashboard.red' },
  ];

  const donutData = [
    { name: 'passed', value: passed, color: 'dashboard.green' },
    { name: 'failed', value: failed, color: 'dashboard.red' },
  ];
  const donutChart = useChart({
    data: donutData,
    series: donutData.map((item) => ({ color: item.color })),
  });
  const qualitySegments = 24;
  const filledSegments = Math.round((passed / 100) * qualitySegments);
  const qualityData = Array.from({ length: qualitySegments }, (_, index) => ({
    name: `segment-${index + 1}`,
    value: 1,
    color: index < filledSegments ? 'dashboard.green' : 'dashboard.gray',
  }));
  const qualityChart = useChart({
    data: qualityData,
    series: qualityData.map((item) => ({ color: item.color })),
  });

  const mockDataPast = {
    passRate: 73,
    passRateDelta: 3,
  };
  if (isGrid) {
    return (
      <Flex direction="column" gap={3} w="full">
        <Stats stats={stats} columns={3} />
        <SimpleGrid columns={{ base: 1, xl: 2 }} gap={3} w="full">
          <DonutChart title="Test runs" passed={passed} failed={failed} donutChart={donutChart} totalRuns={totalRuns} />
          <QualityChart qualityChart={qualityChart} data={mockDataPast} w="full" />
        </SimpleGrid>
      </Flex>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Stats stats={stats} />
      <DonutChart title="Test runs" passed={passed} failed={failed} donutChart={donutChart} totalRuns={totalRuns} />
      <QualityChart qualityChart={qualityChart} data={mockDataPast} />
    </Box>
  );
};
