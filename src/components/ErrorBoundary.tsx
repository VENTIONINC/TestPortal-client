// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Component, ErrorInfo, ReactNode } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router';
import { Box, Button, Container, Heading, Text, VStack, Code, HStack, Link as ChakraLink } from '@chakra-ui/react';

import { useColorModeValue } from '@/components/ui';
import { PATHS } from '@/types/paths';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export function ErrorFallback({ error }: { error: Error | null }) {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const color = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const errorBg = useColorModeValue('red.50', 'red.900');
  const headingColor = useColorModeValue('red.500', 'red.300');
  const linkColor = useColorModeValue('blue.600', 'blue.300');

  return (
    <Box minH="100vh" bg={bg} display="flex" alignItems="center" justifyContent="center" p={4}>
      <Container
        maxW="md"
        bg={cardBg}
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        border="1px solid"
        borderColor={borderColor}
      >
        <VStack gap={6} align="stretch">
          <Box textAlign="center">
            <Heading size="xl" mb={2} color={headingColor}>
              Something went wrong
            </Heading>
            <Text color={color}>An unexpected error has occurred. Please try reloading the page.</Text>
          </Box>

          {error && (
            <Box p={4} bg={errorBg} borderRadius="md" fontSize="sm" overflowX="auto">
              <Code colorPalette="red" display="block" whiteSpace="pre-wrap">
                {error.message}
              </Code>
            </Box>
          )}

          <VStack gap={3} width="100%">
            <Button colorPalette="blue" width="100%" onClick={() => window.location.reload()}>
              Reload Page
            </Button>

            <HStack gap={6} justify="center" width="100%">
              <ChakraLink href={PATHS.ROOT} color={linkColor} textDecoration="underline">
                Home
              </ChakraLink>
              <ChakraLink href={PATHS.USER_SETTINGS} color={linkColor} textDecoration="underline">
                Settings
              </ChakraLink>
            </HStack>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}

export function RouterErrorFallback() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return <ErrorFallback error={new Error(`${error.status} ${error.statusText}`)} />;
  }

  if (error instanceof Error) {
    return <ErrorFallback error={error} />;
  }

  return <ErrorFallback error={new Error('Unknown error')} />;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
