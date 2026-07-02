// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { describe, expect, it } from 'vitest';

import { getLoginErrorMessage, isPendingApprovalLoginError } from '../../hooks/useLogin';

describe('useLogin error handling', () => {
  it('preserves backend pending-approval feedback', () => {
    const pendingMessage = 'Your account is pending administrator approval.';
    const error: FetchBaseQueryError = {
      status: 403,
      data: {
        message: pendingMessage,
      },
    };

    expect(isPendingApprovalLoginError(pendingMessage)).toBe(true);
    expect(getLoginErrorMessage(error)).toBe(pendingMessage);
  });

  it('keeps generic messaging for invalid credentials', () => {
    const error: FetchBaseQueryError = {
      status: 401,
      data: {
        message: 'Invalid email or password.',
      },
    };

    expect(getLoginErrorMessage(error)).toBe('Authentication failed. Please check your credentials.');
  });
});
