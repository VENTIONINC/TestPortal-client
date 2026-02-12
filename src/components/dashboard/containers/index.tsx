import { Box, Flex, useMediaQuery } from '@chakra-ui/react';

import { useGetApiV2ProjectsByProjectIdDashboardQuery } from '@/redux/apis/generatedApi';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
import { Alert } from '@/components/ui';
import { useFilterContext, FilterProvider } from '@/contexts/FilterContext';

import { Filter, TestDescription, DashboardChart } from '../components';

const DashboardContent = () => {
  const selectedProjectId = useSelectedProjectId();
  const [isLargeScreen] = useMediaQuery(['(min-width: 1300px)'], { ssr: false, fallback: [true] });

  // Fetch dashboard data for the last 30 days
  const { data, isLoading, error } = useGetApiV2ProjectsByProjectIdDashboardQuery({
    projectId: selectedProjectId,
    environment: 'staging',
    period: '30',
  });

  const { showFilters } = useFilterContext();

  const isGrid = showFilters && !isLargeScreen;

  if (error) {
    return (
      <MainTemplate pageHeader="Dashboard">
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Failed to load dashboard data. Please try again later.</Alert.Title>
          </Alert.Content>
        </Alert.Root>
      </MainTemplate>
    );
  }

  return (
    <MainTemplate pageHeader="Dashboard" isFilterVisible>
      <Flex align="stretch" gap={6}>
        <Filter showFilters={showFilters} />
        <Flex direction={isGrid ? 'column' : 'row'} flex="1" gap={6} minW={0}>
          <Box flex={isGrid ? 'none' : '0 0 auto'} width={isGrid ? '100%' : 'auto'}>
            <TestDescription isGrid={isGrid} />
          </Box>
          <Box flex="1" minW={0} overflow="hidden">
            <DashboardChart data={data} isLoading={isLoading} showFilters={showFilters} />
          </Box>
        </Flex>
      </Flex>
    </MainTemplate>
  );
};

export const DashboardContainer = () => (
  <FilterProvider storageKey="dashboard">
    <DashboardContent />
  </FilterProvider>
);
