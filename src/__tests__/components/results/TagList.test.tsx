// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { TagList } from '@/components/results/components/FloatingHeader/components/TagList';

describe('TagList', () => {
  it('keeps selected tags visible and removable while collapsed', () => {
    const handleTagClick = vi.fn();

    render(
      <ChakraProvider>
        <TagList
          availableTags={['L1', 'L2', 'L3', 'L4', 'L5', 'L6']}
          tagsValue={['L6']}
          handleTagClick={handleTagClick}
          isExpanded={false}
          onToggleExpand={vi.fn()}
        />
      </ChakraProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'L6' }));

    expect(handleTagClick).toHaveBeenCalledWith('L6');
    expect(screen.getByRole('button', { name: '+1' })).toBeInTheDocument();
  });
});
