// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Flex, SimpleGrid } from '@chakra-ui/react';
import { useChart } from '@chakra-ui/charts';
import { PiDotsNineBold } from 'react-icons/pi';
import { FaCircleCheck, FaRegCircleXmark } from 'react-icons/fa6';

import { aggregateDashboardStatusMetrics } from '@/components/dashboard/utils/statusMetrics';

import { TestDescriptionProps } from '../../types';
import { Stats, DonutChart, QualityChart } from './components';

export const TestDescription = ({ summary, isGrid }: TestDescriptionProps) => {
  const metrics = aggregateDashboardStatusMetrics(undefined, summary);
  const stats = [
    { label: 'Test runs', value: metrics.total, status: 'runs' as const, icon: PiDotsNineBold, color: 'dashboard.base' },
    { label: 'Test passed', value: metrics.passed, status: 'passed' as const, icon: FaCircleCheck, color: 'dashboard.green' },
    { label: 'Test failed', value: metrics.failed, status: 'failed' as const, icon: FaRegCircleXmark, color: 'dashboard.red' },
  ];

  const donutData = [
    { name: 'passed', value: metrics.passed, color: 'dashboard.green' },
    { name: 'failed', value: metrics.failed, color: 'dashboard.red' },
  ];
  const donutChart = useChart({
    data: donutData,
    series: donutData.map((item) => ({ color: item.color })),
  });
  const qualitySegments = 24;
  const filledSegments = Math.round(((metrics.total ? (metrics.passed / metrics.total) * 100 : 0) / 100) * qualitySegments);
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
          <DonutChart title="Test runs" metrics={metrics} donutChart={donutChart} />
          <QualityChart qualityChart={qualityChart} data={mockDataPast} w="full" />
        </SimpleGrid>
      </Flex>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Stats stats={stats} />
      <DonutChart title="Test runs" metrics={metrics} donutChart={donutChart} />
      <QualityChart qualityChart={qualityChart} data={mockDataPast} />
    </Box>
  );
};
