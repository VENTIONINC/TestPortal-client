import { useCallback, useMemo } from 'react';
import { Box, Button, ButtonGroup, Card, HStack, IconButton, Text } from '@chakra-ui/react';
import { Chart, useChart } from '@chakra-ui/charts';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FiBarChart2, FiLayers } from 'react-icons/fi';

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
  showValueToggle = false,
}: MetricsBarChartProps) => {
  const tooltipBg = 'bg.panel';
  const tooltipBorder = 'border.subtle';
  const tooltipText = 'text.main';
  const cursorFill = 'rgba(0,0,0,0.05)'; // Keep as is if no theme token for cursor

  const normalizedData: CategoriesChartDatum[] = useMemo(() => {
    return data.map((row) => {
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
  }, [data, valueMode, series]);

  const chartSeries = useMemo(() => series.map((item) => ({ name: item.name, color: item.color })), [series]);

  const chart = useChart({
    data: normalizedData,
    series: chartSeries,
  });

  const resolvedYDomain = useMemo(
    () => (valueMode === 'percent' ? [0, 100] : (yDomain ?? [0, 50])),
    [valueMode, yDomain],
  );

  const valueSuffix = useMemo(() => (valueMode === 'percent' ? '%' : ''), [valueMode]);

  const customTicks = useMemo(() => {
    const [min, max] = resolvedYDomain;
    if (min !== 0) return undefined;

    // Prioritize powers of 10 as requested ("tens, hundreds, thousands")
    const possibleSteps = [10000, 1000, 100, 10, 1];

    for (const step of possibleSteps) {
      if (max >= step && max % step === 0) {
        const count = max / step;
        // Ensure not too few ticks (sparse) and not too many (cluttered)
        // For max=100, step=100 gives count 1 (<2), so it falls to step=10 (count 10)
        // For max=200, step=100 gives count 2, which creates [0, 100, 200]
        if (count >= 2 && count <= 30) {
          return Array.from({ length: count + 1 }, (_, i) => i * step);
        }
      }
    }
    return undefined;
  }, [resolvedYDomain]);

  const renderTooltip = useCallback(
    ({ active, payload, label, series, bg, border, text }: TooltipProps) => {
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
    },
    [valueSuffix],
  );

  const tooltipContent = useCallback(
    ({ active, payload, label }: any) =>
      renderTooltip({
        active,
        payload,
        label,
        series,
        bg: tooltipBg,
        border: tooltipBorder,
        text: tooltipText,
      }),
    [renderTooltip, series, tooltipBg, tooltipBorder, tooltipText],
  );

  const tooltipCursor = useMemo(() => ({ fill: cursorFill }), [cursorFill]);
  const tooltipWrapperStyle = useMemo(() => ({ zIndex: 10 }), []);
  const xAxisPadding = useMemo(() => ({ left: 20, right: 20 }), []);
  const chartMargin = useMemo(() => ({ top: 10, right: 10, left: 0, bottom: 0 }), []);

  return (
    <Card.Root>
      <Card.Body>
        <Box bg="bg.cardSecondary" borderRadius="lg" p="20px">
          <HStack justify="space-between" align="center" mb={4} gap={4} flexWrap="wrap">
            <Text fontWeight="semibold">{title}</Text>
            <HStack gap={4} flexWrap="wrap" justify="flex-end">
              <HStack gap={2}>
                {showValueToggle && (
                  <ButtonGroup size="sm" attached variant="outline">
                    <Button
                      variant={valueMode === 'count' ? 'solid' : 'ghost'}
                      aria-label="Count view"
                      onClick={() => onValueModeChange?.('count')}
                      w="32px"
                      minW="32px"
                      p={0}
                    >
                      N
                    </Button>
                    <Button
                      variant={valueMode === 'percent' ? 'solid' : 'ghost'}
                      aria-label="Percent view"
                      onClick={() => onValueModeChange?.('percent')}
                      w="32px"
                      minW="32px"
                      p={0}
                    >
                      %
                    </Button>
                  </ButtonGroup>
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
          <Box display="flex" justifyContent="end">
            {showLegend && (
              <HStack gap={5} fontSize="sm" color="fg.muted">
                {series.map((item) => (
                  <HStack key={item.name} align="center">
                    <Box w="10px" h="10px" borderRadius="xs" bg={item.color} />
                    <Text fontSize="2xs">{item.label}</Text>
                  </HStack>
                ))}
              </HStack>
            )}
          </Box>

          <Box h={`${height}px`} w="calc(100% + 40px)" mx="-36px" minW={0} position="relative">
            <Box position="absolute" inset={0}>
              <ResponsiveContainer width="100%" height="100%">
                <Chart.Root chart={chart}>
                  <BarChart
                    data={chart.data}
                    margin={chartMargin}
                    barGap={view === 'stacked' ? 0 : 8}
                    barCategoryGap={20}
                  >
                    <CartesianGrid stroke="var(--chakra-colors-border-subtle)" strokeDasharray="3 3" strokeOpacity={0.6} vertical={false} horizontal />
                    <XAxis
                      dataKey={chart.key('date')}
                      axisLine={false}
                      tickLine={false}
                      stroke={chart.color('fg.muted')}
                      fontSize={12}
                      padding={xAxisPadding}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      stroke={chart.color('fg.muted')}
                      fontSize={12}
                      domain={resolvedYDomain}
                      ticks={customTicks}
                      interval={0} // allowDecimals={false}
                    />
                    <Tooltip cursor={tooltipCursor} wrapperStyle={tooltipWrapperStyle} content={tooltipContent} />
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
          </Box>
        </Box>
      </Card.Body>
    </Card.Root>
  );
};
