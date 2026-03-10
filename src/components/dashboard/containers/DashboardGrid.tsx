import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { ReactNode, useCallback, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import type { Layout, LayoutItem, ResponsiveLayouts } from 'react-grid-layout/legacy';
import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { useChart } from '@chakra-ui/charts';
import { MdDragIndicator } from 'react-icons/md';
import { PiDotsNineBold } from 'react-icons/pi';
import { FaCircleCheck, FaRegCircleXmark } from 'react-icons/fa6';

import { TestDescriptionSummary, TestStat } from '../types';
import { Stats } from '../components/TestDescription/components/stats';
import { DonutChart } from '../components/TestDescription/components/donutChart';
import { QualityChart } from '../components/TestDescription/components/qualityChart';
import { PassRateChart } from '../components/DashboardChart/components/PassRateChart';
import { IssuesCategoriesChart } from '../components/DashboardChart/components/IssuesCategoriesChart';
import { HistoryRegressionRunChart } from '../components/DashboardChart/components/HistoryRegressionRunChart';

const ResponsiveGridLayout = WidthProvider(Responsive);

const STORAGE_KEY = 'dashboard_grid_layout_v1';

const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: 'stats', x: 0, y: 0, w: 12, h: 3, minH: 2, minW: 6 },
  { i: 'donut', x: 0, y: 3, w: 4, h: 7, minH: 4, minW: 3 },
  { i: 'quality', x: 0, y: 3, w: 4, h: 6, minH: 4, minW: 3 },
  { i: 'passRate', x: 5, y: 12, w: 6, h: 9, minH: 4, minW: 3 },
  { i: 'issues', x: 6, y: 12, w: 6, h: 9, minH: 4, minW: 3 },
  { i: 'regression', x: 0, y: 21, w: 12, h: 9, minH: 4, minW: 6 },
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
    borderRadius="lg"
    border="1px solid"
    borderColor="border.muted"
    overflow="hidden"
    display="flex"
    flexDirection="column"
    bg="bg"
  >
    <Flex
      className="drag-handle"
      cursor="grab"
      px={3}
      py="6px"
      align="center"
      borderBottom="1px solid"
      borderColor="border.muted"
      bg="bg.subtle"
      userSelect="none"
      flexShrink={0}
    >
      <Icon as={MdDragIndicator} color="fg.muted" mr={2} />
      <Text fontSize="sm" color="fg.muted" fontWeight="medium">
        {title}
      </Text>
    </Flex>
    <Box flex="1" overflow="auto" p={3}>
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
  return <Stats stats={stats} columns={3} />;
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

const QualityChartWidget = ({ summary }: { summary?: TestDescriptionSummary }) => {
  const { passRate } = summary || {};
  const qualitySegments = 24;
  const filledSegments = Math.round(((passRate ?? 0) / 100) * qualitySegments);
  const qualityData = Array.from({ length: qualitySegments }, (_, index) => ({
    name: `segment-${index + 1}`,
    value: 1,
    color: index < filledSegments ? 'dashboard.green' : 'dashboard.gray',
  }));
  const qualityChart = useChart({
    data: qualityData,
    series: qualityData.map((item) => ({ color: item.color })),
  });
  const mockDataPast = { passRate: 73, passRateDelta: 3 };
  return <QualityChart qualityChart={qualityChart} data={mockDataPast} w="full" />;
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
      <Flex justify="flex-end" mb={2}>
        <Button size="sm" variant="ghost" onClick={handleReset}>
          Reset layout
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
        <div key="quality">
          <GridCard title="Quality overtime">
            <QualityChartWidget summary={summary} />
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
