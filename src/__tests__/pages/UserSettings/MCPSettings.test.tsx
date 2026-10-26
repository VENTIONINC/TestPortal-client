// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { MCPSettings } from '@/pages/UserSettings/MCPSettings';
import { copyToClipboard } from '@/utils';

const mocks = vi.hoisted(() => ({
  copyToClipboard: vi.fn(),
  toasterCreate: vi.fn(),
}));

vi.mock('@/utils', () => ({ copyToClipboard: mocks.copyToClipboard }));
vi.mock('@/components/mcp-token', () => ({
  MCPTokenSection: () => <div>Token controls</div>,
}));
vi.mock('@/components/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/ui')>();
  return { ...actual, toaster: { create: mocks.toasterCreate } };
});

const clientNames = ['Claude Code', 'Claude Desktop', 'Cursor', 'Codex'];

function renderSettings() {
  return render(
    <ChakraProvider>
      <MCPSettings />
    </ChakraProvider>,
  );
}

function getClientTrigger(name: string) {
  return screen.getByRole('button', { name });
}

function getConfiguration(name: string) {
  const trigger = getClientTrigger(name);
  const contentId = trigger.getAttribute('aria-controls');
  return (contentId ? document.getElementById(contentId)?.querySelector('pre')?.textContent : '') ?? '';
}

