// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { ParameterForm } from '@/components/prompts/components/ParameterForm';
import type { PromptConfig } from '@/redux/apis/generatedApi';

const prompt: PromptConfig = { name: 'tms-workflow-assistant', title: 'TMS', description: 'TMS', category: 'analysis', parameters: {
  project_id: { type: 'string', required: false, description: 'Project' },
  task: { type: 'string', required: false, description: 'Task' },
  execution_mode: { type: 'string', required: false, description: 'Mode', enum: ['human_guided', 'client_executed'] },
} };
it('offers optional TMS task and exactly the three execution modes', async () => {
  const onChange = vi.fn();
  render(<ChakraProvider><ParameterForm prompt={prompt} values={{}} onChange={onChange} /></ChakraProvider>);
  const select = screen.getByRole('combobox');
  expect(select).toHaveValue('');
  expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['Not specified', 'Human guided', 'Client executed']);
  expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
  expect(screen.queryByText('Project Id')).not.toBeInTheDocument();
  await userEvent.selectOptions(select, 'client_executed');
  expect(onChange).toHaveBeenCalledWith('execution_mode', 'client_executed');
});
it('retains legacy text inputs', () => {
  render(<ChakraProvider><ParameterForm prompt={{ ...prompt, name: 'developer-code-assistant', parameters: { result_id: { type: 'string', required: false, description: 'Result ID' } } }} values={{}} onChange={vi.fn()} /></ChakraProvider>);
  expect(screen.getByRole('textbox').tagName).toBe('INPUT');
});
