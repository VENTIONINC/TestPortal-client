// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ChakraProvider } from '@/components/ui';
import { useLogin } from '@/hooks';
import { LoginPage } from '@/pages/Login';

vi.mock('@/hooks', () => ({
  useLogin: vi.fn(),
}));

const mockedUseLogin = vi.mocked(useLogin);

function createUseLoginResult(errorMessage: string | null): ReturnType<typeof useLogin> {
  const register = ((name: 'email' | 'password') => ({
    name,
    onBlur: vi.fn(),
    onChange: vi.fn(),
    ref: vi.fn(),
  })) as unknown as ReturnType<typeof useLogin>['register'];

  return {
    register,
    handleSubmit: vi.fn(async () => undefined) as ReturnType<typeof useLogin>['handleSubmit'],
    errors: {},
    loading: false,
    successMessage: null,
    errorMessage,
    clearErrors: vi.fn(),
    form: {} as ReturnType<typeof useLogin>['form'],
  };
}

function renderLoginPage() {
  render(
    <ChakraProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </ChakraProvider>,
  );
}

afterEach(() => {
  mockedUseLogin.mockReset();
});

describe('LoginPage', () => {
  it('shows the pending-approval login message', () => {
    const pendingMessage = 'Your account is pending administrator approval.';

    mockedUseLogin.mockReturnValue(createUseLoginResult(pendingMessage));

    renderLoginPage();

    expect(screen.getByText(pendingMessage)).toBeInTheDocument();
  });

  it('shows the generic invalid-credentials message', () => {
    const genericMessage = 'Authentication failed. Please check your credentials.';

    mockedUseLogin.mockReturnValue(createUseLoginResult(genericMessage));

    renderLoginPage();

    expect(screen.getByText(genericMessage)).toBeInTheDocument();
  });
});
