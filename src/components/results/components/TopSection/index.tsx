import { useState } from 'react';
import { Grid } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

import { Skeleton } from '@/components/ui';
import { type ResultsStats as ResultsStatsResponse } from '@/redux/apis/generatedApi';

import { CollapsibleWrapper } from './components';

interface TopSectionContainerProps {
  statistics?: ResultsStatsResponse;
  isFetching?: boolean;
}

export const TopSectionContainer = ({ statistics, isFetching }: TopSectionContainerProps) => {
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const methods = useFormContext();
  const topErrors =
    statistics?.topErrors ??
    (isFetching && !statistics
      ? [
          { message: 'Loading', count: 0 },
          { message: '...', count: 0 },
        ]
      : []);
  const topIssues = statistics?.topIssues ?? [];

  const handleClickTopError = (message: string) => {
    methods.setValue('errorMessage', message);
  };
  const handleClickTopIssue = (message: string) => {
    methods.setValue('issueName', message);
  };

  const isInitialLoading = !statistics && isFetching;

  if (topErrors.length === 0 && topIssues.length === 0 && !isFetching) {
    return null;
  }

  return (
    <Grid
      templateColumns={{ base: '1fr 1fr' }}
      gap={4}
      mt={4}
      mb={4}
      bg="bg.section"
      p={4}
      borderRadius="xl"
      shadow="cardSecondary"
    >
      {topErrors.length > 0 && (
        <Skeleton loading={isFetching} minH={isInitialLoading ? '50px' : 'auto'} borderRadius="xl" w="100%">
          <CollapsibleWrapper
            title={`Top ${topErrors.length} errors`}
            setIsOpen={setIsStatsOpen}
            isOpen={isStatsOpen}
            results={topErrors as any}
            handleClickToResult={handleClickTopError}
          />
        </Skeleton>
      )}
      {topIssues.length > 0 && (
        <Skeleton loading={isFetching} minH={isInitialLoading ? '50px' : 'auto'} borderRadius="xl" w="100%">
          <CollapsibleWrapper
            title={`Top ${topIssues.length} issues`}
            setIsOpen={setIsStatsOpen}
            isOpen={isStatsOpen}
            results={topIssues as any}
            handleClickToResult={handleClickTopIssue}
          />
        </Skeleton>
      )}
    </Grid>
  );
};
