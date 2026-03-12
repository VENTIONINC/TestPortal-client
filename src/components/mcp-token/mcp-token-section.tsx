import { Box, Heading, Text, Flex, Button, VStack, HStack, Input, Card } from '@chakra-ui/react';
import { LuCopy, LuRefreshCw } from 'react-icons/lu';
import { IoClose } from 'react-icons/io5';

import { toaster, InputGroup, Section } from '@/components/ui';
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
    <Section.Root>
      <Section.Head>
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="md" color="text.main">
              MCP Token
            </Heading>
          </Box>
          <HStack>
            {mcpToken && (
              <Button variant="secondaryError" onClick={handleRevokeToken} disabled={isRevokingToken}>
                <IoClose />
                {isRevokingToken ? 'Revoking...' : 'Revoke'}
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleRequestToken}
              disabled={isRequestingToken}
              loading={isRequestingToken}
            >
              <LuRefreshCw />
              {mcpToken ? 'Regenerate Token' : 'Generate MCP Token'}
            </Button>
          </HStack>
        </Flex>
      </Section.Head>
      <Section.Description>Generate your Model Context Protocol token for Claude desktop</Section.Description>
      <Section.Card p={2}>
        {mcpToken ? (
          <VStack align="stretch" gap={4}>
            <Box p={4} bg="status.success.bg" border="1px" borderColor="status.success.text" borderRadius="md">
              <Text fontWeight="bold" color="status.success.text">
                Token Ready
              </Text>
              <Text fontSize="sm" color="status.success.text" mt={1}>
                Copy this token and use it in your Claude desktop application to connect to the MCP server.
              </Text>
            </Box>
            <Box>
              <Text fontWeight="semibold" mb={2} color="text.main">
                Your MCP Token:
              </Text>
              <InputGroup
                endElement={
                  <Button size="sm" onClick={handleCopyToken} variant="ghost">
                    <LuCopy />
                  </Button>
                }
              >
                <Input value={mcpToken} readOnly fontFamily="mono" fontSize="sm" bg="bg.page" />
              </InputGroup>
            </Box>
            {tokenExpiresAt && (
              <Box>
                <Text fontSize="sm" color="text.muted">
                  <strong>Expires:</strong> {new Date(tokenExpiresAt).toLocaleString()}
                </Text>
              </Box>
            )}
          </VStack>
        ) : (
          <Box p={4} bg="status.info.bg" border="1px" borderColor="status.info.text" borderRadius="md">
            <Text fontWeight="bold" color="status.info.text">
              MCP Token Generation
            </Text>
            <Text fontSize="sm" color="status.info.text" mt={1}>
              Click the button above to generate your MCP token for use with Claude desktop application.
            </Text>
          </Box>
        )}
      </Section.Card>
    </Section.Root>
  );
}
