import { createBrowserRouter } from 'react-router';

import { ProtectedRoute, ProjectGuard } from '@/components';
import {
  IssuesPage,
  LoginPage,
  MCPPage,
  NotFoundPage,
  PromptBuilderPage,
  PromptsPage,
  ResultsPage,
  SignupPage,
  UserSettingsPage,
} from '@/pages';
import { PATHS } from '@/types/paths';

export const router = createBrowserRouter([
  {
    path: PATHS.ROOT,
    element: (
      <ProtectedRoute>
        <ProjectGuard>
          <ResultsPage />
        </ProjectGuard>
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
        <ProjectGuard>
          <ResultsPage />
        </ProjectGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: PATHS.ISSUES,
    element: (
      <ProtectedRoute>
        <ProjectGuard>
          <IssuesPage />
        </ProjectGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: PATHS.MCP,
    element: (
      <ProtectedRoute>
        <ProjectGuard>
          <MCPPage />
        </ProjectGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: PATHS.PROMPTS,
    element: (
      <ProtectedRoute>
        <ProjectGuard>
          <PromptsPage />
        </ProjectGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: PATHS.PROMPT_BUILDER,
    element: (
      <ProtectedRoute>
        <ProjectGuard>
          <PromptBuilderPage />
        </ProjectGuard>
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
