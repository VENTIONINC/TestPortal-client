// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { PromptPreview } from '@/components/prompts/components/PromptPreview';

const copy = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock('@/utils', async (original) => ({ ...await original<typeof import('@/utils')>(), copyToClipboard: copy }));
it('copies the exact current response and hides copy during errors', async () => {
  const text = 'Instructions for project 11111111-1111-4111-8111-111111111111\nNext step';
  const view = render(<ChakraProvider><PromptPreview prompt={text} /></ChakraProvider>);
  await userEvent.click(screen.getByRole('button', { name: 'Copy to Clipboard' }));
  expect(copy).toHaveBeenCalledWith(text);
  view.rerender(<ChakraProvider><PromptPreview prompt={text} error="Invalid prompt parameters" /></ChakraProvider>);
  expect(screen.queryByRole('button', { name: /Copy/ })).not.toBeInTheDocument();
  expect(screen.getByText('Invalid prompt parameters')).toBeInTheDocument();
});
