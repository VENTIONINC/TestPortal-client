import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';

import { useGetApiV2ProjectsByProjectIdDashboardQuery } from '@/redux/apis/generatedApi';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { AppHeader } from '@/components/AppHeader';
import { DashboardTrendChart } from '@/components/charts/DashboardTrendChart';
import { LoadingFallback } from '@/components/LoadingFallback';

export const DashboardPage = () => {
  const selectedProjectId = useSelectedProjectId();

  // Fetch dashboard data for the last 30 days
  const { data, isLoading, error } = useGetApiV2ProjectsByProjectIdDashboardQuery({
    projectId: selectedProjectId,
    environment: 'development',
    period: '30',
  });

  if (error) {
    return (
      <Box>
        <AppHeader />
        <Container maxW="container.xl" py={8}>
          <Text color="red.500">Failed to load dashboard data. Please try again later.</Text>
        </Container>
      </Box>
    );
  }

  return (
    <Box pb={8}>
      <AppHeader />
      <Container maxW="container.xl" py={8}>
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
      </Container>
    </Box>
  );
};
