// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { toaster } from '@/components/ui';
import { copyToClipboard } from '@/utils';

export const handleCopyToken = async (mcpToken: string) => {
  try {
    await copyToClipboard(mcpToken);
    toaster.create({
      title: 'Token Copied',
      description: 'MCP token copied to clipboard',
      type: 'success',
    });
  } catch {
    toaster.create({
      title: 'Copy Failed',
      description: 'Unable to copy to clipboard',
      type: 'error',
    });
  }
};
