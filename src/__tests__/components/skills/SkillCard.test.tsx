// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { SkillCard } from '@/components/skills/components/SkillCard';

import { skillsFixture } from '../../fixtures/skills';

describe('SkillCard', () => {
  it('selects the persisted ID rather than the display name', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <SkillCard skill={skillsFixture[1]} onSelect={onSelect} />
      </ChakraProvider>,
    );

    await user.click(screen.getByText('View details'));

    expect(onSelect).toHaveBeenCalledWith('skill-custom-renamed');
    expect(onSelect).not.toHaveBeenCalledWith('testing-guide');
  });
});
