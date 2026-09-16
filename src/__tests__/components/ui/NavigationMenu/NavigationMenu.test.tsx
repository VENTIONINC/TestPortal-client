// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { NavigationMenu } from '@/components/ui/components/NavigationMenu/NavigationMenu';

describe('NavigationMenu', () => {
  it.each([
    ['Dashboard', '/dashboard'],
    ['Results', '/results'],
    ['Issues', '/issues'],
    ['Test Scenarios', '/test-scenarios'],
    ['Prompts', '/prompts'],
    ['Skills', '/skills'],
    ['Settings', '/settings'],
  ])('renders %s as a link to %s', (label, path) => {
    render(
      <ChakraProvider>
        <MemoryRouter>
          <NavigationMenu collapsed={false} />
        </MemoryRouter>
      </ChakraProvider>,
    );

    expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', path);
  });

  it('marks Test Scenarios active on its route', () => {
    render(
      <ChakraProvider>
        <MemoryRouter initialEntries={['/test-scenarios']}>
          <NavigationMenu collapsed={false} />
        </MemoryRouter>
      </ChakraProvider>,
    );

    expect(screen.getByRole('link', { name: 'Test Scenarios' })).toHaveAttribute('aria-current', 'page');
  });
});
