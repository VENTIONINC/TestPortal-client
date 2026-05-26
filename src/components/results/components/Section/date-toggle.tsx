// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { memo } from 'react';
import { Text, HStack, Box } from '@chakra-ui/react';

interface DateToggleProps {
  day: {
    yyyy_mm_dd: string;
    stats: string[];
    isActive: boolean;
    display: string;
  };
  toggleHandler: (day: { yyyy_mm_dd: string }) => void;
}

export const DateToggle = memo(({ day, toggleHandler }: DateToggleProps) => {
  const activeBg = 'green.600';
  const activeHoverBg = 'green.500';
  const activeText = 'text.onAccent';

  return (
    <HStack
      onClick={() => toggleHandler(day)}
      flex={1}
      gap={1}
      justify="space-between"
      py={0.5}
      px={2}
      bg={day.isActive ? activeBg : 'bg.cardSecondary'}
      color={day.isActive ? activeText : 'text.muted'}
      borderRadius="sm"
      border="1px solid"
      borderColor="border.main"
      cursor="pointer"
      shadow="sm"
      _hover={{ bg: day.isActive ? activeHoverBg : 'bg.hover' }}
    >
      <Text whiteSpace="nowrap" color={day.isActive ? "text.onAccent" : "text.main"}>
        {day.display}
      </Text>
      {day.stats.length > 0 && (
        <HStack
          gap={0.5}
          justify="center"
          bg={day.isActive ? "text.onAccent" : 'bg.hover'}
          p="2px"
          borderRadius="sm"
          border="1px solid"
          borderColor="border.main"
        >
          {day.stats.map((status: string, index: number) => {
            const isFirst = index === 0;
            const isLast = index === day.stats.length - 1;
            const isOnly = day.stats.length === 1;

            let borderRadiusProps = {};
            if (isOnly) {
              borderRadiusProps = { borderRadius: 'full' };
            } else if (isFirst) {
              borderRadiusProps = {
                borderTopLeftRadius: 'full',
                borderBottomLeftRadius: 'full',
              };
            } else if (isLast) {
              borderRadiusProps = {
                borderTopRightRadius: 'full',
                borderBottomRightRadius: 'full',
              };
            }

            const statusColor = status === 'passed' ? 'green.500' : status === 'failed' ? 'red.500' : "text.muted";

            return <Box key={index} w={1.5} h={1.5} {...borderRadiusProps} bg={statusColor} />;
          })}
        </HStack>
      )}
    </HStack>
  );
});
