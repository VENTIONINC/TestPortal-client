// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Grid, Text, VStack } from '@chakra-ui/react';

import { type ResultsStats as ResultsStatsResponse } from '@/redux/apis/generatedApi';
import { Skeleton } from '@/components/ui';

import { STATUS_META, STATUS_ORDER } from './constants';
import { ResultsStatCard } from './ResultsStatCard';
import { STAT_PALETTES } from './palettes';
import { StatsConfigInfo } from './StatsConfigInfo';
import { type ResultsStatsProps, type StatusCountKey } from './types';

export const StatsBadgeView = ({ statistics, isFetching }: ResultsStatsProps) => {
  const valueTextColor = 'text.main';
  const labelTextColor = 'text.muted';

  const isInitialLoading = !statistics && isFetching;

  if (!statistics && !isFetching) {
    return (
      <Text alignSelf="center" color="text.muted">
        No statistics to display.
      </Text>
    );
  }

  const effStats: ResultsStatsResponse = statistics || {
    byStatusTotal: 0,
    byStatus: { passed: 0, failed: 0, skipped: 0, timedOut: 0 },
    entityCounts: { specs: 0, results: 0, executions: 0, issues: 0, errors: 0, assumptions: 0 },
    topErrors: [],
    topIssues: [],
  };

  return (
    <VStack w="100%" align="stretch" gap={1} p={0} mt={0}>
      <Grid
        templateColumns={{
          base: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(5, minmax(0, 1fr))',
        }}
      >
        <Skeleton loading={isFetching} minH={isInitialLoading ? '68px' : 'auto'} borderRadius="md" w="100%">
          <ResultsStatCard
            title="Total"
            count={effStats.byStatusTotal || 0}
            accent={STAT_PALETTES.total.accent}
            background={STAT_PALETTES.total.background}
            labelColor="text.secondary"
            valueColor={STAT_PALETTES.total.count || valueTextColor}
            shadow="none"
          />
        </Skeleton>

        {STATUS_ORDER.map((status) => {
          const { Icon, title } = STATUS_META[status];
          const count = effStats.byStatus[status as StatusCountKey] || 0;
          const palette = STAT_PALETTES[status];

          return (
            <Skeleton
              key={status}
              loading={isFetching}
              minH={isInitialLoading ? '68px' : 'auto'}
              borderRadius="md"
              w="100%"
            >
              <ResultsStatCard
                title={title}
                count={count}
                accent={palette.accent}
                background={palette.background}
                labelColor="text.secondary"
                valueColor={palette.count || valueTextColor}
                shadow="none"
                IconComponent={Icon}
              />
            </Skeleton>
          );
        })}
      </Grid>

      <StatsConfigInfo entityCounts={effStats.entityCounts} labelColor={labelTextColor} valueColor={valueTextColor} />
    </VStack>
  );
};
