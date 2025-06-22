import { VStack } from '@chakra-ui/react';

import { AppHeader } from '@/components/AppHeader';
import { ResultsList } from '@/components/results';

export const ResultsPage = () => {
  return (
    <VStack gap={4} align="stretch" mb={4}>
      <AppHeader />
      <ResultsList />
    </VStack>
  );
};
