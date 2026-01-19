import { Circle, HStack, StackProps, Text, VStack } from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';

import { useColorModeValue } from '@/components/ui';
import { useSurfaceColors } from '@/theme';

interface FiltersGroupProps extends StackProps {
  title: string;
  clearable?: boolean;
  onClear?: () => void;
  actions?: React.ReactNode;
}

export const FiltersGroup = ({ title, clearable, onClear, children, actions, ...props }: FiltersGroupProps) => {
  const { borders, text, states } = useSurfaceColors();
  const clearBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <VStack align="stretch" border="1px solid" borderColor={borders.subtle} borderRadius="md" p={4} {...props}>
      <HStack justify="space-between">
        <Text fontWeight={700} whiteSpace="nowrap" color={text.primary}>
          {title}
        </Text>

        {clearable && (
          <Circle
            p={1}
            bg={clearBg}
            color={text.primary}
            cursor="pointer"
            onClick={onClear}
            _hover={{ bg: states.hoverSubtle }}
          >
            <LuX size={16} />
          </Circle>
        )}
        {actions}
      </HStack>
      {children}
    </VStack>
  );
};
