import { Circle, StackProps, useDisclosure, VStack } from '@chakra-ui/react';
import { LuArrowBigLeft } from 'react-icons/lu';

export const FiltersContainer = ({ children, width, ...props }: StackProps) => {
  const { open, onToggle } = useDisclosure({ defaultOpen: true });

  return (
    <VStack
      h="100%"
      bg="bg.section"
      p="10px"
      maxW={open ? width : 0}
      pos="relative"
      transition="max-width 0.3s ease-in-out"
      {...props}
    >
      {/* <VStack
        gap={4}
        align="stretch"
        overflow="hidden"
        minW={width}
        opacity={open ? 1 : 0}
        transition="opacity 0.3s ease-in-out"
        pointerEvents={open ? 'auto' : 'none'}
      >
        {children}
      </VStack> */}
      {children}
      {/* <Circle
        onClick={onToggle}
        pos="absolute"
        top={-2}
        right={-4}
        bg="blue.600"
        color="white"
        p={1}
        cursor="pointer"
        _hover={{ bg: 'blue.700' }}
      >
        <LuArrowBigLeft
          onClick={onToggle}
          size={24}
          style={{
            transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.3s ease-in-out',
          }}
        />
      </Circle> */}
    </VStack>
  );
};
