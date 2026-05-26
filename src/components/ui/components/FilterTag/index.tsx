// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Flex, Text, Box, Icon } from '@chakra-ui/react';
import { LuTag, LuX } from 'react-icons/lu';

import { useColorModeValue } from '@/components/ui/color-mode';

export interface FilterTagProps {
  tag: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export const FilterTag = ({ tag, isSelected = false, onClick }: FilterTagProps) => {
  const tagBg = useColorModeValue('rgba(178, 178, 178, 0.1)', 'rgba(125, 125, 127, 0.1)');
  const tagTextColor = useColorModeValue('#333333', '#EAEAEA');
  const tagIconColor = useColorModeValue('#B2B2B2', '#7D7D7F');
  const closeIconColor = useColorModeValue('#3054FE', '#53ABFC');

  return (
    <Flex
      as="button"
      onClick={onClick}
      bg={tagBg}
      color={tagTextColor}
      alignItems="center"
      height="26px"
      px={3}
      borderRadius="full"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-1px)', shadow: 'sm', opacity: 1 }}
      opacity={isSelected ? 1 : 0.7}
      cursor="pointer"
      gap={1.5}
    >
      <Box position="relative" display="flex" alignItems="center" justifyContent="center">
        <Icon as={LuTag} color={tagIconColor} boxSize="14px" strokeWidth={2} />
      </Box>

      <Text fontSize="12px" fontWeight="500" lineHeight="1">
        {tag}
      </Text>

      {isSelected && (
        <Icon as={LuX} color={closeIconColor} boxSize="14px" strokeWidth={2.5} ml={1} />
      )}
    </Flex>
  );
};
