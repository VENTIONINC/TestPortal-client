import { Box, SimpleGrid, Text, VStack, useMediaQuery } from '@chakra-ui/react';

import { LoadingFallback } from '@/components/LoadingFallback';

import { PassRateChart, IssuesCategoriesChart, HistoryRegressionRunChart } from './components';

export const DashboardChart = ({ data, isLoading, showFilters }: any) => {
  const [isWideScreen] = useMediaQuery(['(min-width: 1920px)']);
  const columns = showFilters || !isWideScreen ? 1 : 2;

  return (
    <VStack w="100%" gap={6} align="stretch">
      {/* <Box>
        <Heading size="md" mb={4} color="gray.700">
          Pass Rate Trend (Last 30 Days)
        </Heading>
        <DashboardTrendChart data={data.history} />
      </Box>
       */}
      <SimpleGrid columns={columns} gap={6}>
        <Box minW={0}>
          <PassRateChart />
        </Box>
        <Box minW={0}>
          <IssuesCategoriesChart />
        </Box>
      </SimpleGrid>
      <Box minW={0}>
        <HistoryRegressionRunChart />
      </Box>
    </VStack>
  );
  //   return isLoading ? (
  //     <LoadingFallback />
  //   ) : data ? (
  //     <VStack gap={8} align="stretch">
  //       {/* <Box>
  //         <Heading size="md" mb={4} color="gray.700">
  //           Pass Rate Trend (Last 30 Days)
  //         </Heading>
  //         <DashboardTrendChart data={data.history} />
  //       </Box>
  //        */}
  //       <Flex>
  //         <PassRateChart />
  //         <IssuesCategoriesChart />
  //       </Flex>
  //       <HistoryRegressionRunChart />
  //     </VStack>
  //   ) : (
  //     <Text>No data available for this project.</Text>
  //   );
};
