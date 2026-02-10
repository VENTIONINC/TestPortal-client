import { Box, Flex, Button, IconButton } from '@chakra-ui/react';
import { LuCheck, LuCopy } from 'react-icons/lu';

import { useSurfaceColors } from '@/theme/useSurfaceColors';

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
  const { surfaces, borders, text } = useSurfaceColors();

  if (variant === 'single') {
    return (
      <Flex align="center" gap={2} w="100%">
        <Box
          flex="1"
          px={3}
          py={2}
          bg={surfaces.card}
          border="1px solid"
          borderColor={borders.default}
          borderRadius="md"
          fontSize="sm"
          fontFamily="mono"
          color={text.primary}
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
          color={text.muted}
          _hover={{ color: text.primary, bg: surfaces.card }}
        >
          {copied ? <LuCheck /> : <LuCopy />}
        </IconButton>
      </Flex>
    );
  }

  return (
    <Flex flexDir="row" align="start" w="100%">
      <Box as="pre" fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap" color={text.primary}>
        {value}
      </Box>
      <Flex justify="space-between" align="center" mb={2}>
        <Button
          aria-label={copyAriaLabel}
          variant="ghost"
          size="xs"
          onClick={onCopy}
          color={text.muted}
          _hover={{ color: text.primary, bg: surfaces.card }}
        >
          {copied ? <LuCheck /> : <LuCopy />}
          Copy
        </Button>
      </Flex>
    </Flex>
  );
}
