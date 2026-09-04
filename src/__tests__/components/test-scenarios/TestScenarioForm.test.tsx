// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TestScenarioForm } from '@/components/test-scenarios/components/TestScenarioForm';
import { ChakraProvider } from '@/components/ui';

const initialValues = { title: 'Checkout flow', contentMd: '# Checkout flow\n\n  exact source  \n' };

const renderForm = (props: Partial<React.ComponentProps<typeof TestScenarioForm>> = {}) =>
  render(
    <ChakraProvider>
      <TestScenarioForm mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} {...props} />
    </ChakraProvider>,
  );

describe('TestScenarioForm', () => {
  it('shows source, preview, and create actions in create mode', () => {
    renderForm();

    expect(screen.getByRole('heading', { name: 'Create Test Scenario' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Source' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Preview' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Test Scenario' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('shows edit-specific heading and save action', () => {
    renderForm({ mode: 'edit', initialValues });

    expect(screen.getByRole('heading', { name: 'Edit Test Scenario' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Test Scenario' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create Test Scenario' })).not.toBeInTheDocument();
  });

  it('keeps exact unsaved Markdown across preview and source modes', async () => {
    const user = userEvent.setup();
    const contentMd = '# Заголовок ✓\n\n```ts\n  const value = "  exact  ";\n```\n\n';

    renderForm({ initialValues: { title: '', contentMd: '' } });

    const markdown = screen.getByRole('textbox', { name: 'Markdown' });
    fireEvent.change(markdown, { target: { value: contentMd } });

    await user.click(screen.getByRole('tab', { name: 'Preview' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Заголовок ✓' })).toBeInTheDocument());

    await user.click(screen.getByRole('tab', { name: 'Source' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Markdown' })).toHaveValue(contentMd));
  });

  it('does not submit invalid empty values and displays client validation', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderForm({ onSubmit });
    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Markdown content is required')).toBeInTheDocument();
  });

  it('keeps editable values when API feedback is displayed', () => {
    renderForm({ initialValues, apiError: 'The scenario could not be saved.' });

    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue(initialValues.title);
    expect(screen.getByRole('textbox', { name: 'Markdown' })).toHaveValue(initialValues.contentMd);
    expect(screen.getByRole('alert')).toHaveTextContent('The scenario could not be saved.');
  });

  it('resets from a newly persisted response and disables pending actions', async () => {
    const { rerender } = renderForm({ initialValues });

    rerender(
      <ChakraProvider>
        <TestScenarioForm
          mode="edit"
          initialValues={{ title: 'Normalized title', contentMd: initialValues.contentMd }}
          isSubmitting
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </ChakraProvider>,
    );

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Normalized title'));
    expect(screen.getByRole('button', { name: 'Save Test Scenario' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
