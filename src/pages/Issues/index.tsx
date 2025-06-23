import { VStack } from '@chakra-ui/react';

import { AppHeader } from '@/components/AppHeader';
import { IssuesList } from '@/components/issues';

export const IssuesPage = () => {
  return (
    <VStack gap={4} align="stretch" mb={4}>
      <AppHeader />
      <IssuesList />
    </VStack>
  );
};
