// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Link as ChakraLink } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { skillMarkdownPreviewCss } from './SkillMarkdownPreview.styles';

interface SkillMarkdownPreviewProps {
  content: string;
}

export const SkillMarkdownPreview = ({ content }: SkillMarkdownPreviewProps) => {
  return (
    <Box w="100%" color="text.main" css={skillMarkdownPreviewCss}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => (
            <ChakraLink href={href} color="text.active" target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </ChakraLink>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};
