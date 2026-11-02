import userEvent from '@testing-library/user-event';
// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, Link, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';

import { ScenarioDraftNavigationGuard } from '@/components/test-scenarios/components/ScenarioDraftNavigationGuard';
import { TestScenarioForm } from '@/components/test-scenarios/components/TestScenarioForm';
import { ChakraProvider } from '@/components/ui';
const Editor = () => {
  const [dirty, setDirty] = useState(false);
  return (
    <>
      <ScenarioDraftNavigationGuard dirty={dirty} />
      <Link to="/other">Other page</Link>
      <TestScenarioForm mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} onDirtyChange={setDirty} />
    </>
  );
};
const setup = () => {
  const router = createMemoryRouter([
    { path: '/', element: <Editor /> },
    { path: '/other', element: <p>Destination</p> },
  ]);
  render(
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>,
  );
  return router;
};
beforeEach(() => {
  vi.restoreAllMocks();
});
describe('ScenarioDraftNavigationGuard', () => {
  it('keeps a pending suite draft when route departure is declined and discards on confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const router = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Select suites' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Find or create a suite' }), { target: { value: 'Pending' } });
    await userEvent.click(screen.getByRole('button', { name: 'Create suite “Pending”' }));
    fireEvent.click(screen.getByRole('link', { name: 'Other page' }));
    await waitFor(() => expect(confirm).toHaveBeenCalledOnce());
    expect(router.state.location.pathname).toBe('/');
    expect(screen.getByText('Pending')).toBeInTheDocument();
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole('link', { name: 'Other page' }));
    await screen.findByText('Destination');
    expect(router.state.location.pathname).toBe('/other');
  });
  it('guards project changes and clears listeners after unmount', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const view = render(<ScenarioDraftNavigationGuard dirty />);
    const event = new Event('testportal:project-change', { cancelable: true });
    expect(window.dispatchEvent(event)).toBe(false);
    expect(confirm).toHaveBeenCalledOnce();
    confirm.mockReturnValue(true);
    expect(window.dispatchEvent(new Event('testportal:project-change', { cancelable: true }))).toBe(true);
    view.unmount();
    expect(window.dispatchEvent(new Event('testportal:project-change', { cancelable: true }))).toBe(true);
  });
  it('allows clean route departures without asking', async () => {
    const confirm = vi.spyOn(window, 'confirm');
    setup();
    fireEvent.click(screen.getByRole('link', { name: 'Other page' }));
    await screen.findByText('Destination');
    expect(confirm).not.toHaveBeenCalled();
  });
});
