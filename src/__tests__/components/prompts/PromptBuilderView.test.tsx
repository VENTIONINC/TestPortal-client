// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { PromptBuilderView } from '@/components/prompts/containers/PromptBuilderView';

const state = vi.hoisted(() => ({ select: vi.fn() }));
vi.mock('@/components/prompts/hooks', () => ({ usePromptBuilder: () => ({
  prompt: { name: 'tms-workflow-assistant', parameters: {} }, isFetching: false, parameterValues: {}, validationErrors: {}, generatedPrompt: '', isGenerating: false,
  requiredFieldsEmpty: true, handleParameterChange: vi.fn(), handleGenerate: vi.fn(), isTms: true, activeProjects: [{ id: 'a', name: 'Alpha' }], projectsLoading: false, setSelectedProjectId: state.select,
}) }));
it('offers selection and blocks generation until a project is resolved', async () => {
  render(<ChakraProvider><MemoryRouter initialEntries={['/prompts/tms-workflow-assistant']}><Routes><Route path="/prompts/:name" element={<PromptBuilderView />} /></Routes></MemoryRouter></ChakraProvider>);
  expect(screen.getByRole('button', { name: /Generate Prompt/ })).toBeDisabled();
  await userEvent.selectOptions(screen.getByRole('combobox'), 'a');
  expect(state.select).toHaveBeenCalledWith('a');
});
