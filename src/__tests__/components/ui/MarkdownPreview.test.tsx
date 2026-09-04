// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChakraProvider, MarkdownPreview } from '@/components/ui';

describe('MarkdownPreview', () => {
  it('renders GFM and hardens external links while escaping raw HTML', () => {
    render(
      <ChakraProvider>
        <MarkdownPreview content={'# Heading\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n[Docs](https://example.com)\n\n<span>raw</span>'} />
      </ChakraProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Heading' })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('<span>raw</span>')).toBeInTheDocument();
  });

  it('renders unordered and ordered Markdown lists with list semantics', () => {
    render(
      <ChakraProvider>
        <MarkdownPreview content={'- First bullet\n- Second bullet\n\n1. First step\n2. Second step'} />
      </ChakraProvider>,
    );

    expect(screen.getAllByRole('list').map((list) => list.tagName)).toEqual(['UL', 'OL']);
    expect(screen.getByText('First bullet')).toBeInTheDocument();
    expect(screen.getByText('First step')).toBeInTheDocument();
  });
});
