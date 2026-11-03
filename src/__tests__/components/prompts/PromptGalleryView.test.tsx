// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { PromptGalleryView } from '@/components/prompts/containers/PromptGalleryView';

vi.mock('@/components/prompts/hooks', () => ({
  usePromptGallery: () => ({ data: { prompts: [
    { name: 'tms-workflow-assistant', title: 'TMS Workflow Assistant', description: 'TMS', category: 'analysis', parameters: {} },
    { name: 'developer-code-assistant', title: 'Developer Code Analysis Assistant', description: 'Code', category: 'development', parameters: {} },
  ] }, isFetching: false }),
}));

it('opens the TMS builder while keeping existing prompts in the gallery', async () => {
  render(<ChakraProvider><MemoryRouter initialEntries={['/prompts']}><Routes>
    <Route path="/prompts" element={<PromptGalleryView />} />
    <Route path="/prompts/tms-workflow-assistant" element={<div>TMS builder route</div>} />
  </Routes></MemoryRouter></ChakraProvider>);
  expect(screen.getByText('Developer Code Analysis Assistant')).toBeInTheDocument();
  await userEvent.click(screen.getByText('TMS Workflow Assistant'));
  expect(screen.getByText('TMS builder route')).toBeInTheDocument();
});
