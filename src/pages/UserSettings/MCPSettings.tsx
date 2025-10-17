import { Box, Heading, Text, VStack } from '@chakra-ui/react';

import { MCPTokenSection } from '@/components/mcp-token';

export function MCPSettings() {
  return (
    <VStack gap={6} align="stretch">
      <MCPTokenSection />

      <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" shadow="md">
        <Box p={6} borderBottom="1px" borderColor="gray.200">
          <Heading size="md">Claude Desktop Configuration</Heading>
        </Box>
        <Box p={6}>
          <VStack align="start" gap={4}>
            <Text fontSize="sm" color="gray.600">
              To use your MCP token with Claude Desktop, add the following configuration to your Claude config
              file:
            </Text>

            <Box p={4} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200" w="100%">
              <Text fontSize="xs" color="gray.500" mb={2} fontWeight="semibold">
                Claude Desktop Configuration:
              </Text>
              <Box as="pre" fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap" color="gray.800">
                {`{
  "mcpServers": {
    "test-portal": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "${import.meta.env.VITE_API_URL}/api/v2/mcp",
        "--allow-http",
        "--header",
        "Authorization:\${AUTH_TOKEN}"
      ],
      "env": {
        "AUTH_TOKEN": "Bearer YOUR_MCP_TOKEN_HERE"
      }
    }
  }
}`}
              </Box>
            </Box>

            <VStack align="start" gap={2} w="100%">
              <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                Setup Instructions:
              </Text>
              <Text fontSize="sm" color="gray.600">
                1. Copy your MCP token from above
              </Text>
              <Text fontSize="sm" color="gray.600">
                2. Replace "YOUR_MCP_TOKEN_HERE" with your actual token in the AUTH_TOKEN environment variable
              </Text>
              <Text fontSize="sm" color="gray.600">
                3. Save the configuration and restart Claude Desktop
              </Text>
              <Text fontSize="sm" color="gray.600">
                4. The test-portal server will be available in your Claude conversations
              </Text>
            </VStack>

            <Box p={3} bg="amber.50" border="1px" borderColor="amber.200" borderRadius="md" w="100%">
              <Text fontSize="sm" color="amber.800" fontWeight="semibold">
                Security Note:
              </Text>
              <Text fontSize="sm" color="amber.700" mt={1}>
                Keep your MCP token secure and never share it publicly. Treat it like a password.
              </Text>
            </Box>
          </VStack>
        </Box>
      </Box>
    </VStack>
  );
}