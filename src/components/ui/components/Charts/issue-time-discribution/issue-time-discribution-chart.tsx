import { memo, useId } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Chart, useChart } from '@chakra-ui/charts';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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
      position="relative"
      css={{
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
      <Box position="absolute" inset={0}>
        <ResponsiveContainer width="100%" height="100%">
          <Chart.Root chart={chart}>
            <AreaChart data={chart.data} margin={{ top: 6, right: 6, left: 28, bottom: 0 }}>
              <defs>
                {chart.series.map((item) => (
                  <Chart.Gradient
                    key={item.name}
                    id={`${gradientBaseId}-issueTimeFill-${item.name}`}
                    stops={[
                      { offset: '0%', color: chart.color(item.color), opacity: 0.6 },
                      { offset: '100%', color: chart.color(item.color), opacity: 0.05 },
                    ]}
                  />
                ))}
              </defs>
              <CartesianGrid stroke={chart.color('border.main')} vertical={false} strokeDasharray="4 4" />
              <XAxis
                axisLine={{ stroke: chart.color('border.main') }}
                tickLine={{ stroke: chart.color('border.main') }}
                tickSize={7}
                dataKey={chart.key('date')}
                tickFormatter={(value) => format(new Date(value), 'MMM d')}
                stroke={chart.color('border.main  ')}
                style={{ fontSize: 10 }}
              />
              <YAxis
                axisLine={{ stroke: chart.color('border.main'), strokeDasharray: '4 4' }}
                tickLine={{ stroke: chart.color('border.main'), strokeDasharray: '4 4' }}
                tickMargin={0}
                width={28}
                dx={-28}
                mirror
                stroke={chart.color('border.main')}
                style={{ fontSize: 10 }}
              />
              <Tooltip animationDuration={100} cursor={false} content={<Chart.Tooltip />} />
              {chart.series.map((item) => (
                <Area
                  key={item.name}
                  isAnimationActive={false}
                  dataKey={chart.key('count')}
                  stroke={chart.color(item.color)}
                  strokeWidth={2}
                  fill={`url(#${gradientBaseId}-issueTimeFill-${item.name})`}
                  type="monotone"
                  dot={false}
                  activeDot={false}
                />
              ))}
            </AreaChart>
          </Chart.Root>
        </ResponsiveContainer>
      </Box>
    </Flex>
  );
});
