// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useSelectedProject } from '@/hooks/useSelectedProject';
import { PATHS } from '@/types/paths';

import { TestScenarioUnavailableState } from '../components/TestScenarioDetailStates';

export interface TestScenarioRouteScope {
  projectId: string;
  scenarioId: string;
}

interface TestScenarioRouteBoundaryProps {
  children: (scope: TestScenarioRouteScope) => ReactNode;
}

const TestScenarioRouteScope = ({
  projectId,
  scenarioId,
  children,
}: TestScenarioRouteScope & { children: (scope: TestScenarioRouteScope) => ReactNode }) =>
  children({ projectId, scenarioId });

export const TestScenarioRouteBoundary = ({ children }: TestScenarioRouteBoundaryProps) => {
  const { selectedProjectId } = useSelectedProject();
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const normalizedScenarioId = scenarioId?.trim() ?? '';
  const goToCatalog = () => navigate(PATHS.TEST_SCENARIOS);

  if (!selectedProjectId) return null;
  if (!normalizedScenarioId) return <TestScenarioUnavailableState onBack={goToCatalog} />;

  return (
    <TestScenarioRouteScope
      key={`${selectedProjectId}:${normalizedScenarioId}`}
      projectId={selectedProjectId}
      scenarioId={normalizedScenarioId}
    >
      {children}
    </TestScenarioRouteScope>
  );
};
