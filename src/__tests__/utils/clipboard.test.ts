// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { copyToClipboard } from '@/utils/clipboard';

describe('copyToClipboard', () => {
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    });
    vi.restoreAllMocks();
    window.getSelection()?.removeAllRanges();
  });

  it('uses navigator.clipboard.writeText when available', async () => {
    await copyToClipboard('hello');

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello');
  });

  it('falls back via copy event and overwrites existing selection', async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error('denied'));

    const selected = document.createElement('pre');
    selected.textContent = 'partial selection only';
    document.body.appendChild(selected);
    const range = document.createRange();
    range.selectNodeContents(selected);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    const setData = vi.fn();
    const execCommand = vi.fn((command: string) => {
      if (command !== 'copy') return false;
      const event = new Event('copy', { bubbles: true, cancelable: true }) as ClipboardEvent;
      Object.defineProperty(event, 'clipboardData', {
        value: { setData },
      });
      document.dispatchEvent(event);
      return true;
    });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: execCommand,
    });

    await expect(copyToClipboard('full\ncall\nstack')).resolves.toBeUndefined();

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(setData).toHaveBeenCalledWith('text/plain', 'full\ncall\nstack');

    selected.remove();
  });

  it('falls back to textarea select when copy event path fails', async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error('denied'));

    let callCount = 0;
    const execCommand = vi.fn((command: string) => {
      if (command !== 'copy') return false;
      callCount += 1;
      if (callCount === 1) return false;

      const textarea = document.body.querySelector('textarea');
      expect(textarea).not.toBeNull();
      expect(textarea?.value).toBe('line1\nline2');
      return true;
    });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: execCommand,
    });

    await expect(copyToClipboard('line1\nline2')).resolves.toBeUndefined();

    expect(execCommand).toHaveBeenCalledTimes(2);
    expect(document.body.querySelector('textarea')).toBeNull();
  });

  it('throws when clipboard API and fallback both fail', async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error('denied'));
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });

    await expect(copyToClipboard('noop')).rejects.toThrow(/copy failed/i);
  });
});
