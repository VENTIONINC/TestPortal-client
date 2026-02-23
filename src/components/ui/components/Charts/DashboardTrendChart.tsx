import { Flex } from '@chakra-ui/react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { format, parseISO } from 'date-fns';

import { DashboardResponse } from '@/redux/apis/generatedApi';

interface DashboardTrendChartProps {
  data: DashboardResponse['history'];
}

export const DashboardTrendChart = ({ data }: DashboardTrendChartProps) => {
  const chartData = data.map((item) => ({
    date: item.date,
    passRate: item.metrics.total > 0 ? Number(((item.metrics.passed / item.metrics.total) * 100).toFixed(1)) : 0,
  }));

  return (
    <Flex h="300px" w="100%" bg="white" p={4} borderRadius="md" boxShadow="sm" borderWidth="1px" borderColor="gray.200">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => format(parseISO(value), 'MMM d')}
            style={{ fontSize: 12 }}
            stroke="#718096"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            unit="%"
            style={{ fontSize: 12 }}
            stroke="#718096"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number | undefined) => (value !== undefined ? [`${value}%`, 'Pass Rate'] : null)}
            labelFormatter={(label) => format(parseISO(label), 'MMM d, yyyy')}
            contentStyle={{
              borderRadius: '4px',
              border: 'none',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            }}
          />
          <Line
            type="monotone"
            dataKey="passRate"
            stroke="#3182ce"
            strokeWidth={3}
            dot={{ r: 3, stroke: '#3182ce', strokeWidth: 2, fill: 'white' }}
            activeDot={{ r: 6, stroke: '#3182ce', strokeWidth: 2, fill: '#ebf8ff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Flex>
  );
};
