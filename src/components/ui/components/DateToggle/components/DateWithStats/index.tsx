// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Text, HStack } from '@chakra-ui/react';

import { StatsItem } from '../StatsItem';

export const DateWithStats = ({
  day,
  toggleHandler,
}: {
  day: { yyyy_mm_dd: string; stats: string[]; isActive: boolean; display: string };
  toggleHandler: (day: { yyyy_mm_dd: string }) => void;
}) => {
  const statsData = day.stats?.reduce((acc: Record<string, number>, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return (
    <HStack
      onClick={() => toggleHandler(day)}
      flex={1}
      gap={1}
      justify="space-between"
      py={1}
      px={2}
      bg="bg.cardSecondary"
      borderRadius="sm"
      border="1px solid"
      borderColor="border.secondary"
      borderTopWidth="3px"
      borderTopColor={day.isActive ? 'border.active' : 'border.notActive'}
      cursor="pointer"
      minH="40px"
      shadow={day.isActive ? 'cardSecondary' : 'none'}
    >
      <Text
        whiteSpace="nowrap"
        color={day.isActive ? 'text.active' : 'text.main'}
        fontSize="13px"
        fontWeight={500}
        mr={2}
      >
        {day.display}
      </Text>
      {day.stats?.length > 0 && (
        <HStack gap={0.5} justify="center">
          {Object.entries(statsData).map(([status, count]) => (
            <StatsItem key={status} status={status} count={count} />
          ))}
        </HStack>
      )}
    </HStack>
  );
};
