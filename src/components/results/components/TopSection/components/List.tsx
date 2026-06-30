// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Text, VStack, HStack } from '@chakra-ui/react';

import { categoriesConfig } from '../configs/categories';

interface ListProps {
  results: { title: string; count: number; category?: string }[];
  label: string;
  onClick: (message: string) => void;
  hideIcon?: boolean;
}

export const List = ({ results, label, onClick, hideIcon = false }: ListProps) => {
  return (
    <VStack align="stretch" flex={1} mt={4} px="3px" aria-label={label}>
      {results.map(({ title, count, category }, index) => {
        const config = categoriesConfig[category as keyof typeof categoriesConfig] || categoriesConfig.Other;
        const { Icon, color, bg, textColor } = config;
        return (
          <HStack key={`${title}-${index}-${count}`} textStyle="md" gap={0}>
            <HStack
              fontWeight={700}
              borderRadius="40px"
              fontSize="xs"
              color={color}
              px={2}
              // py="2px"
              bg={bg}
              minW={hideIcon ? 6 : 8}
              // minH={10}
              // gap={1}
            >
              {!hideIcon && <Icon size={14} />}

              <Text fontSize="xs" fontWeight={700} color={textColor}>
                {count}
              </Text>
            </HStack>
            <HStack flex={1} justify="space-between">
              <Text
                onClick={() => onClick(title)}
                lineClamp={1}
                fontWeight={400}
                cursor="pointer"
                _hover={{ textDecoration: 'underline' }}
                fontSize="sm"
                color="text.main"
                ml={4}
              >
                {title}
              </Text>
            </HStack>
          </HStack>
        );
      })}
    </VStack>
  );
};
