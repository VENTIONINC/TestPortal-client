import { Button } from '@chakra-ui/react';
import { useState } from 'react';
import { FiFilter } from 'react-icons/fi';

import { ResultsList } from '@/components/results';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';

export const ResultsPage = () => {
  const [showFilters, setShowFilters] = useState(true);

  const actionButton = (
    <>
      <Button size="sm" variant="secondary" onClick={() => setShowFilters(!showFilters)}>
        <FiFilter /> Filter
      </Button>
    </>
  );
  return (
    <MainTemplate pageHeader="Results" actionButton={actionButton}>
      <ResultsList showFilters={showFilters} />
    </MainTemplate>
  );
};
