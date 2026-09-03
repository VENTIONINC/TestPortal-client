// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Collapsible, Flex, Text } from '@chakra-ui/react';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { useState } from 'react';

import { Tooltip } from '@/components/ui';
import type { IssueCategorySummary } from '@/types';
import { getIssueCategorySummaryPresentation } from '@/utils';

import { categoriesConfig } from '../configs/categories';
import { List } from './List';

interface CollapsibleWrapperProps {
  title: string;
  results: { id?: string; title: string; count: number; categorySummary?: IssueCategorySummary }[];
  handleClickToResult: (message: string) => void;
  hideIconList?: boolean;
}

export const CollapsibleWrapper = ({
  title,
  results,
  handleClickToResult,
  hideIconList = false,
}: CollapsibleWrapperProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const availableCategories = Array.from(
    new Set(
      results
        .map((result) => result.categorySummary && getIssueCategorySummaryPresentation(result.categorySummary).category)
        .filter(Boolean),
    ),
  ) as string[];
  return (
    <Collapsible.Root
      bg="bg.card"
      h={isOpen ? 'full' : 'auto'}
      p={4}
      borderRadius="xl"
      onOpenChange={() => setIsOpen(!isOpen)}
    >
      <Collapsible.Trigger asChild>
        <Flex align="center" minH="27px" pl="2px" justify="space-between">
          <Text fontWeight={600} cursor="pointer" fontSize="lg" lineClamp={1} flex={1} mr={2}>
            {title}
          </Text>
          {availableCategories.length > 0 && (
            <Flex gap={2} ml={2}>
              {availableCategories.map((category) => {
                const config = categoriesConfig[category as keyof typeof categoriesConfig] || categoriesConfig.other;
                const { Icon, color, bg, textColor, text } = config;

                return (
                  <Tooltip key={category} content={text}>
                    <Flex
                      align="center"
                      gap={1}
                      fontSize="2xs"
                      color={color}
                      bg={bg}
                      px={2}
                      py={0}
                      borderRadius="xl"
                      minH={6}
                    >
                      <Icon size={12} />
                      <Text fontSize="xs" color={textColor} fontWeight={600} display={{ base: 'none', md: 'block' }}>
                        {text}
                      </Text>
                    </Flex>
                  </Tooltip>
                );
              })}
            </Flex>
          )}
          {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </Flex>
      </Collapsible.Trigger>
      <Collapsible.Content h="full">
        <List results={results} hideIcon={hideIconList} label={title} onClick={handleClickToResult} />
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
