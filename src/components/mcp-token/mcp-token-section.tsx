import { Box, Heading, Text, Flex, Button, VStack, HStack, Input } from '@chakra-ui/react';
import { LuCopy, LuTrash2 } from 'react-icons/lu';

import { toaster, InputGroup } from '@/components/ui';
import { copyToClipboard } from '@/utils';

import { useMCPKeys } from './hooks';

export function MCPTokenSection() {
  const { mcpToken, tokenExpiresAt, isRequestingToken, isRevokingToken, handleRequestToken, handleRevokeToken } =
    useMCPKeys();

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
    <Box bg="white" border="1px" borderColor="gray.200" borderRadius="md" shadow="md">
      <Box p={6} borderBottom="1px" borderColor="gray.200">
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="md">MCP Token</Heading>
            <Text color="gray.600" fontSize="sm" mt={1}>
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
              <Text fontWeight="semibold" mb={2}>
                Your MCP Token:
              </Text>
              <InputGroup
                endElement={
                  <Button size="sm" onClick={handleCopyToken} variant="ghost">
                    <LuCopy />
                  </Button>
                }
              >
                <Input value={mcpToken} readOnly fontFamily="mono" fontSize="sm" bg="gray.50" />
              </InputGroup>
            </Box>
            {tokenExpiresAt && (
              <Box>
                <Text fontSize="sm" color="gray.600">
                  <strong>Expires:</strong> {new Date(tokenExpiresAt).toLocaleString()}
                </Text>
              </Box>
            )}
            <Box p={4} bg="green.50" border="1px" borderColor="green.200" borderRadius="md">
              <Text fontWeight="bold" color="green.800">
                Token Ready
              </Text>
              <Text fontSize="sm" color="green.700" mt={1}>
                Copy this token and use it in your Claude desktop application to connect to the MCP server.
              </Text>
            </Box>
          </VStack>
        ) : (
          <Box p={4} bg="blue.50" border="1px" borderColor="blue.200" borderRadius="md">
            <Text fontWeight="bold" color="blue.800">
              MCP Token Generation
            </Text>
            <Text fontSize="sm" color="blue.700" mt={1}>
              Click the button above to generate your MCP token for use with Claude desktop application.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
