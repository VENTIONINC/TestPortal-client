import { Button, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { FiFilter } from 'react-icons/fi';

import { ResultsList } from '@/components/results';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';

export const ResultsPage = () => {
  const [showFilters, setShowFilters] = useState(true);

  const actionButton = (
    <>
      <Button
        colorPalette="blue"
        size="sm"
        variant={showFilters ? 'solid' : 'outline'}
        onClick={() => setShowFilters(!showFilters)}
      >
        <FiFilter /> Filter
      </Button>
    </>
  );
  return (
    <VStack gap={4} align="stretch" mb={4} overflowX="auto" w="100%">
      <MainTemplate pageHeader="Results" actionButton={actionButton}>
        <ResultsList showFilters={showFilters} />
      </MainTemplate>
    </VStack>
  );
};
