import { Box, Card, HStack, SimpleGrid, Tag, Text, VStack } from '@chakra-ui/react';
import { Chart, useChart } from '@chakra-ui/charts';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export const DonutChart = ({ title, passed, failed, donutChart, data }) => (
  <Card.Root p={4} borderRadius="lg">
    <Card.Body>
      <VStack gap={4} align="center">
        <Text fontWeight="semibold">{title}</Text>
        <Box position="relative" w="160px" h="160px">
          <ResponsiveContainer width="100%" height="100%">
            <Chart.Root chart={donutChart}>
              <PieChart>
                <Pie
                  data={donutChart.data}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  stroke="none"
                >
                  {donutChart.series.map((item) => (
                    <Cell key={item.name} fill={donutChart.color(item.color)} />
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
            <VStack spacing={0}>
              <Text fontSize="xs" color="fg.muted">
                Total
              </Text>
              <Text fontSize="3xl" fontWeight="bold">
                {data.totalRuns}
              </Text>
            </VStack>
          </Box>
        </Box>
        <HStack gap={6} fontSize="sm" color="fg.muted">
          <HStack>
            <Box w="8px" h="8px" bg="green.400" borderRadius="sm" />
            <Text>passed {passed}</Text>
          </HStack>
          <HStack>
            <Box w="8px" h="8px" bg="orange.400" borderRadius="sm" />
            <Text>failed {failed}</Text>
          </HStack>
        </HStack>
      </VStack>
    </Card.Body>
  </Card.Root>
);
