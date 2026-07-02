// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';

import { PATHS } from '@/types/paths';
import type { RootState } from '@/redux/store';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: string;
}

export function ProtectedRoute({ children, fallback = PATHS.LOGIN }: ProtectedRouteProps) {
  const { isAuthenticated, accessToken } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !accessToken) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
