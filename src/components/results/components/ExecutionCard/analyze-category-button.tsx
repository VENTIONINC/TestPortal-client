// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { HStack, Spinner } from '@chakra-ui/react';
import { LuSparkles } from 'react-icons/lu';

import { Tooltip } from '@/components/ui';

interface AnalyzeCategoryButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const AnalyzeCategoryButton = ({ onClick, isLoading }: AnalyzeCategoryButtonProps) => {

  return (
    <Tooltip content="Categorize with AI">
      <HStack
        as="button"
        px={1}
        borderRadius="sm"
        border="1px solid"
        borderColor="border.main"
        cursor={isLoading ? 'not-allowed' : 'pointer'}
        onClick={onClick}
        opacity={isLoading ? 0.5 : 1}
        pointerEvents={isLoading ? 'none' : 'auto'}
        _hover={{ bg: isLoading ? undefined : 'bg.hover' }}
      >
        {isLoading ? <Spinner size="sm" /> : <LuSparkles size={16} />}
      </HStack>
    </Tooltip>
  );
};
