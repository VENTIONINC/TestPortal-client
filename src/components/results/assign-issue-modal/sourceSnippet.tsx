// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';
import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { createHighlighter } from 'shiki';
import { LuCheck, LuClipboard } from 'react-icons/lu';

import { Tooltip, toaster, useColorModeValue } from '@/components/ui';
import { copyToClipboard } from '@/utils';

export type SourceSnippetData = {
  path: string;
  text: string;
  startLine: number;
  failingLine: number;
};

type HighlightToken = { content: string; color?: string };

// eslint-disable-next-line no-control-regex -- Playwright embeds terminal ANSI escape sequences in snippets.
const ANSI_ESCAPE_PATTERN = new RegExp('[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d/#&.:=?%@~_]+)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))', 'g');
// eslint-disable-next-line no-control-regex -- OSC hyperlinks are emitted by terminals as ANSI escape sequences.
const OSC_ESCAPE_PATTERN = new RegExp('\\u001B\\][^\\u0007]*(?:\\u0007|\\u001B\\\\)', 'g');
const languageByExtension = {
  ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx', json: 'json', py: 'python',
  sh: 'bash', bash: 'bash', yml: 'yaml', yaml: 'yaml', css: 'css', html: 'html', md: 'markdown',
} as const;
const highlighter = createHighlighter({
  themes: ['github-light', 'github-dark'],
  langs: ['typescript', 'tsx', 'javascript', 'jsx', 'json', 'python', 'bash', 'yaml', 'css', 'html', 'markdown'],
});

export const stripAnsi = (value: string) => value.replace(OSC_ESCAPE_PATTERN, '').replace(ANSI_ESCAPE_PATTERN, '');

export const getSnippetLanguage = (path: string): (typeof languageByExtension)[keyof typeof languageByExtension] | 'text' => {
  const extension = path.split('.').pop()?.toLowerCase();
  return extension && extension in languageByExtension
    ? languageByExtension[extension as keyof typeof languageByExtension]
    : 'text';
};

const SourceLine = ({ line, lineNumber, failing }: { line: HighlightToken[]; lineNumber: number; failing: boolean }) => (
  <Flex
    bg={failing ? 'badge.error.bg' : undefined}
    color={failing ? 'badge.error.text' : 'text.primary'}
    minW="max-content"
    data-failing-line={failing ? 'true' : undefined}
  >
    <Text w="52px" px={3} textAlign="end" flexShrink={0} color={failing ? 'badge.error.text' : 'text.muted'}>
      {lineNumber}
    </Text>
    <Text as="code" px={3} whiteSpace="pre">
      {line.length === 0 ? ' ' : line.map((token, index) => <span key={`${index}-${token.content}`} style={{ color: token.color }}>{token.content}</span>)}
    </Text>
  </Flex>
);

export const SourceSnippet = ({ snippet }: { snippet: SourceSnippetData }) => {
  const [copied, setCopied] = useState(false);
  const cleanedText = useMemo(() => stripAnsi(snippet.text), [snippet.text]);
  const language = useMemo(() => getSnippetLanguage(snippet.path), [snippet.path]);
  const theme = useColorModeValue('github-light', 'github-dark');
  const [highlightedLines, setHighlightedLines] = useState<HighlightToken[][] | null>(null);

  useEffect(() => {
    let active = true;
    setHighlightedLines(null);
    if (language === 'text') return;
    void highlighter.then((instance) => instance.codeToTokens(cleanedText, { lang: language, theme })).then((result) => {
      if (active) setHighlightedLines(result.tokens as HighlightToken[][]);
    }).catch(() => {
      if (active) setHighlightedLines([]);
    });
    return () => { active = false; };
  }, [cleanedText, language, theme]);

  const lines = highlightedLines && highlightedLines.length > 0
    ? highlightedLines
    : cleanedText.split('\n').map((content) => [{ content }]);

  const copy = async () => {
    try {
      await copyToClipboard(cleanedText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toaster.create({ title: 'Failed to copy', type: 'error' });
    }
  };

  return (
    <Box borderWidth="1px" borderColor="border.main" borderRadius="md" overflow="hidden" bg="bg.input">
      <Flex align="center" justify="space-between" px={4} py={2} bg="bg.panel" borderBottomWidth="1px" borderColor="border.main">
        <Text fontSize="xs" color="text.secondary" truncate>{snippet.path}</Text>
        <Tooltip content={copied ? 'Copied' : 'Copy snippet'}>
          <IconButton aria-label="Copy snippet" size="xs" variant="ghost" onClick={() => void copy()}>
            {copied ? <LuCheck /> : <LuClipboard />}
          </IconButton>
        </Tooltip>
      </Flex>
      <Box role="region" aria-label="Snippet content" tabIndex={0} py={3} overflow="auto" fontFamily="mono" fontSize="xs">
        {lines.map((line, index) => {
          const lineNumber = snippet.startLine + index;
          return <SourceLine key={`${lineNumber}-${index}`} line={line} lineNumber={lineNumber} failing={lineNumber === snippet.failingLine} />;
        })}
      </Box>
    </Box>
  );
};
