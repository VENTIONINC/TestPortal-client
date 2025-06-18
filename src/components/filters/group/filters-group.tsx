import { Circle, HStack, StackProps, Text, VStack } from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';

interface FiltersGroupProps extends StackProps {
  title: string;
  clearable?: boolean;
  onClear?: () => void;
}

export const FiltersGroup = ({ title, clearable, onClear, children, ...props }: FiltersGroupProps) => {
  return (
    <VStack align="stretch" border="1px solid" borderColor="gray.400" borderRadius="md" p={4} {...props}>
      <HStack justify="space-between">
        <Text fontWeight={700} whiteSpace="nowrap">
          {title}
        </Text>

        {clearable && (
          <Circle p={1} bg="gray.100" cursor="pointer" onClick={onClear} _hover={{ bg: 'gray.200' }}>
            <LuX size={16} />
          </Circle>
        )}
      </HStack>
      {children}
    </VStack>
  );
};
