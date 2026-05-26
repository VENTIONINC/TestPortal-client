// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Box, HStack, Skeleton, Text } from '@chakra-ui/react';

import { type ResultsStats as ResultsStatsResponse } from '@/redux/apis/generatedApi';

import { STATUS_META, STATUS_ORDER } from './constants';
import { StatsConfigInfo } from './StatsConfigInfo';
import { type ResultsStatsProps, type StatusCountKey } from './types';
import { STAT_PALETTES_TAG_VIEW } from './palettes';

export const StatsTagView = ({ statistics, isFetching }: ResultsStatsProps) => {
  const isInitialLoading = !statistics && isFetching;
  const labelTextColor = 'text.main';
  const valueTextColor = 'text.main';

  if (!statistics && !isFetching) {
    return null;
  }

  const effStats: ResultsStatsResponse = statistics || {
    byStatusTotal: 0,
    byStatus: { passed: 0, failed: 0, skipped: 0, timedOut: 0 },
    entityCounts: { specs: 0, results: 0, executions: 0, issues: 0, errors: 0, assumptions: 0 },
    topErrors: [],
    topIssues: [],
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
            bg={STAT_PALETTES_TAG_VIEW.total.background}
            color={STAT_PALETTES_TAG_VIEW.total.text}
            fontSize="12px"
            fontWeight={600}
            lineHeight="1"
            whiteSpace="nowrap"
          >
            <Text as="span" opacity={0.85}>
              Total
            </Text>
            <Text as="span" color={STAT_PALETTES_TAG_VIEW.total.count}>
              {effStats.byStatusTotal || 0}
            </Text>
          </Box>
        </Skeleton>

        {STATUS_ORDER.map((status) => {
          const { Icon, title } = STATUS_META[status];
          const count = effStats.byStatus[status as StatusCountKey] || 0;
          const palette = STAT_PALETTES_TAG_VIEW[status];

          return (
            <Skeleton
              key={status}
              loading={isFetching}
              borderRadius="full"
              minW={isInitialLoading ? '60px' : 'auto'}
              h={7}
            >
              <Box
                display="inline-flex"
                alignItems="center"
                gap={1.5}
                px={3}
                h={7}
                borderRadius="full"
                bg={palette.background}
                color={palette.text}
                fontSize="12px"
                fontWeight={600}
                lineHeight="1"
                whiteSpace="nowrap"
              >
                <Box color={palette.icon}>
                  <Icon size={12} />
                </Box>
                <Text as="span" opacity={0.85}>
                  {title}:
                </Text>
                <Text as="span" color={palette.count}>
                  {count}
                </Text>
              </Box>
            </Skeleton>
          );
        })}
      </HStack>

      <Box mx={3} w="1px" my="auto" h={5} bg="border.secondary" />

      <StatsConfigInfo
        entityCounts={effStats.entityCounts}
        labelColor={labelTextColor}
        valueColor={valueTextColor}
      />
    </HStack>
  );
};
