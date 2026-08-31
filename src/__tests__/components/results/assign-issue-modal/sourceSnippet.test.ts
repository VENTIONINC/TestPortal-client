// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  codeToTokens: vi.fn(),
  copyToClipboard: vi.fn(),
  createToast: vi.fn(),
}));

vi.mock('@shikijs/core', () => ({
  createBundledHighlighter: vi.fn(() => () => ({})),
  createSingletonShorthands: vi.fn(() => ({ codeToTokens: mocks.codeToTokens })),
}));

vi.mock('@shikijs/engine-javascript', () => ({ createJavaScriptRegexEngine: vi.fn() }));

vi.mock('@/utils', () => ({ copyToClipboard: mocks.copyToClipboard }));

vi.mock('@/components/ui', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/components/ui')>();
  return {
    ...original,
    toaster: { create: mocks.createToast },
    useColorModeValue: <T,>(light: T) => light,
  };
});

import { ChakraProvider } from '@/components/ui';
import { SourceSnippet, getSnippetLanguage, stripAnsi } from '@/components/results/assign-issue-modal/sourceSnippet';

const snippet = {
  path: '/tests/checkout.spec.ts',
  text: '\u001b[31mthrow new Error("failed")\u001b[39m\nreturn true;',
  startLine: 47,
  failingLine: 47,
};

const renderSnippet = (value = snippet) => render(createElement(ChakraProvider, null, createElement(SourceSnippet, { snippet: value })));

describe('source snippet helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removes Playwright ANSI formatting without changing source lines', () => {
    expect(stripAnsi('\u001b[0m \u001b[90m47 |\u001b[39m \u001b[31mthrow new Error()\u001b[0m')).toBe(' 47 | throw new Error()');
  });

  it('removes OSC terminal control sequences', () => {
    expect(stripAnsi('\u001b]8;;https://example.test\u0007open\u001b]8;;\u0007')).toBe('open');
  });

  it('infers a Shiki language from a snippet path and falls back to plain text', () => {
    expect(getSnippetLanguage('/tests/checkout.spec.ts')).toBe('typescript');
    expect(getSnippetLanguage('/tmp/example.py')).toBe('python');
    expect(getSnippetLanguage('/tmp/output.unknown')).toBe('text');
  });

  it('renders cleaned, syntax-highlighted source with numbered and emphasized failing line', async () => {
    mocks.codeToTokens.mockResolvedValue({
      tokens: [[{ content: 'throw', color: '#ff0000' }, { content: ' new Error("failed")' }], [{ content: 'return true;' }]],
    });

    const { container } = renderSnippet();

    expect(screen.getByRole('region', { name: 'Snippet content' })).toHaveStyle({ overflow: 'auto' });
    expect(screen.getByText('throw new Error("failed")')).toBeInTheDocument();
    expect(screen.queryByText(/\[31m/)).not.toBeInTheDocument();
    expect(screen.getByText('47').closest('[data-failing-line="true"]')).toBeInTheDocument();
    expect(screen.getByText('48')).toBeInTheDocument();

    await waitFor(() => expect(mocks.codeToTokens).toHaveBeenCalledWith('throw new Error("failed")\nreturn true;', {
      lang: 'typescript', theme: 'github-light',
    }));
    expect(container.querySelector('span[style*="rgb(255, 0, 0)"]')).toBeInTheDocument();
    expect(container.querySelector('[dangerouslySetInnerHTML]')).toBeNull();
  });

  it('falls back to plain text for unknown extensions without requesting Shiki', () => {
    renderSnippet({ ...snippet, path: '/tmp/playwright-output.unknown', text: 'raw <output>' });

    expect(screen.getByText('raw <output>')).toBeInTheDocument();
    expect(mocks.codeToTokens).not.toHaveBeenCalled();
  });

  it('copies cleaned source and reports a clipboard failure', async () => {
    mocks.copyToClipboard.mockRejectedValueOnce(new Error('blocked'));
    renderSnippet();

    fireEvent.click(screen.getByRole('button', { name: 'Copy snippet' }));

    await waitFor(() => expect(mocks.copyToClipboard).toHaveBeenCalledWith('throw new Error("failed")\nreturn true;'));
    await waitFor(() => expect(mocks.createToast).toHaveBeenCalledWith({ title: 'Failed to copy', type: 'error' }));
  });
});
