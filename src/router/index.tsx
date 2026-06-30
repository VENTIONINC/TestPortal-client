// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { createBrowserRouter, Navigate } from 'react-router';

import { ProtectedRoute, ProjectGuard, RouterErrorFallback } from '@/components';
import {
  IssuesPage,
  DashboardPage,
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
import { InfoSettings } from '@/pages/UserSettings/InfoSettings';
import { PlaywrightReportGenerator } from '@/pages/ReportGenerator/PlaywrightReportGenerator';
import { CTRFReportGenerator } from '@/pages/ReportGenerator/CTRFReportGenerator';
import { PATHS } from '@/types/paths';

export const router = createBrowserRouter([
  {
    path: PATHS.ROOT,
    errorElement: <RouterErrorFallback />,
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
    errorElement: <RouterErrorFallback />,
    element: <LoginPage />,
  },
  {
    path: PATHS.SIGNUP,
    errorElement: <RouterErrorFallback />,
    element: <SignupPage />,
  },
  {
    path: PATHS.RESULTS,
    errorElement: <RouterErrorFallback />,
    element: (
      <ProtectedRoute>
        <ProjectGuard>
          <ResultsPage />
        </ProjectGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: PATHS.DASHBOARD,
    element: (
      <ProtectedRoute>
        <ProjectGuard>
          <DashboardPage />
        </ProjectGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: PATHS.ISSUES,
    errorElement: <RouterErrorFallback />,
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
    errorElement: <RouterErrorFallback />,
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
    errorElement: <RouterErrorFallback />,
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
    errorElement: <RouterErrorFallback />,
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
      {
        path: PATHS.USER_SETTINGS_INFO,
        element: <InfoSettings />,
      },
    ],
  },
  {
    path: PATHS.REPORT_GENERATOR,
    errorElement: <RouterErrorFallback />,
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
    errorElement: <RouterErrorFallback />,
    element: <NotFoundPage />,
  },
]);
