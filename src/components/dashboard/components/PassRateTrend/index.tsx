import { Box, Flex, Text, VStack } from '@chakra-ui/react';

import { DashboardTrendChart } from '@/components/charts/DashboardTrendChart';
import { LoadingFallback } from '@/components/LoadingFallback';

import { IssuesCategories } from '../IssuesCategories';
export const PassRateTrend = ({ data, isLoading }) =>
  isLoading ? (
    <LoadingFallback />
  ) : data ? (
    <VStack gap={8} align="stretch">
      {/* <Box>
        <Heading size="md" mb={4} color="gray.700">
          Pass Rate Trend (Last 30 Days)
        </Heading>
        <DashboardTrendChart data={data.history} />
      </Box>
       */}
      <Flex>
        <IssuesCategories />
        <IssuesCategories />
      </Flex>
      <IssuesCategories />
    </VStack>
  ) : (
    <Text>No data available for this project.</Text>
  );
