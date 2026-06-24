// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo } from 'react';
import { Box, Heading, Flex, Button, HStack } from '@chakra-ui/react';
import { LuRefreshCw } from 'react-icons/lu';
import { IoClose } from 'react-icons/io5';

import { Section } from '@/components/ui';

interface TokenHeaderProps {
  hasToken: boolean;
  isRequestingToken: boolean;
  isRevokingToken: boolean;
  onRevoke: () => void;
  onRequest: () => void;
}

export const TokenHeader = memo(function TokenHeader({
  hasToken,
  isRequestingToken,
  isRevokingToken,
  onRevoke,
  onRequest,
}: TokenHeaderProps) {
  return (
    <Section.Head>
      <Flex justify="space-between" align="center">
        <Box>
          <Heading size="md" color="text.main">
            MCP Token
          </Heading>
        </Box>
        <HStack>
          {hasToken && (
            <Button variant="secondaryError" onClick={onRevoke} disabled={isRevokingToken}>
              <IoClose />
              {isRevokingToken ? 'Revoking...' : 'Revoke'}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onRequest}
            disabled={isRequestingToken}
            loading={isRequestingToken}
          >
            <LuRefreshCw />
            {hasToken ? 'Regenerate Token' : 'Generate MCP Token'}
          </Button>
        </HStack>
      </Flex>
    </Section.Head>
  );
});
