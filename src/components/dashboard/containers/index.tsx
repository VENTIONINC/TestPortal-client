import { useState } from 'react';
import { Box, Flex, useMediaQuery } from '@chakra-ui/react';
import { FormProvider } from 'react-hook-form';

import { useGetApiV2ProjectsByProjectIdDashboardQuery } from '@/redux/apis/generatedApi';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { useFiltersWithUrl } from '@/hooks';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
import { Alert, Filter } from '@/components/ui';
import { useFilterContext, FilterProvider } from '@/contexts/FilterContext';

import { TestDescription, DashboardChart } from '../components';
import { filterConfig } from '../configs';

const initialDashboardFilters: Record<string, string> = {
  execution: '',
  period: '',
};

const DashboardContent = () => {
  const selectedProjectId = useSelectedProjectId();
  const [isLargeScreen] = useMediaQuery(['(min-width: 1300px)'], { ssr: false, fallback: [true] });
  const [filters, setFilters] = useState(initialDashboardFilters);

  const { formMethods, filterProps } = useFiltersWithUrl({
    currentFilters: filters,
    initialFilters: initialDashboardFilters,
    onUpdateFilters: setFilters,
  });

  const effectiveFilters = filterProps.filters;

  // Fetch dashboard data for the last 30 days
  const { data, isLoading, error } = useGetApiV2ProjectsByProjectIdDashboardQuery({
    projectId: selectedProjectId,
    environment: effectiveFilters.execution || 'staging',
    period: effectiveFilters.period || '30',
  });

  const { summary, history } = data || {};

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
      <FormProvider {...formMethods}>
        <Flex align="stretch" gap={6}>
          <Filter showFilters={showFilters} config={filterConfig} {...filterProps} />
          <Flex direction={isGrid ? 'column' : 'row'} flex="1" gap={6} minW={0}>
            <Box flex={isGrid ? 'none' : '0 0 auto'} width={isGrid ? '100%' : 'auto'}>
              <TestDescription isGrid={isGrid} summary={summary} />
            </Box>
            <Box flex="1" minW={0} overflow="hidden">
              <DashboardChart data={history} isLoading={isLoading} showFilters={showFilters} />
            </Box>
          </Flex>
        </Flex>
      </FormProvider>
    </MainTemplate>
  );
};

export const DashboardContainer = () => (
  <FilterProvider storageKey="dashboard">
    <DashboardContent />
  </FilterProvider>
);
