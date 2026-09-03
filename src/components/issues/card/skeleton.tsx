// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo } from 'react';
import { HStack, Flex, Card, Box } from '@chakra-ui/react';

import { Skeleton, SkeletonCircle, SkeletonText } from '@/components/ui';

export const IssueCardSkeleton = memo(() => {
  return (
    <Card.Root w="100%" minW={0} bg="bg.section">
      <Card.Header p="2px 8px 7px 7px">
        <HStack align="stretch" w="100%" minH="37px" alignItems="center" justifyContent="space-between">
          <Flex align="center">
            <SkeletonText noOfLines={1} w="150px" h="16px" mr={2} />
            <SkeletonCircle size="4" mt={1} />
          </Flex>
          <Flex align="center" gap={2}>
            <Skeleton w="60px" h="24px" borderRadius="full" />
            <SkeletonCircle size="1" />
            <Skeleton w="100px" h="12px" />
          </Flex>
        </HStack>

        <SkeletonText noOfLines={2} w="60%" mt={2} />
      </Card.Header>

      <Card.Body p="9px 8px">
        <Box display="grid" gridTemplateColumns="1.04fr 1.96fr" gap="8px" alignItems="start" minW={0} mt="auto">
          <Box w="100%" bg="bg.cardSecondary" borderRadius="xl" p="13px 7px 11px 7px">
            <Box as="ul" w="100%" listStyleType="none" m={0} p={0} display="flex" flexDirection="column" gap={2}>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} as="li" display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                  <Skeleton w="100px" h="12px" />
                  <Skeleton w="40px" h="12px" />
                </Box>
              ))}
            </Box>
          </Box>
          <Box w="100%" h="100%" minW={0} bg="bg.cardSecondary" p="4px 7px 6px 3px" borderRadius="xl">
            <Skeleton w="100%" h="100px" borderRadius="md" />
          </Box>
        </Box>
      </Card.Body>
    </Card.Root>
  );
});
