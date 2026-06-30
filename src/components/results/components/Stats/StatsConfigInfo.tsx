// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Flex, HStack, Text } from '@chakra-ui/react';

import { configInfo } from '../../configs';
import { type EntityCountKey, type StatsConfigInfoProps } from './types';

export const StatsConfigInfo = ({ entityCounts, labelColor, valueColor }: StatsConfigInfoProps) => {
  return (
    <Flex wrap="wrap" align="center" columnGap={3} rowGap={1} px={1}>
      {configInfo.map(({ label, key }) => {
        const count = entityCounts[key as EntityCountKey];

        return (
          <HStack key={key} gap={1.5}>
            <Text fontSize="13px" lineHeight="18px" color={labelColor} whiteSpace="nowrap">
              {label}:{' '}
              <Text as="span" color={valueColor} fontWeight={500}>
                {count}
              </Text>
            </Text>
          </HStack>
        );
      })}
    </Flex>
  );
};
