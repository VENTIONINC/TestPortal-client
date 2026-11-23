// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  it('uses the shared workspace with automatic key, Medium and three blank rows', () => {
    setup();
    expect(screen.queryByText('NEW SCENARIO')).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('New scenario');
    expect(screen.getByRole('button', { name: 'Priority' })).toHaveTextContent('Medium');
    expect(within(screen.getByRole('list', { name: 'Scenario steps' })).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('textbox', { name: 'Step 3 action' })).toHaveValue('');
    expect(screen.queryByRole('textbox', { name: /Scenario key/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Scenario fields')).not.toBeInTheDocument();
    expect(screen.queryByText('Test setup')).not.toBeInTheDocument();
    expect(screen.queryByText('History')).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Unset' })).not.toBeInTheDocument();
  });
  it('places scenario content and organization in separate card columns', () => {
    setup();
    const main = screen.getByTestId('scenario-card-main');
    const sidebar = screen.getByTestId('scenario-card-sidebar');
    expect(main).toContainElement(screen.getByRole('textbox', { name: 'Title' }));
    expect(main).toContainElement(screen.getByRole('textbox', { name: 'Step 1 action' }));
    expect(sidebar).toContainElement(screen.getByRole('button', { name: 'Scenario folder' }));
    expect(sidebar).toContainElement(screen.getByRole('button', { name: 'Priority' }));
    expect(sidebar).toContainElement(screen.getByRole('textbox', { name: 'Requirement or ticket' }));
  });
  it('shows the saved key in edit mode', () => {
    setup({ mode: 'edit', initialValues: { title: 'Saved', scenarioKey: 'TMS-1' } });
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('TMS-1');
  });
  it('provides separate navigation to the section and originating folder', async () => {
    const section = vi.fn(); const origin = vi.fn();
    setup({ originLabel: 'Checkout', onNavigateSection: section, onNavigateOrigin: origin });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Scenarios' }));
    await user.click(screen.getByRole('button', { name: 'Checkout' }));
    expect(section).toHaveBeenCalledOnce();
    expect(origin).toHaveBeenCalledOnce();
  });
  it('focuses and selects the clone title', async () => {
    setup({ initialValues: { title: 'Copy of Login' }, focusTitle: true });
    const title = screen.getByRole('textbox', { name: 'Title' }) as HTMLInputElement;
    await waitFor(() => expect(title).toHaveFocus());
    expect(title.selectionStart).toBe(0);
    expect(title.selectionEnd).toBe(title.value.length);
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
  it('finds a nested folder by full path and selects it with Enter', async () => {
    setup({ folders: [{ id: 'a', name: 'Payments', depth: 2, path: 'Account / Checkout / Payments' }] });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Scenario folder' }));
    const search = screen.getByRole('textbox', { name: 'Search folders' });
    fireEvent.change(search, { target: { value: 'Account / Checkout' } });
    expect(screen.getByRole('button', { name: 'Payments' })).toBeInTheDocument();
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(screen.getByRole('button', { name: 'Scenario folder' })).toHaveTextContent('Payments');
    await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Search folders' })).not.toBeInTheDocument());
  });
  it('shows no results when no folder matches', async () => {
    setup({ folders: [{ id: 'a', name: 'Account' }] });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Scenario folder' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Search folders' }), { target: { value: 'missing' } });
    expect(screen.getByText('No folders found.')).toBeInTheDocument();
  });
  it('closes the folder picker on Escape without changing the selection', async () => {
    const user = userEvent.setup();
    setup({ initialFolderId: 'a', folders: [{ id: 'a', name: 'Account' }] });
    await user.click(screen.getByRole('button', { name: 'Scenario folder' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Search folders' })).toHaveFocus());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Scenario folder' })).toHaveAttribute('aria-expanded', 'false'));
    expect(screen.getByRole('button', { name: 'Scenario folder' })).toHaveTextContent('Account');
  });
  it('marks the selected folder and allows selecting No folder', async () => {
    const user = userEvent.setup();
    setup({ initialFolderId: 'a', folders: [{ id: 'a', name: 'Account' }] });
    await user.click(screen.getByRole('button', { name: 'Scenario folder' }));
    expect(screen.getByRole('button', { name: 'Account' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'No folder' }));
    expect(screen.getByRole('button', { name: 'Scenario folder' })).toHaveTextContent('No folder');
  });
  it('closes the folder picker when its trigger is clicked again', async () => {
    const user = userEvent.setup();
    setup();
    const trigger = screen.getByRole('button', { name: 'Scenario folder' });
    await user.click(trigger);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Search folders' })).toHaveFocus());
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
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
  it('resets content after confirmed create-another while retaining organization', async () => {
    const onSubmit = vi.fn();
    const props = { initialFolderId: 'a', folders: [{ id: 'a', name: 'Account' }], initialValues: { title: 'First', priority: 'high' as const }, onSubmit };
    const view = setup(props);
    await userEvent.setup().click(screen.getByRole('checkbox', { name: 'Create another scenario' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save scenario' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][4]).toBe(true);
    view.rerender(<ChakraProvider><TestScenarioForm mode="create" onCancel={vi.fn()} {...props} createAnotherReset={{ token: 1, suites: [{ id: 'new-suite', name: 'Release' }] }} /></ChakraProvider>);
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('');
    expect(within(screen.getByRole('list', { name: 'Scenario steps' })).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Scenario folder' })).toHaveTextContent('Account');
    expect(screen.getByRole('button', { name: 'Priority' })).toHaveTextContent('High');
    expect(screen.getByRole('button', { name: 'Remove suite Release' })).toBeInTheDocument();
    expect(screen.getByText('Scenario created.')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Next' } });
    expect(screen.queryByText('Scenario created.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save scenario' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[1][3]).toEqual({ suiteIds: ['new-suite'], newSuites: [] });
  });
  it('toggles create-another on the first click after the confirmation appears', async () => {
    const user = userEvent.setup();
    const props = { initialValues: { title: 'First' }, onSubmit: vi.fn() };
    const view = setup(props);
    const checkbox = screen.getByRole('checkbox', { name: 'Create another scenario' });
    await user.click(checkbox);
    view.rerender(<ChakraProvider><TestScenarioForm mode="create" onCancel={vi.fn()} {...props} createAnotherReset={{ token: 1, suites: [] }} /></ChakraProvider>);
    expect(screen.getByText('Scenario created.')).toBeInTheDocument();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(screen.queryByText('Scenario created.')).not.toBeInTheDocument();
  });
  it('appends once with Enter and preserves Shift Enter and composition', async () => {
    setup();
    const expected = screen.getByRole('textbox', { name: 'Step 3 expected result' });
    fireEvent.keyDown(expected, { key: 'Enter', shiftKey: true });
    fireEvent.keyDown(expected, { key: 'Enter', isComposing: true });
    expect(screen.queryByRole('textbox', { name: 'Step 4 action' })).not.toBeInTheDocument();
    fireEvent.keyDown(expected, { key: 'Enter' });
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Step 4 action' })).toHaveFocus());
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Step 4 expected result' }), { key: 'Enter', repeat: true });
    expect(screen.queryByRole('textbox', { name: 'Step 5 action' })).not.toBeInTheDocument();
  });
  it('grows step fields to fit their contents', () => {
    setup();
    const action = screen.getByRole('textbox', { name: 'Step 1 action' });
    Object.defineProperty(action, 'scrollHeight', { configurable: true, value: 96 });
    fireEvent.change(action, { target: { value: 'A long\nmultiline action' } });
    expect(action).toHaveStyle({ height: '96px' });
  });
  it('grows scenario details to fit multiline content', () => {
    setup();
    const details = screen.getByRole('textbox', { name: 'Details' });
    Object.defineProperty(details, 'scrollHeight', { configurable: true, value: 96 });
    fireEvent.change(details, { target: { value: 'First line\nSecond line' } });
    expect(details).toHaveStyle({ height: '96px' });
  });
  it('shows the dragged row and insertion destination before dropping', () => {
    setup();
    const handle = screen.getByRole('button', { name: 'Reorder step 1' });
    const first = handle.closest('[data-step-key]') as HTMLElement;
    const third = screen.getByRole('button', { name: 'Reorder step 3' }).closest('[data-step-key]') as HTMLElement;
    const oldElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = () => third;
    fireEvent.pointerDown(handle, { pointerId: 1 });
    fireEvent.pointerMove(handle, { pointerId: 1 });
    expect(first).toHaveAttribute('data-dragging', 'true');
    expect(third).toHaveAttribute('data-drop-target', 'true');
    fireEvent.pointerUp(handle, { pointerId: 1 });
    document.elementFromPoint = oldElementFromPoint;
    expect(screen.getByRole('status')).toHaveTextContent('Step moved to position 3 of 3');
  });
  it('uses the latest pointer target even when move and release are batched', () => {
    setup();
    fireEvent.change(screen.getByRole('textbox', { name: 'Step 1 action' }), { target: { value: 'First' } });
    const handle = screen.getByRole('button', { name: 'Reorder step 1' });
    const third = screen.getByRole('button', { name: 'Reorder step 3' }).closest('[data-step-key]') as HTMLElement;
    const oldElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = () => third;
    act(() => {
      fireEvent.pointerDown(handle, { pointerId: 1 });
      fireEvent.pointerMove(handle, { pointerId: 1 });
      fireEvent.pointerUp(handle, { pointerId: 1 });
    });
    document.elementFromPoint = oldElementFromPoint;
    expect(screen.getByRole('textbox', { name: 'Step 3 action' })).toHaveValue('First');
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
