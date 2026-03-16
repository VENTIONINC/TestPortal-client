import { Grid, Skeleton, Text, VStack } from '@chakra-ui/react';

import { STATUS_META, STATUS_ORDER } from './constants';
import { ResultsStatCard } from './ResultsStatCard';
import { StatsConfigInfo } from './StatsConfigInfo';
import { type ResultsStatsProps, type StatPalette, type StatPaletteKey, type StatusCountKey } from './types';
import { STAT_PALETTES } from './palettes';

export const StatsBadgeView = ({ statistics, isFetching, size = 'default' }: ResultsStatsProps) => {
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

  const effStats = statistics || {
    byStatusTotal: 0,
    byStatus: { passed: 0, failed: 0, skipped: 0, timedOut: 0 } as any,
    entityCounts: {},
  };

  const vStackPadding = size === 'small' ? 0 : 2;
  const vStackMarginTop = size === 'small' ? 0 : 4;

  return (
    <VStack w="100%" align="stretch" gap={1} bg="bg.card" p={vStackPadding} mt={vStackMarginTop} borderRadius="md" shadow="sm">
      <Grid
        gap={1}
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
            valueColor={STAT_PALETTES.total.text || valueTextColor}
            shadow="none"
          />
        </Skeleton>

        {STATUS_ORDER.map((status) => {
          const { Icon, title } = STATUS_META[status];
          const count = effStats.byStatus[status as StatusCountKey] || 0;
          const palette = STAT_PALETTES[status];

          return (
            <Skeleton key={status} loading={isFetching} minH={isInitialLoading ? '68px' : 'auto'} borderRadius="md" w="100%">
              <ResultsStatCard
                title={title}
                count={count}
                accent={palette.accent}
                background={palette.background}
                labelColor="text.secondary"
                valueColor={palette.text || valueTextColor}
                shadow="none"
                IconComponent={Icon}
              />
            </Skeleton>
          );
        })}
      </Grid>

      <StatsConfigInfo entityCounts={effStats.entityCounts as any} labelColor={labelTextColor} valueColor={valueTextColor} />
    </VStack>
  );
};
