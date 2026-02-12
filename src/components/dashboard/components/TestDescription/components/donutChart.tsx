import { Box, Card, HStack, Text, VStack } from '@chakra-ui/react';
import { Chart } from '@chakra-ui/charts';
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 7}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};

interface DonutChartProps {
  title: string;
  passed: number;
  failed: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  donutChart: any;
  data: {
    totalRuns: number;
  };
}

export const DonutChart = ({ title, passed, failed, donutChart, data }: DonutChartProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeIndex = donutChart.data.findIndex((item: any) => item.name === 'passed');

  return (
    <Card.Root borderRadius="lg">
      <Card.Body>
        <VStack gap={4} align="center">
          <Text fontWeight="semibold" mt="2px" mb={5}>
            {title}
          </Text>
          <Box position="relative" w="190px" h="190px">
            <ResponsiveContainer width="100%" height="100%">
              <Chart.Root chart={donutChart}>
                <PieChart>
                  <Pie
                    data={donutChart.data}
                    dataKey="value"
                    innerRadius={62}
                    outerRadius={86}
                    startAngle={90}
                    endAngle={-270}
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    stroke="none"
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {donutChart.series.map((item: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={donutChart.color(item.color)} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip cursor={false} content={<Chart.Tooltip />} wrapperStyle={{ zIndex: 10 }} />
                </PieChart>
              </Chart.Root>
            </ResponsiveContainer>
            <Box
              position="absolute"
              inset={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              pointerEvents="none"
            >
              <VStack gap={0}>
                <Text fontSize="xs" color="fg.muted">
                  Total
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {data.totalRuns}
                </Text>
              </VStack>
            </Box>
          </Box>
          <HStack gap={6} fontSize="sm" color="fg.muted" mt={4}>
            <HStack>
              <Box w="2" h="2" bg="green.400" borderRadius="xs" />
              <Text>passed {passed}</Text>
            </HStack>
            <HStack>
              <Box w="2" h="2" bg="orange.400" borderRadius="xs" />
              <Text>failed {failed}</Text>
            </HStack>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
