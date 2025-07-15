import { createBrowserRouter } from 'react-router';

import { ProtectedRoute } from '@/components';
import { IssuesPage, LoginPage, MCPPage, NotFoundPage, ResultsPage, SignupPage, UserSettingsPage } from '@/pages';
import { PATHS } from '@/types/paths';

export const router = createBrowserRouter([
  {
    path: PATHS.ROOT,
    element: (
      <ProtectedRoute>
        <ResultsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: PATHS.LOGIN,
    element: <LoginPage />,
  },
  {
    path: PATHS.SIGNUP,
    element: <SignupPage />,
  },
  {
    path: PATHS.RESULTS,
    element: (
      <ProtectedRoute>
        <ResultsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: PATHS.ISSUES,
    element: (
      <ProtectedRoute>
        <IssuesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: PATHS.MCP,
    element: (
      <ProtectedRoute>
        <MCPPage />
      </ProtectedRoute>
    ),
  },
  {
    path: PATHS.USER_SETTINGS,
    element: (
      <ProtectedRoute>
        <UserSettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: PATHS.NOT_FOUND,
    element: <NotFoundPage />,
  },
]);
