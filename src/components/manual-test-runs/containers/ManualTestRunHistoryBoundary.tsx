// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { useParams } from 'react-router';

import { useSelectedProject } from '@/hooks/useSelectedProject';

import { ManualTestRunHistoryContainer } from './ManualTestRunHistoryContainer';

export const ManualTestRunHistoryBoundary = () => {
  const { selectedProjectId } = useSelectedProject();
  const { scenarioId } = useParams<{ scenarioId?: string }>();
  const normalizedScenarioId = scenarioId?.trim() || undefined;

  if (!selectedProjectId) return null;

  return (
    <ManualTestRunHistoryScope key={`${selectedProjectId}:${normalizedScenarioId ?? 'project'}`} projectId={selectedProjectId} scenarioId={normalizedScenarioId}>
      {({ projectId, scenarioId: scopedScenarioId }) => <ManualTestRunHistoryContainer projectId={projectId} scenarioId={scopedScenarioId} />}
    </ManualTestRunHistoryScope>
  );
};

const ManualTestRunHistoryScope = ({
  projectId,
  scenarioId,
  children,
}: {
  projectId: string;
  scenarioId?: string;
  children: (scope: { projectId: string; scenarioId?: string }) => ReactNode;
}) => <>{children({ projectId, scenarioId })}</>;
