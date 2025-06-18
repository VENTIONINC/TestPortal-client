import { ReactNode } from 'react';
import { Navigate } from 'react-router';

import { useAuth } from '@/hooks';
import { PATHS } from '@/types/paths';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: string;
}

export function ProtectedRoute({ children, fallback = PATHS.LOGIN }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
