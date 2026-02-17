import { StackProps, useDisclosure, VStack } from '@chakra-ui/react';

export const FiltersContainer = ({ children, width, ...props }: StackProps) => {
  const { open } = useDisclosure({ defaultOpen: true });

  return (
    <VStack
      h="100%"
      bg="bg.section"
      borderRadius="xl"
      p="8px 9px 10px 9px"
      maxW={open ? width : 0}
      pos="relative"
      transition="max-width 0.3s ease-in-out"
      {...props}
    >
      {children}
    </VStack>
  );
};
