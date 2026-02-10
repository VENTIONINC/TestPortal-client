import { Box, Heading, Text, VStack } from '@chakra-ui/react';

import { useGetApiV2ProjectsByProjectIdDashboardQuery } from '@/redux/apis/generatedApi';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { DashboardTrendChart } from '@/components/charts/DashboardTrendChart';
import { LoadingFallback } from '@/components/LoadingFallback';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
import { Alert } from '@/components/ui';

export const DashboardPage = () => {
  const selectedProjectId = useSelectedProjectId();

  // Fetch dashboard data for the last 30 days
  const { data, isLoading, error } = useGetApiV2ProjectsByProjectIdDashboardQuery({
    projectId: selectedProjectId,
    environment: 'development',
    period: 30,
  });

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
    <MainTemplate pageHeader="Dashboard">
      <Heading size="lg" mb={6}>
        Dashboard
      </Heading>

      {isLoading ? (
        <LoadingFallback />
      ) : data ? (
        <VStack gap={8} align="stretch">
          <Box>
            <Heading size="md" mb={4} color="gray.700">
              Pass Rate Trend (Last 30 Days)
            </Heading>
            <DashboardTrendChart data={data.history} />
          </Box>
        </VStack>
      ) : (
        <Text>No data available for this project.</Text>
      )}
    </MainTemplate>
  );
};
