import { Box, Card, HStack, IconButton, Text } from '@chakra-ui/react';
import { Chart, useChart } from '@chakra-ui/charts';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FiBarChart2, FiLayers } from 'react-icons/fi';

import { useColorModeValue } from '@/components/ui';
import type { CategoriesChartDatum, CategorySeries, MetricsBarChartProps } from '@/types';

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: CategoriesChartDatum }>;
  label?: string;
  series: CategorySeries[];
  bg: string;
  border: string;
  text: string;
};

export const MetricsBarChart = ({
  title = '',
  data,
  series,
  view,
  onViewChange,
  valueMode = 'count',
  onValueModeChange,
  height = 320,
  yDomain,
  stackedBarSize = 52,
  multipleBarSize = 10,
  showLegend = true,
  showToggle = true,
  showValueToggle = true,
}: MetricsBarChartProps) => {
  const tooltipBg = useColorModeValue('white', 'gray.800');
  const tooltipBorder = useColorModeValue('gray.200', 'gray.700');
  const tooltipText = useColorModeValue('gray.900', 'gray.100');
  const normalizedData: CategoriesChartDatum[] = data.map((row) => {
    if (valueMode !== 'percent') {
      return row;
    }

    const total = series.reduce((sum, item) => sum + (Number(row[item.name]) || 0), 0);
    const nextRow = { ...row } as CategoriesChartDatum;

    series.forEach((item) => {
      const rawValue = Number(row[item.name]) || 0;
      nextRow[item.name] = total > 0 ? Number(((rawValue / total) * 100).toFixed(1)) : 0;
    });

    return nextRow;
  });
  const chart = useChart({
    data: normalizedData,
    series: series.map((item) => ({ name: item.name, color: item.color })),
  });
  const resolvedYDomain = valueMode === 'percent' ? [0, 100] : (yDomain ?? [0, 50]);
  const valueSuffix = valueMode === 'percent' ? '%' : '';

  const renderTooltip = ({ active, payload, label, series, bg, border, text }: TooltipProps) => {
    if (!active || !payload?.length) {
      return null;
    }

    const row = payload[0].payload;

    return (
      <Box bg={bg} borderWidth="1px" borderColor={border} borderRadius="md" px={3} py={2} color={text}>
        <Text fontSize="sm" fontWeight="semibold" mb={1}>
          {label}
        </Text>
        <HStack gap={3} flexWrap="wrap">
          {series.map((item) => (
            <HStack key={item.name} gap={2} align="center">
              <Box w="8px" h="8px" borderRadius="sm" bg={item.color} />
              <Text fontSize="sm">{item.label}</Text>
              <Text fontSize="sm" fontWeight="semibold">
                {row[item.name] ?? 0}
                {valueSuffix}
              </Text>
            </HStack>
          ))}
        </HStack>
      </Box>
    );
  };

  return (
    <Card.Root p={4} borderRadius="lg">
      <Card.Body>
        <HStack justify="space-between" align="start" mb={4} gap={4} flexWrap="wrap">
          <Text fontWeight="semibold">{title}</Text>
          <HStack gap={4} flexWrap="wrap" justify="flex-end">
            {showLegend && (
              <HStack gap={4} fontSize="sm" color="fg.muted">
                {series.map((item) => (
                  <HStack key={item.name} gap={2} align="center">
                    <Box w="10px" h="10px" borderRadius="sm" bg={item.color} />
                    <Text>{item.label}</Text>
                  </HStack>
                ))}
              </HStack>
            )}
            <HStack gap={2}>
              {showValueToggle && (
                <HStack gap={2} p={1} borderRadius="md" bg="bg.subtle">
                  <IconButton
                    size="sm"
                    variant={valueMode === 'count' ? 'solid' : 'ghost'}
                    aria-label="Count view"
                    onClick={() => onValueModeChange?.('count')}
                  >
                    N
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant={valueMode === 'percent' ? 'solid' : 'ghost'}
                    aria-label="Percent view"
                    onClick={() => onValueModeChange?.('percent')}
                  >
                    %
                  </IconButton>
                </HStack>
              )}
              {showToggle && (
                <HStack gap={2} p={1} borderRadius="md" bg="bg.subtle">
                  <IconButton
                    size="sm"
                    variant={view === 'stacked' ? 'solid' : 'ghost'}
                    aria-label="Stacked view"
                    onClick={() => onViewChange?.('stacked')}
                  >
                    <FiLayers />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant={view === 'multiple' ? 'solid' : 'ghost'}
                    aria-label="Multiple view"
                    onClick={() => onViewChange?.('multiple')}
                  >
                    <FiBarChart2 />
                  </IconButton>
                </HStack>
              )}
            </HStack>
          </HStack>
        </HStack>

        <Box h={`${height}px`} w="100%">
          <ResponsiveContainer width="100%" height="100%">
            <Chart.Root chart={chart}>
              <BarChart
                data={chart.data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                barGap={view === 'stacked' ? 0 : 8}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  stroke={chart.color('border')}
                  strokeDasharray="3 3"
                  strokeOpacity={0.6}
                  vertical={false}
                  horizontal
                />
                <XAxis
                  dataKey={chart.key('date')}
                  axisLine={false}
                  tickLine={false}
                  stroke={chart.color('fg.muted')}
                  fontSize={12}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  stroke={chart.color('fg.muted')}
                  fontSize={12}
                  domain={resolvedYDomain}
                />
                <Tooltip
                  cursor={false}
                  wrapperStyle={{ zIndex: 10 }}
                  content={({ active, payload, label }) =>
                    renderTooltip({
                      active,
                      payload,
                      label,
                      series,
                      bg: tooltipBg,
                      border: tooltipBorder,
                      text: tooltipText,
                    })
                  }
                />
                {series.map((item) => (
                  <Bar
                    key={item.name}
                    dataKey={chart.key(item.name)}
                    fill={chart.color(item.color)}
                    stackId={view === 'stacked' ? 'issues' : undefined}
                    barSize={view === 'stacked' ? stackedBarSize : multipleBarSize}
                  />
                ))}
              </BarChart>
            </Chart.Root>
          </ResponsiveContainer>
        </Box>
      </Card.Body>
    </Card.Root>
  );
};