beforeEach(() => {
  mocks.copyToClipboard.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('MCPSettings', () => {
  it('starts with beta off, shows the existing URL, and keeps all application sections collapsed', () => {
    renderSettings();

    expect(screen.getByRole('switch', { name: 'Use beta MCP endpoint' })).not.toBeChecked();
    expect(screen.getByTestId('selected-mcp-endpoint')).toHaveTextContent('/api/v2/mcp');
    expect(screen.getByText('Token controls')).toBeInTheDocument();
    for (const name of clientNames) expect(getClientTrigger(name)).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps application sections independently expanded and supports keyboard operation', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(getClientTrigger('Claude Code'));
    getClientTrigger('Cursor').focus();
    await user.keyboard('{Enter}');

    expect(getClientTrigger('Claude Code')).toHaveAttribute('aria-expanded', 'true');
    expect(getClientTrigger('Cursor')).toHaveAttribute('aria-expanded', 'true');
    await user.click(getClientTrigger('Claude Code'));
    expect(getClientTrigger('Claude Code')).toHaveAttribute('aria-expanded', 'false');
    expect(getClientTrigger('Cursor')).toHaveAttribute('aria-expanded', 'true');
  });

  it('switches both routes without changing expansion and resets to the existing route on remount', async () => {
    const user = userEvent.setup();
    const view = renderSettings();
    const endpointSwitch = screen.getByRole('switch', { name: 'Use beta MCP endpoint' });

    await user.click(getClientTrigger('Claude Code'));
    await user.click(getClientTrigger('Cursor'));
    await user.click(endpointSwitch);
    expect(endpointSwitch).toBeChecked();
    expect(screen.getByTestId('selected-mcp-endpoint')).toHaveTextContent('/api/v2/mcp-beta');
    expect(getClientTrigger('Claude Code')).toHaveAttribute('aria-expanded', 'true');
    expect(getClientTrigger('Cursor')).toHaveAttribute('aria-expanded', 'true');

    await user.click(endpointSwitch);
    expect(endpointSwitch).not.toBeChecked();
    expect(screen.getByTestId('selected-mcp-endpoint')).toHaveTextContent('/api/v2/mcp');
    expect(getClientTrigger('Claude Code')).toHaveAttribute('aria-expanded', 'true');

    view.unmount();
    renderSettings();
    expect(screen.getByRole('switch', { name: 'Use beta MCP endpoint' })).not.toBeChecked();
    expect(screen.getByTestId('selected-mcp-endpoint')).toHaveTextContent('/api/v2/mcp');
    for (const name of clientNames) expect(getClientTrigger(name)).toHaveAttribute('aria-expanded', 'false');
  });

  it('copies the displayed recipe and scopes success feedback to its application', async () => {
    const user = userEvent.setup();
    renderSettings();
    await user.click(getClientTrigger('Claude Code'));
    const configuration = getConfiguration('Claude Code');
    const copyButton = screen.getByRole('button', { name: 'Copy Claude Code configuration' });

    await user.click(copyButton);

    await waitFor(() => expect(copyToClipboard).toHaveBeenCalledWith(configuration));
    expect(await screen.findByRole('button', { name: 'Claude Code configuration copied' })).toBeInTheDocument();
    await user.click(getClientTrigger('Cursor'));
    expect(screen.getByRole('button', { name: 'Copy Cursor configuration' })).toBeInTheDocument();
  });

  it('copies the newly selected endpoint and clears old copy feedback after switching', async () => {
    const user = userEvent.setup();
    renderSettings();
    await user.click(getClientTrigger('Claude Code'));
    const endpointSwitch = screen.getByRole('switch', { name: 'Use beta MCP endpoint' });
    const oldConfiguration = getConfiguration('Claude Code');

    await user.click(screen.getByRole('button', { name: 'Copy Claude Code configuration' }));
    await screen.findByRole('button', { name: 'Claude Code configuration copied' });
    await user.click(endpointSwitch);

    expect(screen.queryByRole('button', { name: 'Claude Code configuration copied' })).not.toBeInTheDocument();
    const betaConfiguration = getConfiguration('Claude Code');
    expect(betaConfiguration).not.toBe(oldConfiguration);
    await user.click(screen.getByRole('button', { name: 'Copy Claude Code configuration' }));
    await waitFor(() => expect(copyToClipboard).toHaveBeenLastCalledWith(betaConfiguration));
  });

  it('shows an error when clipboard copying fails', async () => {
    const user = userEvent.setup();
    mocks.copyToClipboard.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('clipboard unavailable'));
    renderSettings();
    await user.click(getClientTrigger('Cursor'));
    await user.click(screen.getByRole('button', { name: 'Copy Cursor configuration' }));
    await screen.findByRole('button', { name: 'Cursor configuration copied' });
    await user.click(screen.getByRole('button', { name: 'Cursor configuration copied' }));

    await waitFor(() => expect(mocks.toasterCreate).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error',
      description: 'Failed to copy to clipboard',
      type: 'error',
    })));
    expect(screen.queryByRole('button', { name: 'Cursor configuration copied' })).not.toBeInTheDocument();
  });

  it('ignores stale clipboard completion after changing endpoints', async () => {
    let resolveCopy!: () => void;
    mocks.copyToClipboard.mockImplementationOnce(() => new Promise<void>((resolve) => { resolveCopy = resolve; }));
    renderSettings();
    const user = userEvent.setup();
    await user.click(getClientTrigger('Codex'));

    await user.click(screen.getByRole('button', { name: 'Copy Codex configuration' }));
    await user.click(screen.getByRole('switch', { name: 'Use beta MCP endpoint' }));
    resolveCopy();
    await Promise.resolve();
    expect(screen.queryByRole('button', { name: 'Codex configuration copied' })).not.toBeInTheDocument();
  });

  it('clears copy feedback after its timeout', async () => {
    const user = userEvent.setup();
    renderSettings();
    await user.click(getClientTrigger('Codex'));
    vi.useFakeTimers();
    fireEvent.click(screen.getByRole('button', { name: 'Copy Codex configuration' }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByRole('button', { name: 'Codex configuration copied' })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole('button', { name: 'Copy Codex configuration' })).toBeInTheDocument();
  });

  it('uses neutral token guidance and keeps generated examples on placeholders', async () => {
    const user = userEvent.setup();
    renderSettings();
    expect(screen.getByText(/both endpoints use the same MCP token/i)).toBeInTheDocument();
    await user.click(getClientTrigger('Claude Desktop'));
    expect(getConfiguration('Claude Desktop')).toContain('YOUR_MCP_TOKEN_HERE');
  });
});
