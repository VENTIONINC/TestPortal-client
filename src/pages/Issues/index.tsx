import { Button } from '@chakra-ui/react';
import { useState } from 'react';
import { FiFilter } from 'react-icons/fi';

import { IssuesList } from '@/components/issues';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';

export const IssuesPage = () => {
  const [showFilters, setShowFilters] = useState(true);

  const actionButton = (
    <>
      <Button size="sm" variant="secondary" onClick={() => setShowFilters(!showFilters)}>
        <FiFilter /> Filter
      </Button>
    </>
  );
  return (
    <MainTemplate pageHeader="Issues" actionButton={actionButton}>
      <IssuesList showFilters={showFilters} />
    </MainTemplate>
  );
};
