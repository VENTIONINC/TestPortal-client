// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { TestScenarioForm } from '@/components/test-scenarios/components/TestScenarioForm';
import { ChakraProvider } from '@/components/ui';
const setup = (props: Partial<React.ComponentProps<typeof TestScenarioForm>> = {}) =>
  render(
    <ChakraProvider>
      <TestScenarioForm mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} {...props} />
    </ChakraProvider>,
  );
describe('TestScenarioForm', () => {
  beforeEach(() => {
    // user-event installs a getter; Chakra's focus tracker also wraps this method.
    userEvent.setup();
    Object.defineProperty(HTMLElement.prototype, 'focus', {
      configurable: true,
      writable: true,
      value: HTMLElement.prototype.focus,
    });
  });
  it('keeps a new step independent of a pre-existing draft key', async () => {
    setup({ initialSteps: [{ key: 'draft-1', action: '', expectedResult: '' }] });
    fireEvent.click(screen.getByRole('button', { name: 'Add step' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Step 1 action' }), { target: { value: 'Open' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Step 1 expected result' }), { target: { value: 'Done' } });
    expect(screen.getByRole('textbox', { name: 'Step 2 action' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Step 2 expected result' })).toHaveValue('');
  });
  it('uses the shared workspace with automatic key, Medium and one blank row', () => {
    setup();
    expect(screen.getByText('NEW SCENARIO')).toBeInTheDocument();
    expect(screen.getByText('On save')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Priority' })).toHaveTextContent('Medium');
    expect(screen.getByRole('heading', { name: 'Steps 1' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /Scenario key/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Scenario fields')).not.toBeInTheDocument();
    expect(screen.queryByText('Test setup')).not.toBeInTheDocument();
    expect(screen.queryByText('History')).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Unset' })).not.toBeInTheDocument();
  });
  it('filters folders and saves the selected folder and priority', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    setup({ initialValues: { title: 'Scenario' }, folders: [{ id: 'a', name: 'Account' }, { id: 'b', name: 'Checkout' }], onSubmit });
    await user.click(screen.getByRole('button', { name: 'Scenario folder' }));
    const folderSearch = screen.getByRole('textbox', { name: 'Search folders' });
    await waitFor(() => expect(folderSearch).toHaveFocus());
    await user.type(folderSearch, 'check');
    expect(screen.queryByRole('button', { name: 'Account' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Checkout' }));
    await user.click(screen.getByRole('button', { name: 'Priority' }));
    await user.click(screen.getByRole('button', { name: 'High' }));
    await user.click(screen.getByRole('button', { name: 'Save scenario' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0].priority).toBe('high');
    expect(onSubmit.mock.calls[0][2]).toBe('b');
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
  it('selects suites by UUID and permits a draft suite to reuse an existing name', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    setup({
      initialValues: { title: 'Scenario' },
      suites: [
        { id: 'a', name: 'Alpha', members: [{}, {}] },
        { id: 'b', name: 'Beta', members: [] },
      ],
      onSubmit,
    });
    await user.click(screen.getByRole('button', { name: 'Select suites' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Find or create a suite' })).toHaveFocus());
    await user.click(screen.getByRole('button', { name: /Alpha/ }));
    await user.click(screen.getByRole('button', { name: 'Select suites' }));
    await user.click(screen.getByRole('button', { name: /Beta/ }));
    await user.click(screen.getByRole('button', { name: 'Select suites' }));
    const search = screen.getByRole('textbox', { name: 'Find or create a suite' });
    fireEvent.change(search, { target: { value: 'alpha' } });
    expect(screen.getByRole('button', { name: 'Create suite “alpha”' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create suite “alpha”' }));
    expect(screen.getByRole('button', { name: 'Remove suite alpha' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove suite alpha' }));
    await user.click(screen.getByRole('button', { name: 'Select suites' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Find or create a suite' }), { target: { value: 'Pending' } });
    await user.click(screen.getByRole('button', { name: 'Create suite “Pending”' }));
    await user.click(screen.getByRole('button', { name: 'Remove suite Pending' }));
    await user.click(screen.getByRole('button', { name: 'Select suites' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Find or create a suite' }), { target: { value: 'Release' } });
    await user.click(screen.getByRole('button', { name: 'Create suite “Release”' }));
    expect(screen.getByText('Release')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Select suites' })).toHaveFocus());
    await user.click(screen.getByRole('button', { name: 'Save scenario' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][3]).toEqual({ suiteIds: ['a', 'b'], newSuites: [{ name: 'Release' }] });
  });
  it('selects one of two same-name suites by its UUID', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    setup({
      initialValues: { title: 'Scenario' },
      suites: [
        { id: 'aaaaaaaa-one', name: 'Alpha', members: [] },
        { id: 'bbbbbbbb-two', name: 'Alpha', members: [] },
      ],
      onSubmit,
    });
    await user.click(screen.getByRole('button', { name: 'Select suites' }));
    await user.click(screen.getByRole('button', { name: /Alpha.*suite bbbbbbbb/ }));
    await user.click(screen.getByRole('button', { name: 'Save scenario' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][3]).toEqual({ suiteIds: ['bbbbbbbb-two'], newSuites: [] });
  });
  it('never submits the scenario when Enter is pressed in suite search', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    setup({ initialValues: { title: 'Ready' }, onSubmit });
    await user.click(screen.getByRole('button', { name: 'Select suites' }));
    const search = screen.getByRole('textbox', { name: 'Find or create a suite' });
    fireEvent.change(search, { target: { value: 'Deferred' } });
    expect(fireEvent.keyDown(search, { key: 'Enter' })).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it('prevents suite selection and creation when a save starts with the picker open', async () => {
    const user = userEvent.setup();
    const props = { initialValues: { title: 'Ready' }, suites: [{ id: 'a', name: 'Alpha' }] };
    const view = setup(props);
    await user.click(screen.getByRole('button', { name: 'Select suites' }));
    await user.type(screen.getByRole('textbox', { name: 'Find or create a suite' }), 'Al');
    view.rerender(<ChakraProvider><TestScenarioForm mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} {...props} isSubmitting /></ChakraProvider>);
    expect(screen.getByRole('textbox', { name: 'Find or create a suite' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Alpha/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Create suite “Al”' })).toBeDisabled();
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
