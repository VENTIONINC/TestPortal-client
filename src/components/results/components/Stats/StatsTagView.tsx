import { Box, HStack, Separator, Skeleton, Text, VStack } from '@chakra-ui/react';

import { STATUS_META, STATUS_ORDER } from './constants';
import { StatsConfigInfo } from './StatsConfigInfo';
import { type ResultsStatsProps, type StatusCountKey } from './types';
import { STAT_PALETTES } from './palettes';

export const StatsTagView = ({ statistics, isFetching }: ResultsStatsProps) => {
  const isInitialLoading = !statistics && isFetching;
  const labelTextColor = 'text.muted';
  const valueTextColor = 'text.main';

  if (!statistics && !isFetching) {
    return null;
  }

  const effStats = statistics || {
    byStatusTotal: 0,
    byStatus: { passed: 0, failed: 0, skipped: 0, timedOut: 0 } as any,
    entityCounts: {},
  };

  return (
    <HStack align="stretch" gap={1} mb={2}>
      <HStack gap={1.5} flexWrap="wrap" py={1}>
        {/* Total tag */}
        <Skeleton loading={isFetching} borderRadius="full" minW={isInitialLoading ? '60px' : 'auto'} h={7}>
          <Box
            display="inline-flex"
            alignItems="center"
            gap={1.5}
            px={3}
            h={7}
            borderRadius="full"
            bg={STAT_PALETTES.total.accent}
            color="white"
            fontSize="12px"
            fontWeight={600}
            lineHeight="1"
            whiteSpace="nowrap"
          >
            <Text as="span" opacity={0.85}>Total</Text>
            <Text as="span">{effStats.byStatusTotal || 0}</Text>
          </Box>
        </Skeleton>

        {STATUS_ORDER.map((status) => {
          const { Icon, title } = STATUS_META[status];
          const count = effStats.byStatus[status as StatusCountKey] || 0;
          const palette = STAT_PALETTES[status];

          return (
            <Skeleton key={status} loading={isFetching} borderRadius="full" minW={isInitialLoading ? '60px' : 'auto'} h={7}>
              <Box
                display="inline-flex"
                alignItems="center"
                gap={1.5}
                px={3}
                h={7}
                borderRadius="full"
                bg={palette.accent}
                color="white"
                fontSize="12px"
                fontWeight={600}
                lineHeight="1"
                whiteSpace="nowrap"
              >
                <Icon size={12} />
                <Text as="span" opacity={0.85}>{title}</Text>
                <Text as="span">{count}</Text>
              </Box>
            </Skeleton>
          );
        })}
      </HStack>

      <Box mx={3} w="1px" my="auto" h={5} bg="border.secondary" />

      <StatsConfigInfo entityCounts={effStats.entityCounts as any} labelColor={labelTextColor} valueColor={valueTextColor} />
    </HStack>
  );
};
