// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useNavigate, useSearchParams } from 'react-router';

import { useSelectedProject } from '@/hooks/useSelectedProject';
import { PATHS } from '@/types/paths';

import { TestScenarioCreateContainer } from './TestScenarioCreateContainer';
import { useTestScenarioDetail } from '../hooks/useTestScenarioDetail';
import { TestScenarioDetailStateView } from '../components';

const CloneBoundary = ({ projectId, scenarioId }: { projectId: string; scenarioId: string }) => {
  const navigate = useNavigate();
  const detail = useTestScenarioDetail(projectId, scenarioId);
  return <TestScenarioDetailStateView scenario={detail.scenario} isLoading={detail.isLoading} isUnavailable={detail.isUnavailable} isError={detail.isError} onRetry={() => void detail.refetch()} onBack={() => navigate(PATHS.TEST_SCENARIOS)}>
    {(scenario) => <TestScenarioCreateContainer projectId={projectId} sourceScenario={scenario} />}
  </TestScenarioDetailStateView>;
};

export const TestScenarioCreateBoundary = () => {
  const { selectedProjectId } = useSelectedProject();
  const [searchParams] = useSearchParams();

  if (!selectedProjectId) return null;

  const cloneId = searchParams.get('clone')?.trim();
  if (cloneId) return <CloneBoundary key={`${selectedProjectId}:${cloneId}`} projectId={selectedProjectId} scenarioId={cloneId} />;

  return <TestScenarioCreateContainer key={selectedProjectId} projectId={selectedProjectId} initialFolderId={searchParams.get('folderId')} />;
};
