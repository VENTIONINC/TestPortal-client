// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TestScenarioForm } from '@/components/test-scenarios/components/TestScenarioForm';
import { ChakraProvider } from '@/components/ui';

const initialValues = {
  scenarioKey: 'AUTH-LOGIN',
  title: 'Checkout flow',
  details: 'Existing scenario details',
  priority: 'high' as const,
  relatedIssueUrl: 'https://example.test/TP-20',
  preconditions: 'Signed in',
  testData: 'Account 1',

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

    expect(screen.queryByRole('heading', { name: 'Create Test Scenario' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Scenario fields' })).toBeInTheDocument();
    for (const label of [
      'Scenario key (optional)',
      'Title',
      'Details',
      'Related issue URL',
      'Preconditions',
      'Test data',

    ]) {
      expect(screen.getByRole('textbox', { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole('textbox', { name: 'Scenario key (optional)' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Scenario key (optional)' })).toHaveAttribute(
      'placeholder',
      'e.g. R1 or AUTH-LOGIN',
    );
    expect(screen.getByText('Up to 100 characters. Duplicate keys are allowed.')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Markdown' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Test Scenario' })).toBeInTheDocument();
  });

  it('initializes structured values without a Markdown preview in edit mode', () => {
    renderForm({ mode: 'edit', initialValues });

    expect(screen.getByRole('heading', { name: 'Edit Test Scenario' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Scenario key (optional)' })).toHaveValue(initialValues.scenarioKey);
    expect(screen.getByRole('textbox', { name: 'Details' })).toHaveValue(initialValues.details);
    expect(screen.getByRole('combobox', { name: 'Priority' })).toHaveValue(initialValues.priority);
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
    fireEvent.change(screen.getByRole('textbox', { name: 'Related issue URL' }), { target: { value: ' https://example.test/TP-20 ' } });
    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      scenarioKey: '',
      title: 'Scenario',
      details: 'First\n  Second',
      priority: '',
      relatedIssueUrl: 'https://example.test/TP-20',
      preconditions: '',
      testData: '',

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

    await user.type(screen.getByRole('textbox', { name: 'Test data' }), ' (draft)');
    rerender(
      <ChakraProvider>
        <TestScenarioForm
          mode="edit"
          initialValues={{ ...initialValues, scenarioKey: 'AUTH-LOGIN-2' }}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </ChakraProvider>,
    );

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Scenario key (optional)' })).toHaveValue('AUTH-LOGIN-2'));
    expect(screen.getByRole('textbox', { name: 'Test data' })).toHaveValue('Account 1 (draft)');
  });
  it.each(['create', 'edit'] as const)('shows TP-20 sections and metadata choices in %s mode', (mode) => {
    renderForm({ mode, initialValues });
    const fields = screen.getByRole('heading', { name: 'Scenario fields' });
    const setup = screen.getByRole('heading', { name: 'Test setup' });
    expect(fields.compareDocumentPosition(setup) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'Details' })).toBeInTheDocument();
    for (const name of ['Objective', 'Notes', 'Expected result']) expect(screen.queryByRole('textbox', { name })).not.toBeInTheDocument();
    expect(Array.from(screen.getByRole('combobox', { name: 'Priority' }).querySelectorAll('option')).map((option) => option.textContent)).toEqual(['Unset', 'Low', 'Medium', 'High']);
    if (mode === 'create') expect(setup.compareDocumentPosition(screen.getByRole('heading', { name: /Scenario steps/ })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
  it('keeps invalid URL drafts with field feedback and does not submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ initialValues, onSubmit });
    fireEvent.change(screen.getByRole('textbox', { name: 'Related issue URL' }), { target: { value: '/relative' } });
    await user.click(screen.getByRole('button', { name: 'Create Test Scenario' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Enter an absolute HTTP(S) URL')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Related issue URL' })).toHaveValue('/relative');
  });

});
