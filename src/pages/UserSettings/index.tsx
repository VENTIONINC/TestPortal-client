import { Box, Container, Heading, Text, Flex, Button, VStack } from '@chakra-ui/react';

import { AppHeader } from '@/components/AppHeader';

import { useMCPKeys } from './hooks';

export function UserSettingsPage() {
  const { isRequestingToken, handleRequestToken } = useMCPKeys();

  return (
    <Box minH="100vh" bg="gray.50">
      <AppHeader />
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200" px={6} py={4}>
        <Container maxW="6xl">
          <Box>
            <Heading size="lg">User Settings</Heading>
            <Text color="gray.600" fontSize="sm">
              Manage your account settings and API keys
            </Text>
          </Box>
        </Container>
      </Box>

      <Container maxW="4xl" py={8}>
        <VStack gap={6} align="stretch">
          <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" shadow="md">
            <Box p={6} borderBottom="1px" borderColor="gray.200">
              <Flex justify="space-between" align="center">
                <Box>
                  <Heading size="md">MCP Token</Heading>
                  <Text color="gray.600" fontSize="sm" mt={1}>
                    Generate your Model Context Protocol token
                  </Text>
                </Box>
                <Button colorScheme="blue" onClick={handleRequestToken} disabled={isRequestingToken}>
                  {isRequestingToken ? 'Generating...' : 'Generate MCP Token'}
                </Button>
              </Flex>
            </Box>
            <Box p={6}>
              <Box p={4} bg="blue.50" border="1px" borderColor="blue.200" borderRadius="md">
                <Text fontWeight="bold" color="blue.800">
                  MCP Token Generation
                </Text>
                <Text fontSize="sm" color="blue.700" mt={1}>
                  Click the button above to generate your MCP token. This feature will be fully available once the API
                  endpoint is implemented.
                </Text>
              </Box>
            </Box>
          </Box>

          <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" shadow="md">
            <Box p={6} borderBottom="1px" borderColor="gray.200">
              <Heading size="md">About MCP Tokens</Heading>
            </Box>
            <Box p={6}>
              <VStack align="start" gap={2}>
                <Text fontSize="sm" color="gray.600">
                  • MCP (Model Context Protocol) tokens allow you to interact with AI models through the MCP interface
                </Text>
                <Text fontSize="sm" color="gray.600">
                  • Keep your tokens secure and never share them publicly
                </Text>
                <Text fontSize="sm" color="gray.600">
                  • Tokens are used to authenticate your requests to the MCP API endpoints
                </Text>
                <Text fontSize="sm" color="gray.600">
                  • This feature will be available once the backend API is implemented
                </Text>
              </VStack>
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
