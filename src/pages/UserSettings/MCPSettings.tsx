import { Box, Heading, Text, VStack } from '@chakra-ui/react';

import { MCPTokenSection } from '@/components/mcp-token';
import { useSurfaceColors } from '@/theme/useSurfaceColors';

export function MCPSettings() {
  const { surfaces, borders, text, alerts } = useSurfaceColors();

  return (
    <VStack gap={6} align="stretch">
      <MCPTokenSection />

      <Box bg={surfaces.card} border="1px" borderColor={borders.subtle} borderRadius="md" shadow="md">
        <Box p={6} borderBottom="1px" borderColor={borders.subtle}>
          <Heading size="md" color={text.primary}>
            Claude Desktop Configuration
          </Heading>
        </Box>
        <Box p={6}>
          <VStack align="start" gap={4}>
            <Text fontSize="sm" color={text.muted}>
              To use your MCP token with Claude Desktop, add the following configuration to your Claude config file:
            </Text>

            <Box p={4} bg={surfaces.page} borderRadius="md" border="1px" borderColor={borders.subtle} w="100%">
              <Text fontSize="xs" color={text.muted} mb={2} fontWeight="semibold">
                Claude Desktop Configuration:
              </Text>
              <Box as="pre" fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap" color={text.primary}>
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
              <Text fontSize="sm" color={text.muted} fontWeight="semibold">
                Setup Instructions:
              </Text>
              <Text fontSize="sm" color={text.muted}>
                1. Copy your MCP token from above
              </Text>
              <Text fontSize="sm" color={text.muted}>
                2. Replace "YOUR_MCP_TOKEN_HERE" with your actual token in the AUTH_TOKEN environment variable
              </Text>
              <Text fontSize="sm" color={text.muted}>
                3. Save the configuration and restart Claude Desktop
              </Text>
              <Text fontSize="sm" color={text.muted}>
                4. The test-portal server will be available in your Claude conversations
              </Text>
            </VStack>

            <Box
              p={3}
              bg={alerts.warning.bg}
              border="1px"
              borderColor={alerts.warning.border}
              borderRadius="md"
              w="100%"
            >
              <Text fontSize="sm" color={alerts.warning.text} fontWeight="semibold">
                Security Note:
              </Text>
              <Text fontSize="sm" color={alerts.warning.text} mt={1}>
                Keep your MCP token secure and never share it publicly. Treat it like a password.
              </Text>
            </Box>
          </VStack>
        </Box>
      </Box>
    </VStack>
  );
}
