// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Text } from '@chakra-ui/react';

import { ResultStatus } from '@/types';
import { getResultStatusStyle } from '@/utils';

const compactCountFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const formatCount = (count: number) => {
  if (count < 1000) {
    return String(count);
  }

  return compactCountFormatter.format(count).toUpperCase();
};

export const StatsItem = ({ status, count }: { status: string; count: number }) => {
  const { tokenBase } = getResultStatusStyle(status as ResultStatus);
  const safeCount = Math.max(0, count);
  const renderCount = formatCount(safeCount);

  return (
    <Box
      minW={5}
      h={5}
      px={1}
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={1}
      borderRadius="full"
      bg={`${tokenBase}.bg`}
      color={`${tokenBase}.text`}
      fontWeight={500}
      title={`${safeCount}`}
    >
      <Text fontSize="xs" lineHeight={1} whiteSpace="nowrap" fontVariantNumeric="tabular-nums">
        {renderCount}
      </Text>
    </Box>
  );
};
