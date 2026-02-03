import { Button, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { FiFilter } from 'react-icons/fi';

import { IssuesList } from '@/components/issues';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';

export const IssuesPage = () => {
  const [showFilters, setShowFilters] = useState(true);

  const actionButton = (
    <>
      <Button
        colorScheme="blue"
        size="sm"
        variant={showFilters ? 'solid' : 'outline'}
        onClick={() => setShowFilters(!showFilters)}
      >
        <FiFilter /> Filter
      </Button>
    </>
  );
  return (
    <VStack gap={4} align="stretch" mb={4}>
      <MainTemplate pageHeader="Issues" actionButton={actionButton}>
        <IssuesList showFilters={showFilters} />
      </MainTemplate>
    </VStack>
  );
};
