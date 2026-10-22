// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Link as ChakraLink } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { markdownPreviewCss } from './MarkdownPreview.styles';

export interface MarkdownPreviewProps {
  content: string;
}

export const MarkdownPreview = ({ content }: MarkdownPreviewProps) => (
  <Box w="100%" color="text.main" css={markdownPreviewCss} data-testid="markdown-preview">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children, ...props }) => (
          <ChakraLink
            {...props}
            href={href}
            color="text.active"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </ChakraLink>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </Box>
);
