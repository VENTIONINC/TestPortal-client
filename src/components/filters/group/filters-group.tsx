import { Box, HStack, StackProps, Text, VStack, Button } from '@chakra-ui/react';

import { useSurfaceColors } from '@/theme';

interface FiltersGroupProps extends StackProps {
  title: string;
  handleSearch: () => void;
}

export const FiltersGroup = ({ title, children, handleSearch, ...props }: FiltersGroupProps) => {
  const { borders, text } = useSurfaceColors();

  return (
    <VStack
      w="100%"
      align="stretch"
      border="1px solid"
      p="16px 6px"
      mb="10px"
      borderColor={borders.subtle}
      borderRadius="md"
      {...props}
    >
      <HStack justify="space-between" pl="6px">
        <Text fontWeight={700} whiteSpace="nowrap" color={text.primary}>
          {title}
        </Text>
      </HStack>
      <Box mt={4} px={2}>
        {children}
      </Box>
      <Button variant="secondary" onClick={handleSearch}>
        Apply
      </Button>
    </VStack>
  );
};
