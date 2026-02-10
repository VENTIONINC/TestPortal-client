import { memo, useId } from 'react';
import { Flex } from '@chakra-ui/react';
import { Chart, useChart } from '@chakra-ui/charts';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';

import { IssueTimeDistribution } from '@/types';

interface IssueTimeDiscributionChartProps {
  data: IssueTimeDistribution[];
  color: string;
}

export const IssueTimeDiscributionChart = memo(({ data, color }: IssueTimeDiscributionChartProps) => {
  const chart = useChart({ data, series: [{ name: 'count', color }] });
  const gradientBaseId = useId();

  return (
    <Flex
      w="100%"
      h="100%"
      minW={0}
      sx={{
        '.recharts-wrapper': {
          minWidth: 0,
          maxWidth: '100%',
        },
        '.recharts-responsive-container': {
          minWidth: 0,
          maxWidth: '100%',
        },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <Chart.Root chart={chart}>
          <ComposedChart data={chart.data} margin={{ top: 10, bottom: -10, left: -10 }}>
            <defs>
              {chart.series.map((item) => (
                <linearGradient
                  key={item.name}
                  id={`${gradientBaseId}-issueTimeFill-${item.name}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={chart.color(item.color)} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={chart.color(item.color)} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke={chart.color('border')} vertical={false} strokeDasharray="4 4" />
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
              <Area
                key={`${item.name}-area`}
                isAnimationActive={false}
                dataKey={chart.key('count')}
                stroke="none"
                fill={`url(#${gradientBaseId}-issueTimeFill-${item.name})`}
                fillOpacity={1}
                type="monotone"
                dot={false}
                baseValue={0}
              />
            ))}
            {chart.series.map((item) => (
              <Line
                key={item.name}
                isAnimationActive={false}
                dataKey={chart.key('count')}
                stroke={chart.color(item.color)}
                strokeWidth={2}
                type="monotone"
                dot={false}
              />
            ))}
          </ComposedChart>
        </Chart.Root>
      </ResponsiveContainer>
    </Flex>
  );
});
