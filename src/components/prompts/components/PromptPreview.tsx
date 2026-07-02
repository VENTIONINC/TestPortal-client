// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo } from 'react';
import { Box, Code, Heading, HStack, Spinner, Text, VStack } from '@chakra-ui/react';

import { CopyButton } from './CopyButton';

interface PromptPreviewProps {
  prompt?: string;
  isGenerating?: boolean;
  error?: string;
}

export const PromptPreview = memo(function PromptPreview({ prompt, isGenerating, error }: PromptPreviewProps) {
  return (
    <VStack align="stretch" gap={4}>
      <HStack justify="space-between" align="center">
        <Heading size="md" color="text.main">
          Generated Prompt
        </Heading>
        {prompt && !isGenerating && <CopyButton text={prompt} />}
      </HStack>

      <Box
        border="1px solid"
        borderColor="border.main"
        borderRadius="md"
        bg="bg.panel"
        p={4}
        minHeight="200px"
        position="relative"
      >
        {isGenerating && (
          <VStack justify="center" align="center" height="100%" minHeight="150px">
            <Spinner size="lg" />
            <Text color="text.muted">Generating prompt...</Text>
          </VStack>
        )}

        {error && (
          <VStack justify="center" align="center" height="100%" minHeight="150px">
            <Text color="status.error.text" textAlign="center">
              {error}
            </Text>
          </VStack>
        )}

        {prompt && !isGenerating && !error && (
          <Code
            display="block"
            whiteSpace="pre-wrap"
            wordBreak="break-word"
            fontSize="sm"
            lineHeight="relaxed"
            bg="transparent"
            color="text.main"
            p={0}
            border="none"
          >
            {prompt}
          </Code>
        )}

        {!prompt && !isGenerating && !error && (
          <VStack justify="center" align="center" height="100%" minHeight="150px">
            <Text color="text.muted" textAlign="center">
              Fill in the parameters above to generate your prompt
            </Text>
          </VStack>
        )}
      </Box>

      {prompt && !isGenerating && (
        <VStack align="start" gap={2} fontSize="sm" color="text.muted">
          <Text fontWeight="medium" color="text.main">
            Usage Instructions:
          </Text>
          <Text>1. Copy the generated prompt above</Text>
          <Text>2. Paste it into your agentic IDE (Claude Code, Cursor, etc.)</Text>
          <Text>3. The assistant will use this context to help with your specific needs</Text>
        </VStack>
      )}
    </VStack>
  );
});
