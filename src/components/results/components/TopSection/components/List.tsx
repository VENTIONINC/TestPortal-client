// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Text, VStack, HStack } from '@chakra-ui/react';

import { Tooltip } from '@/components/ui';
import type { IssueCategorySummary } from '@/types';
import { getIssueCategorySummaryPresentation } from '@/utils';

import { categoriesConfig } from '../configs/categories';

interface ListProps {
  results: { id?: string; title: string; count: number; categorySummary?: IssueCategorySummary }[];
  label: string;
  onClick: (message: string) => void;
  hideIcon?: boolean;
}

export const List = ({ results, label, onClick, hideIcon = false }: ListProps) => {
  return (
    <VStack align="stretch" flex={1} mt={4} px="3px" aria-label={label}>
      {results.map(({ id, title, count, categorySummary }, index) => {
        const summary = categorySummary ? getIssueCategorySummaryPresentation(categorySummary) : undefined;
        const config = categoriesConfig[summary?.category as keyof typeof categoriesConfig] || categoriesConfig.other;
        const { Icon, color, bg, textColor } = config;
        const summaryDetails = summary?.details.map(({ label: detailLabel, count: detailCount }) => `${detailLabel}: ${detailCount}`).join(', ');
        const summaryLabel = summary ? (summary.showMixed ? 'Mixed' : summary.category === null ? summary.label : undefined) : undefined;
        return (
          <HStack key={id ?? `${title}-${index}-${count}`} textStyle="md" gap={0}>
            <Tooltip content={summaryDetails} disabled={!summaryDetails}>
              <HStack fontWeight={700} borderRadius="40px" fontSize="xs" color={color} px={2} bg={bg} minW={hideIcon ? 6 : 8}>
                {!hideIcon && <Icon size={14} />}
                <Text fontSize="xs" fontWeight={700} color={textColor}>{count}</Text>
                {summaryLabel && <Text fontSize="xs" fontWeight={600} color={textColor}>{summaryLabel}</Text>}
              </HStack>
            </Tooltip>
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
