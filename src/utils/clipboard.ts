// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

const copyWithExecCommand = (text: string): boolean => {
  let copiedViaEvent = false;

  const onCopy = (event: ClipboardEvent) => {
    if (!event.clipboardData) return;
    event.clipboardData.setData('text/plain', text);
    event.preventDefault();
    copiedViaEvent = true;
  };

  document.addEventListener('copy', onCopy);
  try {
    if (document.execCommand('copy') && copiedViaEvent) {
      return true;
    }
  } finally {
    document.removeEventListener('copy', onCopy);
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);

  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
};

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    if (!copyWithExecCommand(text)) {
      throw new Error('Copy failed');
    }
  }
};
