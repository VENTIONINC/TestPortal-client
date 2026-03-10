import { Box, Flex, HStack, Text } from '@chakra-ui/react';

import { type ResultsStatCardProps } from './types';

export const ResultsStatCard = ({
  title,
  count,
  accent,
  background,
  labelColor,
  valueColor,
  shadow,
  IconComponent,
}: ResultsStatCardProps) => {
  return (
    <Box
      mb={3}
      px={3}
      h="34px"
      borderRadius="4px"
      borderLeft="2px solid"
      borderColor={accent}
      bg={background}
      boxShadow={shadow}
    >
      <Flex h="100%" align="center" justify="space-between" gap={2}>
        <HStack minW={0} gap={3}>
          {IconComponent ? (
            <Box flexShrink={0} color={accent}>
              <IconComponent size={14} strokeWidth={1.75} />
            </Box>
          ) : null}

          <Text
            minW={0}
            fontSize="13px"
            lineHeight="1"
            fontWeight={500}
            color={labelColor}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {title}
          </Text>
        </HStack>

        <Text flexShrink={0} fontSize="22px" lineHeight="1" fontWeight={500} color={valueColor}>
          {count}
        </Text>
      </Flex>
    </Box>
  );
};
