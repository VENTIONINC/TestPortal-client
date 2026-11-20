// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react';

import type { ManualTestRunSummary } from '@/redux/apis/generatedApi';
import { orange_300 } from '@/theme/colors/palette';

import { MANUAL_RUN_STATUS } from '../../constants';

interface ManualRunSidebarItemProps {
  item: ManualTestRunSummary;
  selected: boolean;
  onSelectRun: (runId: string) => void;
}

export const ManualRunSidebarItem = ({ item, selected, onSelectRun }: ManualRunSidebarItemProps) => {
  const markedCount = item.scenarioCount - item.untestedCount;
  if (item.status === MANUAL_RUN_STATUS.COMPLETED) {
    const resultLabel =
      item.failedCount > 0
        ? 'Failed'
        : item.blockedCount > 0 || item.skippedCount > 0
          ? 'Blocked or skipped'
          : 'Passed';
    const resultColor =
      resultLabel === 'Failed' ? 'red.500' : resultLabel === 'Blocked or skipped' ? orange_300 : 'green.500';
    return (
      <Button
        variant="ghost"
        bg={selected ? 'blue.50' : undefined}
        h="auto"
        minH="0"
        w="full"
        px={2}
        py={2}
        justifyContent="flex-start"
        textAlign="left"
        onClick={() => onSelectRun(item.id)}
      >
        <HStack align="start" w="full" gap={2}>
          <Box
            boxSize="7px"
            borderRadius="full"
            bg={resultColor}
            flexShrink={0}
            mt="7px"
            role="img"
            aria-label={resultLabel}
          />
          <VStack align="stretch" gap={0} minW={0} flex="1">
            <Text fontSize="sm" fontWeight="medium" truncate title={item.title}>
              {item.title}
            </Text>
            <Text fontSize="xs" color="fg.muted">
              {item.passedCount}/{item.scenarioCount} passed
            </Text>
          </VStack>
        </HStack>
      </Button>
    );
  }
  return (
    <Button
      variant={selected ? 'subtle' : 'ghost'}
      colorPalette={selected ? 'blue' : undefined}
      bg={selected ? 'blue.50' : undefined}
      textAlign="left"
      justifyContent="flex-start"
      h="auto"
      minH="60px"
      px={2}
      py={2}
      whiteSpace="normal"
      onClick={() => onSelectRun(item.id)}
    >
      <VStack align="stretch" gap={1} w="100%">
        <Text fontSize="sm" fontWeight="medium" lineClamp={1} title={item.title}>
          {item.title}
        </Text>
        <Text fontSize="xs" color="fg.muted">
          {new Date(item.completedAt ?? item.startedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}{' '}
          · {markedCount}/{item.scenarioCount} marked
        </Text>
        <Flex
          h="1.5"
          borderRadius="full"
          overflow="hidden"
          bg="bg.subtle"
          aria-label={`${markedCount} of ${item.scenarioCount} marked`}
        >
          {item.passedCount > 0 && <Box flex={item.passedCount} bg="green.500" />}
          {item.failedCount > 0 && <Box flex={item.failedCount} bg="red.500" />}
          {item.blockedCount > 0 && <Box flex={item.blockedCount} bg={orange_300} />}
          {item.skippedCount > 0 && <Box flex={item.skippedCount} bg="gray.500" />}
          {item.untestedCount > 0 && <Box flex={item.untestedCount} bg="gray.200" />}
        </Flex>
      </VStack>
    </Button>
  );
};
