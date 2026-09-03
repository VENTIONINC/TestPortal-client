// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Flex, Text, Box, Icon } from '@chakra-ui/react';
import { LuTag } from 'react-icons/lu';

import { useColorModeValue } from '@/components/ui/color-mode';

interface SkillTagProps {
  label: string;
}

export const SkillTag = ({ label }: SkillTagProps) => {
  const tagBg = useColorModeValue('rgba(178, 178, 178, 0.1)', 'rgba(125, 125, 127, 0.1)');
  const tagTextColor = useColorModeValue('#333333', '#EAEAEA');
  const tagIconColor = useColorModeValue('#B2B2B2', '#7D7D7F');

  return (
    <Flex
      bg={tagBg}
      color={tagTextColor}
      alignItems="center"
      height="26px"
      px={3}
      borderRadius="full"
      gap={1.5}
      opacity={1}
      whiteSpace="nowrap"
    >
      <Box position="relative" display="flex" alignItems="center" justifyContent="center">
        <Icon as={LuTag} color={tagIconColor} boxSize="14px" strokeWidth={2} />
      </Box>

      <Text fontSize="12px" fontWeight="500" lineHeight="1">
        {label}
      </Text>
    </Flex>
  );
};
