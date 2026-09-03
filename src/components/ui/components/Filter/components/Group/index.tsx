// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, HStack, StackProps, Text, VStack, Button } from '@chakra-ui/react';

interface FiltersGroupProps extends StackProps {
  title: string;
  handleSearch: () => void;
}

export const FiltersGroup = ({ title, children, handleSearch, ...props }: FiltersGroupProps) => {
  return (
    <VStack
      w="100%"
      align="stretch"
      border="1px solid"
      bg="bg.cardSecondary"
      p="15px 7px"
      mb="8px"
      borderColor="border.secondary"
      borderRadius="lg"
      {...props}
    >
      <HStack justify="space-between" pl="8px">
        <Text fontSize="md" fontWeight={700} whiteSpace="nowrap" color="text.main">
          {title}
        </Text>
      </HStack>
      <Box mt={4} px={2} mb={1}>
        {children}
      </Box>
      <Button mx={2} variant="tertiary" onClick={handleSearch} _focusVisible={{ outline: 'none', boxShadow: 'none' }}>
        Apply
      </Button>
    </VStack>
  );
};
