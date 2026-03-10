import { memo } from 'react';
import { Grid, Text, VStack } from '@chakra-ui/react';

import { useColorModeValue } from '@/components/ui';
import { useResultsSurfaceColors } from '@/components/results/useResultsSurfaceColors';
import { ResultStatus } from '@/types';

import { ResultsStatCard } from './ResultsStatCard';
import { StatsConfigInfo } from './StatsConfigInfo';
import { STATUS_META, STATUS_ORDER } from './constants';
import { type ResultsStatsProps, type StatPalette, type StatPaletteKey, type StatusCountKey } from './types';

export const ResultsStats = memo(({ statistics }: ResultsStatsProps) => {
  const { stats } = useResultsSurfaceColors();
  const cardShadow = useColorModeValue('0px 1px 2px rgba(0, 0, 0, 0.08)', '0px 1px 2px rgba(0, 0, 0, 0.32)');
  const labelTextColor = useColorModeValue('#666666', stats.countText);
  const valueTextColor = useColorModeValue('#333333', stats.strongText);

  const palettes: Record<StatPaletteKey, StatPalette> = {
    total: {
      accent: useColorModeValue('#6EC8FF', '#5BB1E3'),
      background: useColorModeValue('#F1FAFF', 'rgba(110, 200, 255, 0.16)'),
    },
    [ResultStatus.Passed]: {
      accent: useColorModeValue('#1FE647', '#35C75D'),
      background: useColorModeValue('#EFFFF2', 'rgba(31, 230, 71, 0.16)'),
    },
    [ResultStatus.Failed]: {
      accent: useColorModeValue('#FF4545', '#FF6767'),
      background: useColorModeValue('#FFEDED', 'rgba(255, 69, 69, 0.16)'),
    },
    [ResultStatus.Skipped]: {
      accent: useColorModeValue('#B2B2B2', '#8D8D93'),
      background: useColorModeValue('#F8F8F8', 'rgba(178, 178, 178, 0.14)'),
    },
    [ResultStatus.TimedOut]: {
      accent: useColorModeValue('#FF874D', '#FF9C6B'),
      background: useColorModeValue('#FFF3EE', 'rgba(255, 135, 77, 0.16)'),
    },
  };

  if (!statistics || statistics.byStatusTotal === 0) {
    return (
      <Text alignSelf="center" color={stats.emptyText}>
        No statistics to display.
      </Text>
    );
  }

  return (
    <VStack w="100%" align="stretch" gap={1} bg="bg.cardSecondary" p={2} mt={2} borderRadius="sm">
      <Grid
        gap={1}
        templateColumns={{
          base: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(5, minmax(0, 1fr))',
        }}
      >
        <ResultsStatCard
          title="Total"
          count={statistics.byStatusTotal}
          accent={palettes.total.accent}
          background={palettes.total.background}
          labelColor={labelTextColor}
          valueColor={valueTextColor}
          shadow={cardShadow}
        />

        {STATUS_ORDER.map((status) => {
          const { Icon, title } = STATUS_META[status];
          const count = statistics.byStatus[status as StatusCountKey];
          const palette = palettes[status];

          return (
            <ResultsStatCard
              key={status}
              title={title}
              count={count}
              accent={palette.accent}
              background={palette.background}
              labelColor={labelTextColor}
              valueColor={valueTextColor}
              shadow={cardShadow}
              IconComponent={Icon}
            />
          );
        })}
      </Grid>

      <StatsConfigInfo entityCounts={statistics.entityCounts} labelColor={labelTextColor} valueColor={valueTextColor} />
    </VStack>
  );
});
