import { HStack, Spinner } from '@chakra-ui/react';
import { LuSparkles } from 'react-icons/lu';

import { Tooltip } from '@/components/ui';
import { useSurfaceColors } from '@/theme';

interface AnalyzeCategoryButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const AnalyzeCategoryButton = ({ onClick, isLoading }: AnalyzeCategoryButtonProps) => {
  const { borders, states } = useSurfaceColors();

  return (
    <Tooltip content="Categorize with AI">
      <HStack
        as="button"
        px={1}
        borderRadius="sm"
        border="1px solid"
        borderColor={borders.subtle}
        cursor={isLoading ? 'not-allowed' : 'pointer'}
        onClick={onClick}
        opacity={isLoading ? 0.5 : 1}
        pointerEvents={isLoading ? 'none' : 'auto'}
        _hover={{ bg: isLoading ? undefined : states.hoverSubtle }}
      >
        {isLoading ? <Spinner size="sm" /> : <LuSparkles size={16} />}
      </HStack>
    </Tooltip>
  );
};
