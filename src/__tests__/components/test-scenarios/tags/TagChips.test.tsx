// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TagChips } from '@/components/test-scenarios/tags/TagChips';
import { ChakraProvider } from '@/components/ui';

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ openDelay, content, children }: { openDelay: number; content: string; children: ReactNode }) =>
    <div data-content={content} data-delay={openDelay}>{children}</div>,
}));

describe('TagChips', () => {
  it('makes two visible tags and their overflow focusable with distinct tooltip content', () => {
    const tags = ['Alpha', 'Beta', 'Gamma', 'Delta'].map((name, i) => ({
      id: String(i), name, description: i === 1 ? 'Regression' : '',
    }));
    const { rerender } = render(<ChakraProvider><TagChips tags={tags} limit={2} /></ChakraProvider>);
    for (const [label, tooltip] of [['Alpha', 'Alpha'], ['Beta', 'Beta · Regression'], ['+2', 'Gamma, Delta']]) {
      const chip = screen.getByText(label);
      expect(chip.closest('[tabindex]')).toHaveAttribute('tabindex', '0');
      expect(chip.closest('[data-content]')).toHaveAttribute('data-content', tooltip);
      expect(chip.closest('[data-content]')).toHaveAttribute('data-delay', '500');
    }
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
    rerender(<ChakraProvider><TagChips tags={[]} limit={2} /></ChakraProvider>);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
