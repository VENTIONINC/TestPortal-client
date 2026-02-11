import { Box, Card, HStack, SimpleGrid, Tag, Text, VStack } from '@chakra-ui/react';
import { Chart, useChart } from '@chakra-ui/charts';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export const QualityChart = ({ qualityChart, data }) => (
  <Card.Root p={4} borderRadius="lg">
    <Card.Body>
      <HStack justify="space-between" mb={3}>
        <Text fontWeight="semibold">Quality overtime</Text>
      </HStack>
      <Box position="relative" w="326px" h="126px">
        <ResponsiveContainer width="100%" height="100%">
          <Chart.Root chart={qualityChart}>
            <PieChart>
              <Pie
                data={qualityChart.data}
                dataKey="value"
                innerRadius={44}
                outerRadius={60}
                startAngle={180}
                endAngle={0}
                paddingAngle={3}
                cornerRadius={8}
                stroke="none"
              >
                {qualityChart.series.map((item) => (
                  <Cell key={item.name} fill={qualityChart.color(item.color)} />
                ))}
              </Pie>
              <Tooltip cursor={false} content={<Chart.Tooltip />} wrapperStyle={{ zIndex: 10 }} />
            </PieChart>
          </Chart.Root>
        </ResponsiveContainer>
        <Box
          position="absolute"
          insetX={0}
          bottom={2}
          display="flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="none"
        >
          <Text fontSize="2xl" fontWeight="bold">
            {data.passRate}%
            <Tag.Root size="sm">
              <Tag.Label>+{data.passRateDelta}%</Tag.Label>
            </Tag.Root>
          </Text>
        </Box>
      </Box>
    </Card.Body>
  </Card.Root>
);
