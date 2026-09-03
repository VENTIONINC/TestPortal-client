// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useNavigate } from 'react-router';
import { Box, Container, Heading, Text, Button, VStack, Flex } from '@chakra-ui/react';

import { Link, useColorModeValue } from '@/components/ui';
import { PATHS } from '@/types/paths';

export function NotFoundPage() {
  const navigate = useNavigate();

  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const shadow = useColorModeValue('lg', 'dark-lg');

  const titleColor = useColorModeValue('blue.500', 'blue.300');
  const descriptionColor = useColorModeValue('gray.600', 'gray.300');
  const linkColor = useColorModeValue('blue.600', 'blue.300');

  return (
    <Flex minH="100vh" bg={pageBg} px={4} align="center" justify="center">
      <Container maxW="md" p={0}>
        <Box
          bg={cardBg}
          borderRadius="lg"
          boxShadow={shadow}
          borderWidth="1px"
          borderColor={borderColor}
          p={8}
          w="100%"
          textAlign="center"
        >
          <VStack gap={8}>
            <Heading fontSize="9xl" fontWeight="bold" color={titleColor} lineHeight={1}>
              404
            </Heading>

            <Box>
              <Heading size="lg" mb={2}>
                Page not found
              </Heading>
              <Text color={descriptionColor}>Sorry, we couldn't find the page you're looking for.</Text>
            </Box>

            <Button colorScheme="blue" size="lg" w="100%" onClick={() => navigate(PATHS.ROOT)}>
              Go back home
            </Button>

            <Box w="100%">
              <Heading size="md" mb={3}>
                Popular pages
              </Heading>
              <VStack gap={2} align="center">
                <Link href={PATHS.RESULTS} color={linkColor} textDecoration="underline" fontWeight="medium">
                  Results
                </Link>
                <Link href={PATHS.ISSUES} color={linkColor} textDecoration="underline" fontWeight="medium">
                  Issues
                </Link>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Flex>
  );
}
