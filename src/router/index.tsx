import { createBrowserRouter, Navigate } from 'react-router';

import { ProtectedRoute, ProjectGuard } from '@/components';
import {
  IssuesPage,
  LoginPage,
  NotFoundPage,
  PromptBuilderPage,
  PromptsPage,
  ReportGeneratorPage,
  ResultsPage,
  SignupPage,
  UserSettingsPage,
} from '@/pages';
import { MCPSettings } from '@/pages/UserSettings/MCPSettings';
import { Configuration } from '@/pages/UserSettings/Configuration';
import { ProjectsSettings } from '@/pages/UserSettings/ProjectsSettings';
import { UploadApiSettings } from '@/pages/UserSettings/UploadApiSettings';
import { PlaywrightReportGenerator } from '@/pages/ReportGenerator/PlaywrightReportGenerator';
import { CTRFReportGenerator } from '@/pages/ReportGenerator/CTRFReportGenerator';
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
        <ProjectGuard>
          <UserSettingsPage />
        </ProjectGuard>
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
        path: PATHS.USER_SETTINGS_CONFIGURATION,
        element: <Configuration />,
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
    children: [
      {
        index: true,
        element: <Navigate to={PATHS.REPORT_GENERATOR_PLAYWRIGHT} replace />,
      },
      {
        path: PATHS.REPORT_GENERATOR_PLAYWRIGHT,
        element: <PlaywrightReportGenerator />,
      },
      {
        path: PATHS.REPORT_GENERATOR_CTRF,
        element: <CTRFReportGenerator />,
      },
    ],
  },
  {
    path: PATHS.NOT_FOUND,
    element: <NotFoundPage />,
  },
]);
