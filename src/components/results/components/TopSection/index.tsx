// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo, useCallback } from 'react';
import { Grid } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

import { Skeleton } from '@/components/ui';
import { type ResultsStats as ResultsStatsResponse } from '@/redux/apis/generatedApi';

import { CollapsibleWrapper } from './components';

interface TopSectionContainerProps {
  statistics?: ResultsStatsResponse;
  isFetching?: boolean;
}

export const TopSectionContainer = memo(({ statistics, isFetching }: TopSectionContainerProps) => {
  const { setValue } = useFormContext();
  const topErrors =
    statistics?.topErrors ??
    (isFetching && !statistics
      ? [
          { title: 'Loading', count: 0 },
          { title: '...', count: 0 },
        ]
      : []);
  const topIssues = statistics?.topIssues ?? [];

  const handleClickTopError = useCallback(
    (message: string) => {
      setValue('errorMessage', message);
    },
    [setValue],
  );

  const handleClickTopIssue = useCallback(
    (message: string) => {
      setValue('issueName', message);
    },
    [setValue],
  );

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
            results={topErrors}
            handleClickToResult={handleClickTopError}
            hideIconList={true}
          />
        </Skeleton>
      )}
      {topIssues.length > 0 && (
        <Skeleton loading={isFetching} minH={isInitialLoading ? '50px' : 'auto'} borderRadius="xl" w="100%">
          <CollapsibleWrapper
            title={`Top ${topIssues.length} issues`}
            results={topIssues}
            handleClickToResult={handleClickTopIssue}
          />
        </Skeleton>
      )}
    </Grid>
  );
});
