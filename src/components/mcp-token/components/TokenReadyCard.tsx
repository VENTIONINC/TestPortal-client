// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo, useCallback } from 'react';
import { Box, Text, Button, VStack, Input } from '@chakra-ui/react';
import { LuCopy } from 'react-icons/lu';

import { InputGroup } from '@/components/ui';

import { handleCopyToken } from '../utils';

interface TokenReadyCardProps {
  mcpToken: string;
  tokenExpiresAt: string | null;
}

export const TokenReadyCard = memo(function TokenReadyCard({ mcpToken, tokenExpiresAt }: TokenReadyCardProps) {
  const onCopy = useCallback(() => {
    handleCopyToken(mcpToken);
  }, [mcpToken]);

  return (
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
            <Button size="sm" onClick={onCopy} variant="ghost">
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
  );
});
