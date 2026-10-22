// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ProtectedRoute } from '@/components/ProtectedRoute';

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

const mockedUseSelector = vi.mocked(useSelector);

const LocationProbe = () => <output data-testid="location">{useLocation().pathname}</output>;

const renderProtectedRoute = () =>
  render(
    <MemoryRouter initialEntries={['/test-scenarios']}>
      <ProtectedRoute>
        <div>Test Scenario catalog</div>
      </ProtectedRoute>
      <LocationProbe />
    </MemoryRouter>,
  );

afterEach(() => {
  mockedUseSelector.mockReset();
});

describe('ProtectedRoute', () => {
  it('renders the catalog for an authenticated user with an access token', () => {
    mockedUseSelector.mockReturnValue({ isAuthenticated: true, accessToken: 'access-token' } as never);

    renderProtectedRoute();

    expect(screen.getByText('Test Scenario catalog')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/test-scenarios');
  });

  it('redirects an unauthenticated user to login', () => {
    mockedUseSelector.mockReturnValue({ isAuthenticated: false, accessToken: null } as never);

    renderProtectedRoute();

    expect(screen.queryByText('Test Scenario catalog')).not.toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });
});
