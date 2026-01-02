import { Box, Heading, Text, Flex, Button, VStack, HStack, Input } from '@chakra-ui/react';
import { LuCopy, LuTrash2 } from 'react-icons/lu';

import { toaster, InputGroup } from '@/components/ui';
import { useSurfaceColors } from '@/theme/useSurfaceColors';
import { copyToClipboard } from '@/utils';

import { useMCPKeys } from './hooks';

export function MCPTokenSection() {
  const { mcpToken, tokenExpiresAt, isRequestingToken, isRevokingToken, handleRequestToken, handleRevokeToken } =
    useMCPKeys();
  const { surfaces, borders, text, alerts } = useSurfaceColors();

  const handleCopyToken = async () => {
    if (mcpToken) {
      try {
        await copyToClipboard(mcpToken);
        toaster.create({
          title: 'Token Copied',
          description: 'MCP token copied to clipboard',
          type: 'success',
        });
      } catch {
        toaster.create({
          title: 'Copy Failed',
          description: 'Unable to copy to clipboard',
          type: 'error',
        });
      }
    }
  };

  return (
    <Box bg={surfaces.card} border="1px" borderColor={borders.subtle} borderRadius="md" shadow="md">
      <Box p={6} borderBottom="1px" borderColor={borders.subtle}>
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="md" color={text.primary}>
              MCP Token
            </Heading>
            <Text color={text.muted} fontSize="sm" mt={1}>
              Generate your Model Context Protocol token for Claude desktop
            </Text>
          </Box>
          <HStack>
            {mcpToken && (
              <Button colorScheme="red" variant="outline" onClick={handleRevokeToken} disabled={isRevokingToken}>
                <LuTrash2 />
                {isRevokingToken ? 'Revoking...' : 'Revoke'}
              </Button>
            )}
            <Button colorScheme="blue" onClick={handleRequestToken} disabled={isRequestingToken}>
              {isRequestingToken ? 'Generating...' : mcpToken ? 'Regenerate Token' : 'Generate MCP Token'}
            </Button>
          </HStack>
        </Flex>
      </Box>
      <Box p={6}>
        {mcpToken ? (
          <VStack align="stretch" gap={4}>
            <Box>
              <Text fontWeight="semibold" mb={2} color={text.primary}>
                Your MCP Token:
              </Text>
              <InputGroup
                endElement={
                  <Button size="sm" onClick={handleCopyToken} variant="ghost">
                    <LuCopy />
                  </Button>
                }
              >
                <Input value={mcpToken} readOnly fontFamily="mono" fontSize="sm" bg={surfaces.page} />
              </InputGroup>
            </Box>
            {tokenExpiresAt && (
              <Box>
                <Text fontSize="sm" color={text.muted}>
                  <strong>Expires:</strong> {new Date(tokenExpiresAt).toLocaleString()}
                </Text>
              </Box>
            )}
            <Box p={4} bg={alerts.success.bg} border="1px" borderColor={alerts.success.border} borderRadius="md">
              <Text fontWeight="bold" color={alerts.success.text}>
                Token Ready
              </Text>
              <Text fontSize="sm" color={alerts.success.text} mt={1}>
                Copy this token and use it in your Claude desktop application to connect to the MCP server.
              </Text>
            </Box>
          </VStack>
        ) : (
          <Box p={4} bg={alerts.info.bg} border="1px" borderColor={alerts.info.border} borderRadius="md">
            <Text fontWeight="bold" color={alerts.info.text}>
              MCP Token Generation
            </Text>
            <Text fontSize="sm" color={alerts.info.text} mt={1}>
              Click the button above to generate your MCP token for use with Claude desktop application.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
