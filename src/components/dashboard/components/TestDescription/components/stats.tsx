// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { HStack, SimpleGrid, Flex, Box, Text, Card, Icon } from '@chakra-ui/react';

import { TestStat } from '../../../types';

export const Stats = ({ stats, columns }: { stats: TestStat[]; columns?: number | Record<string, number> }) => (
  <SimpleGrid columns={columns || { base: 1 }} gap={3}>
    {stats.map((stat) => (
      <Card.Root key={stat.label}>
        <Card.Body p="10px 15px">
          <Flex align="center" justify="space-between">
            <HStack>
              <Icon as={stat.icon} boxSize="24px" color={stat.color} />
              <Text fontSize="md" color="fg.muted" ml={6}>
                {stat.label}
              </Text>
            </HStack>
            <Box>
              <Text fontSize="3xl" fontWeight={500} lineHeight="1" color={stat.color}>
                {stat.value}
              </Text>
            </Box>
          </Flex>
        </Card.Body>
      </Card.Root>
    ))}
  </SimpleGrid>
);
