import { Box, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';

import { MCPTokenSection } from '@/components/mcp-token';
import { toaster, Section } from '@/components/ui';
import { CopyableText } from '@/components/ui/components';
import { useSurfaceColors } from '@/theme/useSurfaceColors';
import { copyToClipboard } from '@/utils';

import { mpcConfigString } from './configs';

export function MCPSettings() {
  const { text, alerts } = useSurfaceColors();
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

      <Section.Root>
        <Section.Head>Claude Desktop Configuration</Section.Head>
        <Section.Description>
          <Text fontSize="sm" color={text.muted}>
            To use your MCP token with Claude Desktop, add the following configuration to your Claude config file:
          </Text>
        </Section.Description>

        <Section.Body>
          <VStack align="start" gap={4}>
            <Section.Card p={4}>
              <CopyableText
                value={mpcConfigString}
                variant="multi"
                copied={copied}
                onCopy={handleCopy}
                copyAriaLabel="Copy configuration"
              />
            </Section.Card>

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
        </Section.Body>
      </Section.Root>
    </VStack>
  );
}
