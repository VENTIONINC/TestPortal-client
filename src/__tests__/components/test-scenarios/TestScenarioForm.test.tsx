// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TestScenarioForm } from '@/components/test-scenarios/components/TestScenarioForm';
import { ChakraProvider } from '@/components/ui';
const setup = (props: Partial<React.ComponentProps<typeof TestScenarioForm>> = {}) =>
  render(
    <ChakraProvider>
      <TestScenarioForm mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} {...props} />
    </ChakraProvider>,
  );
describe('TestScenarioForm', () => {
  it('uses the shared workspace with automatic key, Medium and one blank row', () => {
    setup();
    expect(screen.getByText('NEW SCENARIO')).toBeInTheDocument();
    expect(screen.getByText('Assigned on save')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Priority' })).toHaveValue('medium');
    expect(screen.getByRole('heading', { name: 'Steps 1' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /Scenario key/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Scenario fields')).not.toBeInTheDocument();
    expect(screen.queryByText('Test setup')).not.toBeInTheDocument();
    expect(screen.queryByText('History')).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Unset' })).not.toBeInTheDocument();
  });
  it('omits a blank new row but validates an expected-only row and preserves all input', async () => {
    const onSubmit = vi.fn();
    setup({ onSubmit });
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: '  Scenario  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save scenario' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0].title).toBe('Scenario');
    expect(onSubmit.mock.calls[0][1]).toEqual([]);
    fireEvent.change(screen.getByRole('textbox', { name: 'Step 1 expected result' }), { target: { value: 'Result' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save scenario' }));
    await screen.findByText('Step action is required');
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox', { name: 'Step 1 expected result' })).toHaveValue('Result');
  });
  it('appends once with Enter and preserves Shift Enter and composition', async () => {
    setup();
    const expected = screen.getByRole('textbox', { name: 'Step 1 expected result' });
    fireEvent.keyDown(expected, { key: 'Enter', shiftKey: true });
    fireEvent.keyDown(expected, { key: 'Enter', isComposing: true });
    expect(screen.queryByText('Steps 2')).not.toBeInTheDocument();
    fireEvent.keyDown(expected, { key: 'Enter' });
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Step 2 action' })).toHaveFocus());
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Step 2 expected result' }), { key: 'Enter', repeat: true });
    expect(screen.queryByText('Steps 3')).not.toBeInTheDocument();
  });
  it('keeps row identities and content when keyboard reordered', async () => {
    const onSubmit = vi.fn();
    setup({
      mode: 'edit',
      initialValues: { title: 'Saved', scenarioKey: 'TMS-1' },
      initialSteps: [
        { key: 'a', id: 'a', action: 'First', expectedResult: '' },
        { key: 'b', id: 'b', action: 'Second', expectedResult: '' },
      ],
      onSubmit,
    });
    const handle = screen.getByRole('button', { name: 'Reorder step 2' });
    handle.focus();
    fireEvent.keyDown(handle, { key: ' ' });
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(screen.getByRole('status')).toHaveTextContent('Step moved to position 1 of 2');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Reorder step 1' })).toHaveFocus());
    expect(screen.getByRole('textbox', { name: 'Step 1 action' })).toHaveValue('Second');
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][1].map((s: { id: string }) => s.id)).toEqual(['b', 'a']);
  });
  it('restores the picked-up order on Escape', () => {
    setup({
      mode: 'edit',
      initialValues: { title: 'Saved' },
      initialSteps: [
        { key: 'a', id: 'a', action: 'First', expectedResult: '' },
        { key: 'b', id: 'b', action: 'Second', expectedResult: '' },
      ],
    });
    const handle = screen.getByRole('button', { name: 'Reorder step 2' });
    fireEvent.keyDown(handle, { key: ' ' });
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    fireEvent.change(screen.getByRole('textbox', { name: 'Step 1 action' }), { target: { value: 'Edited second' } });
    fireEvent.keyDown(handle, { key: 'Escape' });
    expect(screen.getByRole('textbox', { name: 'Step 1 action' })).toHaveValue('First');
    expect(screen.getByRole('textbox', { name: 'Step 2 action' })).toHaveValue('Edited second');
  });
  it('selects multiple suites, removes pending suite creation and rejects case-insensitive duplicates', async () => {
    const onSubmit = vi.fn();
    setup({
      initialValues: { title: 'Scenario' },
      suites: [
        { id: 'a', name: 'Alpha', members: [{}, {}] },
        { id: 'b', name: 'Beta', members: [] },
      ],
      onSubmit,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Select suites' }));
    expect(screen.getByRole('textbox', { name: 'Search or create suite' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: /Alpha/ }));
    fireEvent.click(screen.getByRole('button', { name: /Beta/ }));
    const search = screen.getByRole('textbox', { name: 'Search or create suite' });
    fireEvent.change(search, { target: { value: 'alpha' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create “alpha”' }));
    expect(screen.getByRole('alert')).toHaveTextContent('already exists');
    fireEvent.change(search, { target: { value: 'Pending' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create “Pending”' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove suite Pending' }));
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByRole('button', { name: 'Select suites' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Save scenario' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][3]).toEqual({ suiteIds: ['a', 'b'], newSuites: [] });
  });
  it('never submits the scenario when Enter is pressed in suite search', () => {
    const onSubmit = vi.fn();
    setup({ initialValues: { title: 'Ready' }, onSubmit });
    fireEvent.click(screen.getByRole('button', { name: 'Select suites' }));
    const search = screen.getByRole('textbox', { name: 'Search or create suite' });
    fireEvent.change(search, { target: { value: 'Deferred' } });
    expect(fireEvent.keyDown(search, { key: 'Enter' })).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it('warns on browser exit only for dirty draft data including pending suites', async () => {
    const view = setup();
    let event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Dirty' } });
    event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    view.unmount();
    event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
