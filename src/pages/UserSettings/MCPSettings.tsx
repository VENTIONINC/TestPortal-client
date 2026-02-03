import { Box, Flex, Heading, IconButton, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { LuCheck, LuCopy } from 'react-icons/lu';

import { MCPTokenSection } from '@/components/mcp-token';
import { Card, toaster } from '@/components/ui';
import { useSurfaceColors } from '@/theme/useSurfaceColors';
import { copyToClipboard } from '@/utils';

import { mpcConfigString } from './configs';

export function MCPSettings() {
  const { surfaces, borders, text, alerts } = useSurfaceColors();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(mpcConfigString);
      setCopied(true);
      toaster.create({
        title: 'Copied!',
        description: 'Configuration copied to clipboard',
        type: 'success',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toaster.create({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        type: 'error',
      });
    }
  };

  return (
    <VStack gap={6} align="stretch">
      <MCPTokenSection />

      <Card.Root>
        <Card.Header>
          <Card.Title>Claude Desktop Configuration</Card.Title>
          <Card.Description>
            <Text fontSize="sm" color={text.muted}>
              To use your MCP token with Claude Desktop, add the following configuration to your Claude config file:
            </Text>
          </Card.Description>
        </Card.Header>

        <Card.Body>
          <VStack align="start" gap={4}>
            <Box p={4} bg={surfaces.page} borderRadius="md" border="1px" borderColor={borders.subtle} w="100%">
              <Flex justify="space-between" align="center" mb={2}>
                <IconButton
                  aria-label="Copy configuration"
                  variant="ghost"
                  size="xs"
                  onClick={handleCopy}
                  color={text.muted}
                  _hover={{ color: text.primary, bg: surfaces.card }}
                >
                  {copied ? <LuCheck /> : <LuCopy />}
                </IconButton>
              </Flex>
              <Box as="pre" fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap" color={text.primary}>
                {mpcConfigString}
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
        </Card.Body>
      </Card.Root>
      {/* <Box p={6} borderBottom="1px" borderColor={borders.subtle}>
          <Heading size="md" color={text.primary}>
            Claude Desktop Configuration
          </Heading>
        </Box> */}
      {/* <Box p={6}>
          <VStack align="start" gap={4}>
            <Text fontSize="sm" color={text.muted}>
              To use your MCP token with Claude Desktop, add the following configuration to your Claude config file:
            </Text>

            <Box p={4} bg={surfaces.page} borderRadius="md" border="1px" borderColor={borders.subtle} w="100%">
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="xs" color={text.muted} fontWeight="semibold">
                  Claude Desktop Configuration:
                </Text>
                <IconButton
                  aria-label="Copy configuration"
                  variant="ghost"
                  size="xs"
                  onClick={handleCopy}
                  color={text.muted}
                  _hover={{ color: text.primary, bg: surfaces.card }}
                >
                  {copied ? <LuCheck /> : <LuCopy />}
                </IconButton>
              </Flex>
              <Box as="pre" fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap" color={text.primary}>
                {mpcConfigString}
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
      </Card> */}
    </VStack>
  );
}
