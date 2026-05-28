// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Box, Flex, Button, IconButton } from '@chakra-ui/react';
import { LuCheck, LuCopy } from 'react-icons/lu';


export interface CopyableTextProps {
  value: string;
  variant?: 'single' | 'multi';
  copied?: boolean;
  onCopy?: () => void;
  copyAriaLabel?: string;
}

export function CopyableText({
  value,
  variant = 'multi',
  copied = false,
  onCopy,
  copyAriaLabel = 'Copy value',
}: CopyableTextProps) {

  if (variant === 'single') {
    return (
      <Flex align="center" gap={2} w="100%">
        <Box
          flex="1"
          px={3}
          py={2}
          bg="bg.card"
          border="1px solid"
          borderColor="border.main"
          borderRadius="md"
          fontSize="sm"
          fontFamily="mono"
          color="text.main"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          title={value}
        >
          {value}
        </Box>
        <IconButton
          aria-label={copyAriaLabel}
          variant="ghost"
          size="xs"
          onClick={onCopy}
          color="text.muted"
          _hover={{ color: "text.main", bg: "bg.card" }}
        >
          {copied ? <LuCheck /> : <LuCopy />}
        </IconButton>
      </Flex>
    );
  }

  return (
    <Flex flexDir="row" align="start" w="100%">
      <Box as="pre" fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap" color="text.main">
        {value}
      </Box>
      <Flex justify="space-between" align="center" mb={2}>
        <Button
          aria-label={copyAriaLabel}
          variant="ghost"
          size="xs"
          onClick={onCopy}
          color="text.muted"
          _hover={{ color: "text.main", bg: "bg.card" }}
        >
          {copied ? <LuCheck /> : <LuCopy />}
          Copy
        </Button>
      </Flex>
    </Flex>
  );
}
