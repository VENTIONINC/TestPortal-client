import { useState } from 'react';
import { Grid } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

import { type ResultsStats as ResultsStatsResponse } from '@/redux/apis/generatedApi';

import { CollapsibleWrapper } from './components';

interface TopSectionContainerProps {
  statistics?: ResultsStatsResponse;
}

export const TopSectionContainer = ({ statistics }: TopSectionContainerProps) => {
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const methods = useFormContext();
  const topErrors = statistics?.topErrors ?? [];
  const topIssues = statistics?.topIssues ?? [];

  const handleClickTopError = (message: string) => {
    methods.setValue('errorMessage', message);
  };
  const handleClickTopIssue = (message: string) => {
    methods.setValue('issueName', message);
  };

  if (topErrors.length === 0 && topIssues.length === 0) {
    return null;
  }

  return (
    <Grid templateColumns={{ base: '1fr 1fr' }} bg="bg.section" p={4} borderRadius="xl" gap={4} mt={2} mb={2}>
      {topErrors.length > 0 && (
        <CollapsibleWrapper
          title={`Top ${topErrors.length} errors`}
          setIsOpen={setIsStatsOpen}
          isOpen={isStatsOpen}
          results={topErrors}
          handleClickToResult={handleClickTopError}
        />
      )}
      {topIssues.length > 0 && (
        <CollapsibleWrapper
          title={`Top ${topIssues.length} issues`}
          setIsOpen={setIsStatsOpen}
          isOpen={isStatsOpen}
          results={topIssues}
          handleClickToResult={handleClickTopIssue}
        />
      )}
    </Grid>
  );
};
