import { Box, Text } from '@chakra-ui/react';

import { ResultStatus } from '@/types';

import { getStatusStyle } from '../../utils';

export const StatsItem = ({ status, count }: { status: string; count: number }) => {
  const { Icon, color } = getStatusStyle(status as ResultStatus);

  return (
    <Box px={1} py={0.5} display="flex" alignItems="center" gap={1}>
      <Box color={color} fontSize="md">
        <Icon color="currentColor" />
      </Box>
      <Text fontSize="xs" color="text.main">
        {count}
      </Text>
    </Box>
  );
};
