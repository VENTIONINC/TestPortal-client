// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useSelectedProject } from '@/hooks/useSelectedProject';
import { PATHS } from '@/types/paths';

import { ManualTestRunUnavailableState } from '../components/ManualTestRunDetailStates';

export interface ManualTestRunRouteScope {
  projectId: string;
  runId: string;
}

interface ManualTestRunRouteBoundaryProps {
  children: (scope: ManualTestRunRouteScope) => ReactNode;
}

export const ManualTestRunRouteBoundary = ({ children }: ManualTestRunRouteBoundaryProps) => {
  const { selectedProjectId } = useSelectedProject();
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const normalizedRunId = runId?.trim() ?? '';

  if (!selectedProjectId) return null;
  if (!normalizedRunId) {
    return <ManualTestRunUnavailableState onBack={() => navigate(PATHS.TEST_SCENARIOS)} />;
  }

  return (
    <ManualTestRunRouteScope
      key={`${selectedProjectId}:${normalizedRunId}`}
      projectId={selectedProjectId}
      runId={normalizedRunId}
    >
      {children}
    </ManualTestRunRouteScope>
  );
};

const ManualTestRunRouteScope = ({
  projectId,
  runId,
  children,
}: ManualTestRunRouteScope & { children: (scope: ManualTestRunRouteScope) => ReactNode }) =>
  children({ projectId, runId });
