import { Button, VStack, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { FiFilter } from 'react-icons/fi';

import { useGetApiV2ProjectsByProjectIdDashboardQuery } from '@/redux/apis/generatedApi';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
import { Alert } from '@/components/ui';

import { PassRateTrend, Filter, TestDescription } from '../components';

export const DashboardContainer = () => {
  const selectedProjectId = useSelectedProjectId();

  // Fetch dashboard data for the last 30 days
  const { data, isLoading, error } = useGetApiV2ProjectsByProjectIdDashboardQuery({
    projectId: selectedProjectId,
    environment: 'staging',
    period: '30',
  });

  const [showFilters, setShowFilters] = useState(true);

  const actionButton = (
    <Button size="sm" variant="secondary" onClick={() => setShowFilters(!showFilters)}>
      <FiFilter /> Filter
    </Button>
  );

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
    <MainTemplate pageHeader="Dashboard" actionButton={actionButton}>
      <Flex align="stretch" gap={6}>
        <Filter showFilters={showFilters} />
        <TestDescription />
        <PassRateTrend data={data} isLoading={isLoading} />
      </Flex>
    </MainTemplate>
  );
};
