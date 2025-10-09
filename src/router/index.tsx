import { createBrowserRouter, Navigate } from 'react-router';

import { ProtectedRoute, ProjectGuard } from '@/components';
import {
  IssuesPage,
  LoginPage,
  MCPPage,
  NotFoundPage,
  PromptBuilderPage,
  PromptsPage,
  ReportGeneratorPage,
  ResultsPage,
  SignupPage,
  UserSettingsPage,
} from '@/pages';
import { MCPSettings } from '@/pages/UserSettings/MCPSettings';
import { PortalSettings } from '@/pages/UserSettings/PortalSettings';
import { ProjectsSettings } from '@/pages/UserSettings/ProjectsSettings';
import { UploadApiSettings } from '@/pages/UserSettings/UploadApiSettings';
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
    children: [
      {
        index: true,
        element: <Navigate to={PATHS.USER_SETTINGS_MCP} replace />,
      },
      {
        path: PATHS.USER_SETTINGS_MCP,
        element: <MCPSettings />,
      },
      {
        path: PATHS.USER_SETTINGS_PORTALS,
        element: <PortalSettings />,
      },
      {
        path: PATHS.USER_SETTINGS_PROJECTS,
        element: <ProjectsSettings />,
      },
      {
        path: PATHS.USER_SETTINGS_UPLOAD_API,
        element: <UploadApiSettings />,
      },
    ],
  },
  {
    path: PATHS.REPORT_GENERATOR,
    element: (
      <ProtectedRoute>
        <ProjectGuard>
          <ReportGeneratorPage />
        </ProjectGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: PATHS.NOT_FOUND,
    element: <NotFoundPage />,
  },
]);
