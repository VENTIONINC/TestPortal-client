import { memo } from 'react';
import { Grid, Text, VStack, Skeleton } from '@chakra-ui/react';

import { STATUS_META, STATUS_ORDER } from './constants';
import { ResultStatus } from '@/types';
import { ResultsStatCard } from './ResultsStatCard';
import { StatsConfigInfo } from './StatsConfigInfo';
import { type ResultsStatsProps, type StatPalette, type StatPaletteKey, type StatusCountKey } from './types';

export const ResultsStats = memo(({ statistics, isFetching }: ResultsStatsProps) => {
  const cardShadow = 'shadow.sm';
  const labelTextColor = 'text.muted';
  const valueTextColor = 'text.main';

  const palettes: Record<StatPaletteKey, StatPalette> = {
    total: {
      accent: 'status.neutral.icon',
      background: 'status.neutral.bg',
      text: 'status.neutral.text',
    },
    [ResultStatus.Passed]: {
      accent: 'status.success.icon',
      background: 'status.success.bg',
      text: 'status.success.text',
    },
    [ResultStatus.Failed]: {
      accent: 'status.error.icon',
      background: 'status.error.bg',
      text: 'status.error.text',
    },
    [ResultStatus.Skipped]: {
      accent: 'status.neutral.icon',
      background: 'status.neutral.bg',
      text: 'status.neutral.text',
    },
    [ResultStatus.TimedOut]: {
      accent: 'status.attention.icon',
      background: 'status.attention.bg',
      text: 'status.attention.text',
    },
  };

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

  return (
    <VStack w="100%" align="stretch" gap={1} bg="bg.card" p={4} mt={2} borderRadius="md" shadow="sm">
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
            accent={palettes.total.accent}
            background={palettes.total.background}
            labelColor="text.secondary"
            valueColor={(palettes.total as any).text || valueTextColor}
            shadow="none"
          />
        </Skeleton>

        {STATUS_ORDER.map((status) => {
          const { Icon, title } = STATUS_META[status];
          const count = effStats.byStatus[status as StatusCountKey] || 0;
          const palette = palettes[status];

          return (
            <Skeleton key={status} loading={isFetching} minH={isInitialLoading ? '68px' : 'auto'} borderRadius="md" w="100%">
              <ResultsStatCard
                title={title}
                count={count}
                accent={palette.accent}
                background={palette.background}
                labelColor="text.secondary"
                valueColor={(palette as any).text || valueTextColor}
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
});
