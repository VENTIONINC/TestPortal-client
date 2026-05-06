import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { ReactNode, useCallback, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import type { Layout, LayoutItem, ResponsiveLayouts } from 'react-grid-layout/legacy';
import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { useChart } from '@chakra-ui/charts';
import { PiDotsNineBold } from 'react-icons/pi';
import { FaCircleCheck, FaRegCircleXmark } from 'react-icons/fa6';
import { LuRotateCcw } from 'react-icons/lu';

import { TestDescriptionSummary, TestStat } from '../types';
import { Stats } from '../components/TestDescription/components/stats';
import { DonutChart } from '../components/TestDescription/components/donutChart';
import { PassRateChart } from '../components/DashboardChart/components/PassRateChart';
import { IssuesCategoriesChart } from '../components/DashboardChart/components/IssuesCategoriesChart';
import { HistoryRegressionRunChart } from '../components/DashboardChart/components/HistoryRegressionRunChart';

const ResponsiveGridLayout = WidthProvider(Responsive);

const STORAGE_KEY = 'dashboard_grid_layout_v1';

const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: 'stats', x: 0, y: 0, w: 4, h: 6, minH: 6, maxH: 6, minW: 3, isResizable: false },
  { i: 'donut', x: 0, y: 6, w: 4, h: 7, minH: 3, minW: 3, isResizable: false },
  { i: 'passRate', x: 4, y: 0, w: 8, h: 9, minH: 4, minW: 3 },
  { i: 'issues', x: 8, y: 9, w: 8, h: 9, minH: 4, minW: 3 },
  { i: 'regression', x: 4, y: 18, w: 8, h: 9, minH: 4, minW: 6 },
];

const DEFAULT_LAYOUTS: ResponsiveLayouts = { lg: DEFAULT_LAYOUT };

const loadLayouts = (): ResponsiveLayouts => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as ResponsiveLayouts;
  } catch {
    /* ignore parse errors */
  }
  return DEFAULT_LAYOUTS;
};

interface DashboardGridProps {
  summary?: TestDescriptionSummary;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history?: any;
  isLoading?: boolean;
}

const GridCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box
    h="100%"
    borderRadius="xl"
    border="1px solid"
    borderColor="border.muted"
    overflow="hidden"
    display="flex"
    flexDirection="column"
    bg="bg"
    transition="all 0.2s"
    _hover={{ boxShadow: 'sm', borderColor: 'border.main' }}
  >
    <Flex className="drag-handle" cursor="grab" px={4} pt={4} pb={2} align="center" userSelect="none" flexShrink={0}>
      <Icon as={PiDotsNineBold} color="fg.muted" mr={2} boxSize="18px" />
      <Text fontSize="md" color="fg" fontWeight="semibold" letterSpacing="tight">
        {title}
      </Text>
    </Flex>
    <Box flex="1" overflow="auto" px={4} pb={4}>
      {children}
    </Box>
  </Box>
);

const StatsWidget = ({ summary }: { summary?: TestDescriptionSummary }) => {
  const { failures = 0, totalRuns = 0 } = summary || {};
  const passed = totalRuns - failures || 0;
  const failed = failures || 0;

  const stats: TestStat[] = [
    { label: 'Test runs', value: totalRuns, status: 'runs', icon: PiDotsNineBold, color: 'dashboard.base' },
    { label: 'Test passed', value: passed, status: 'passed', icon: FaCircleCheck, color: 'dashboard.green' },
    { label: 'Test failed', value: failed, status: 'failed', icon: FaRegCircleXmark, color: 'dashboard.red' },
  ];
  return <Stats stats={stats} columns={1} />;
};

const DonutChartWidget = ({ summary }: { summary?: TestDescriptionSummary }) => {
  const { totalRuns = 0, failures = 0 } = summary || {};
  const passed = totalRuns - failures || 0;
  const failed = failures || 0;
  const donutData = [
    { name: 'passed', value: passed, color: 'dashboard.green' },
    { name: 'failed', value: failed, color: 'dashboard.red' },
  ];
  const donutChart = useChart({
    data: donutData,
    series: donutData.map((item) => ({ color: item.color })),
  });
  return <DonutChart title="Test runs" passed={passed} failed={failed} donutChart={donutChart} totalRuns={totalRuns} />;
};

export const DashboardGrid = ({ summary, history }: DashboardGridProps) => {
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(loadLayouts);

  const handleLayoutChange = useCallback((_layout: Layout, allLayouts: ResponsiveLayouts) => {
    setLayouts(allLayouts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLayouts));
  }, []);

  const handleReset = useCallback(() => {
    setLayouts(DEFAULT_LAYOUTS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <Box position="relative" w="full">
      <Flex justify="flex-end" mb={4}>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          borderColor="border.muted"
          color="fg.muted"
          fontWeight="medium"
          fontSize="xs"
          _hover={{ bg: 'bg.subtle', color: 'fg', borderColor: 'border.main' }}
        >
          <Icon as={LuRotateCcw} />
          Reset Layout
        </Button>
      </Flex>
      <ResponsiveGridLayout
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={50}
        draggableHandle=".drag-handle"
        margin={[16, 16]}
      >
        <div key="stats">
          <GridCard title="Statistics">
            <StatsWidget summary={summary} />
          </GridCard>
        </div>
        <div key="donut">
          <GridCard title="Test runs">
            <DonutChartWidget summary={summary} />
          </GridCard>
        </div>

        <div key="passRate">
          <GridCard title="Pass rate">
            <PassRateChart data={history} />
          </GridCard>
        </div>
        <div key="issues">
          <GridCard title="Issues categories">
            <IssuesCategoriesChart data={history} />
          </GridCard>
        </div>
        <div key="regression">
          <GridCard title="History regression runs">
            <HistoryRegressionRunChart data={history} />
          </GridCard>
        </div>
      </ResponsiveGridLayout>
    </Box>
  );
};
