import { useState } from 'react';
import { Box, Flex, IconButton, Text, VStack } from '@chakra-ui/react';
import { LuCheck, LuCopy } from 'react-icons/lu';

import { Dialog, DialogBody, DialogFooter, Tooltip, toaster } from '@/components/ui';
import { DefaultDialogProps, ResultError } from '@/types';
import { copyToClipboard } from '@/utils';

interface DialogCodeSectionProps {
  title: string;
  value: string;
}

const DialogCodeSection = ({ title, value }: DialogCodeSectionProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(value);
      setCopied(true);
      toaster.create({
        title: 'Copied to clipboard',
        type: 'success',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toaster.create({
        title: 'Failed to copy',
        type: 'error',
      });
    }
  };

  return (
    <VStack
      align="stretch"
      w="full"
      border="1px solid"
      borderColor="border.muted"
      borderRadius="md"
      overflow="hidden"
      gap={0}
      bg="bg.subtle"
      transition="all 0.2s"
      _hover={{ borderColor: 'border.main', boxShadow: 'xs' }}
    >
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        px={3}
        py={1.5}
        bg="bg.panel"
        borderBottom="1px solid"
        borderColor="border.muted"
        userSelect="none"
      >
        <Text
          fontSize="10px"
          fontWeight="bold"
          color="fg.muted"
          letterSpacing="wider"
          textTransform="uppercase"
        >
          {title}
        </Text>
        <Tooltip content={copied ? 'Copied!' : `Copy ${title.toLowerCase()}`}>
          <IconButton
            aria-label={`Copy ${title}`}
            variant="ghost"
            size="xs"
            onClick={handleCopy}
            color="fg.muted"
            _hover={{ color: 'fg', bg: 'bg.hover' }}
            h="24px"
            w="24px"
          >
            {copied ? <LuCheck size={14} /> : <LuCopy size={14} />}
          </IconButton>
        </Tooltip>
      </Flex>
      <Box
        px={4}
        py={3}
        maxH="300px"
        overflowY="auto"
        bg="bg.input"
      >
        <Text
          fontFamily="mono"
          fontSize="xs"
          whiteSpace="pre-wrap"
          wordBreak="break-word"
          lineHeight="tall"
          color="fg"
        >
          {value}
        </Text>
      </Box>
    </VStack>
  );
};

interface ResultsErrorDialogProps extends DefaultDialogProps {
  resultError: ResultError | null;
}

export const ResultsErrorDialog = ({ resultError, closeDialog }: ResultsErrorDialogProps) => {
  return (
    <Dialog title="Results Error" onClose={closeDialog} size="lg">
      <DialogBody display="flex" flexDir="column" gap={5}>
        {resultError?.message && (
          <DialogCodeSection title="Error Message" value={resultError.message} />
        )}

        {resultError?.callLog && resultError.callLog.length > 0 && (
          <DialogCodeSection title="Call Log" value={resultError.callLog.join('\n')} />
        )}

        {resultError?.callStack && resultError.callStack.length > 0 && (
          <DialogCodeSection title="Call Stack" value={resultError.callStack.join('\n')} />
        )}
      </DialogBody>

      <DialogFooter></DialogFooter>
    </Dialog>
  );
};
