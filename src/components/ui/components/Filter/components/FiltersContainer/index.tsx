import { StackProps, VStack } from '@chakra-ui/react';

export const FiltersContainer = ({ children, width, ...props }: StackProps) => {
  return (
    <VStack h="100%" bg="bg.section" px={2} py={1} w={width} pos="relative" overflow="hidden" {...props}>
      {children}
    </VStack>
  );
};
