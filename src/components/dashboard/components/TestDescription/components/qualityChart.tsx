// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Card, HStack, Text } from '@chakra-ui/react';
import { Chart } from '@chakra-ui/charts';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

interface ChartDataEntry {
  name: string;
  value: number;
  isActive: boolean;
}

interface QualityChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  qualityChart: any;
  data: {
    passRate: number;
    passRateDelta: number;
  };
}

export const QualityChart = ({
  qualityChart,
  data,
  ...props
}: QualityChartProps & import('@chakra-ui/react').CardRootProps) => {
  const chartData: ChartDataEntry[] = Array.from({ length: 22 }, (_, index) => ({
    name: `Segment ${index}`,
    value: 1,
    isActive: index < Math.round(((data.passRate || 0) / 100) * 22),
  }));

  return (
    <Card.Root borderRadius="lg" px="40px" w="362px" {...props}>
      <Card.Body>
        <HStack justify="space-between" mb="17px" mt={2} justifyContent="center">
          <Text fontWeight="semibold">Quality overtime</Text>
        </HStack>
        <Box position="relative" w="100%" h="170px" mx="auto">
          <ResponsiveContainer width="100%" height="100%">
            <Chart.Root chart={qualityChart}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={100}
                  outerRadius={160}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={7}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isActive ? '#3054FE' : '#3D3D3F'} />
                  ))}
                </Pie>
              </PieChart>
            </Chart.Root>
          </ResponsiveContainer>
          <Box
            position="absolute"
            insetX={0}
            bottom={4}
            left={3}
            display="flex"
            alignItems="center"
            justifyContent="center"
            pointerEvents="none"
          >
            <HStack align="center">
              <Text fontSize="3xl" fontWeight="bold">
                {data.passRate}%
              </Text>
              <Box
                ml="-5px"
                fontSize="xs"
                bg="status.success.bg"
                color="status.success.text"
                borderRadius="full"
                px={2}
                py={1}
              >
                +{data.passRateDelta}%
              </Box>
            </HStack>
          </Box>
        </Box>
      </Card.Body>
    </Card.Root>
  );
};
