// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TestScenarioForm } from '@/components/test-scenarios/components/TestScenarioForm';
import { ChakraProvider } from '@/components/ui';

const initialValues = {
  title: 'Checkout flow',
  details: 'Existing scenario details',
  objective: 'Complete checkout',
  preconditions: 'Signed in',
  testData: 'Account 1',
  expectedResult: 'Order exists',
  notes: 'Keep an eye on totals',
};

const renderForm = (props: Partial<React.ComponentProps<typeof TestScenarioForm>> = {}) =>
  render(
    <ChakraProvider>
      <TestScenarioForm mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} {...props} />
    </ChakraProvider>,
  );

describe('TestScenarioForm', () => {
  it('renders structured fields and has no editable Markdown source', () => {
    renderForm();

    expect(screen.getByRole('heading', { name: 'Create Test Scenario' })).toBeInTheDocument();
    for (const label of ['Title', 'Details', 'Objective', 'Preconditions', 'Test data', 'Expected result', 'Notes']) {
      expect(screen.getByRole('textbox', { name: label })).toBeInTheDocument();
    }
    expect(screen.queryByRole('textbox', { name: 'Markdown' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Test Scenario' })).toBeInTheDocument();
  });

  it('initializes structured values without a Markdown preview in edit mode', () => {
    renderForm({ mode: 'edit', initialValues });

    expect(screen.getByRole('heading', { name: 'Edit Test Scenario' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Details' })).toHaveValue(initialValues.details);
    expect(screen.getByRole('textbox', { name: 'Objective' })).toHaveValue(initialValues.objective);
    expect(screen.queryByRole('heading', { name: 'Saved Markdown preview' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Markdown' })).not.toBeInTheDocument();
  });

  it('submits normalized structured values and no initial steps by default', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });

    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: '  Scenario  ' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Details' }), { target: { value: '  First\n  Second  ' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Objective' }), { target: { value: '  Objective  ' } });
    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      title: 'Scenario',
      details: 'First\n  Second',
      objective: 'Objective',
      preconditions: '',
      testData: '',
      expectedResult: '',
      notes: '',
    });
    expect(onSubmit.mock.calls[0]?.[1]).toEqual([]);
  });

  it('supports adding, editing, removing and reordering initial steps', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });

    await user.click(screen.getByRole('button', { name: 'Add step' }));
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Scenario');
    await user.type(screen.getByRole('textbox', { name: 'Step 1 action' }), 'Open checkout');
    await user.click(screen.getByRole('button', { name: 'Add step' }));
    await user.type(screen.getByRole('textbox', { name: 'Step 2 action' }), 'Submit order');
    await user.type(screen.getByRole('textbox', { name: 'Step 2 expected result' }), 'Order is created');

    await user.click(screen.getByRole('button', { name: 'Move step 2 up' }));
    expect(screen.getByRole('textbox', { name: 'Step 1 action' })).toHaveValue('Submit order');
    expect(screen.getByRole('textbox', { name: 'Step 2 action' })).toHaveValue('Open checkout');

    await user.click(screen.getByRole('button', { name: 'Remove step 1' }));
    expect(screen.getByRole('textbox', { name: 'Step 1 action' })).toHaveValue('Open checkout');

    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]?.[1]).toEqual([
      expect.objectContaining({ action: 'Open checkout', expectedResult: '' }),
    ]);
  });

  it('rejects blank step actions with field feedback and keeps drafts', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });

    await user.click(screen.getByRole('button', { name: 'Add step' }));
    await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Scenario');
    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Step action is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Step 1 action' })).toHaveValue('');
  });

  it('rejects blank titles and disables actions while pending', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const firstRender = renderForm({ onSubmit, isSubmitting: true });

    expect(screen.getByRole('button', { name: 'Create Test Scenario' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));
    expect(onSubmit).not.toHaveBeenCalled();

    firstRender.unmount();
    const { unmount } = renderForm({ onSubmit });
    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    unmount();
  });

  it('updates pristine values from a refreshed response while preserving an unrelated dirty field', async () => {
    const user = userEvent.setup();
    const { rerender } = renderForm({ mode: 'edit', initialValues });

    await user.type(screen.getByRole('textbox', { name: 'Notes' }), ' (draft)');
    rerender(
      <ChakraProvider>
        <TestScenarioForm
          mode="edit"
          initialValues={{ ...initialValues, objective: 'Persisted objective' }}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </ChakraProvider>,
    );

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Objective' })).toHaveValue('Persisted objective'));
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue('Keep an eye on totals (draft)');
  });
});
