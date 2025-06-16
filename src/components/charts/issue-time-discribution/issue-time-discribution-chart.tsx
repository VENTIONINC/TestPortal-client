import { Flex } from '@chakra-ui/react';
import { Chart, useChart } from '@chakra-ui/charts';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';

import { IssueTimeDistribution } from '@/types';

interface IssueTimeDiscributionChartProps {
  data: IssueTimeDistribution[];
  color: string;
}

export const IssueTimeDiscributionChart = ({ data, color }: IssueTimeDiscributionChartProps) => {
  const chart = useChart({ data, series: [{ name: 'count', color }] });

  return (
    <Flex minW="30%">
      <ResponsiveContainer>
        <Chart.Root chart={chart}>
          <LineChart data={chart.data} margin={{ top: 10, bottom: -10, left: -10 }}>
            <CartesianGrid stroke={chart.color('border')} vertical={false} />
            <XAxis
              axisLine={false}
              dataKey={chart.key('date')}
              tickFormatter={(value) => format(new Date(value), 'MMM d')}
              stroke={chart.color('border')}
              style={{ fontSize: 10 }}
            />
            <YAxis axisLine={false} tickLine={false} tickMargin={10} stroke={chart.color('border')} fontSize={12} />
            <Tooltip animationDuration={100} cursor={false} content={<Chart.Tooltip />} />
            {chart.series.map((item) => (
              <Line
                key={item.name}
                isAnimationActive={false}
                dataKey={chart.key('count')}
                stroke={chart.color(item.color)}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </Chart.Root>
      </ResponsiveContainer>
    </Flex>
  );
};
