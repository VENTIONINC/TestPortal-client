// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { useSelectedProject } from '@/hooks/useSelectedProject';
import { PATHS } from '@/types/paths';

import { TestScenarioCreateContainer } from './TestScenarioCreateContainer';
import { useTestScenarioDetail } from '../hooks/useTestScenarioDetail';
import { TestScenarioDetailStateView } from '../components';

const CloneBoundary = ({ projectId, scenarioId }: { projectId: string; scenarioId: string }) => {
  const navigate = useNavigate();
  const detail = useTestScenarioDetail(projectId, scenarioId);
  const [source, setSource] = useState(detail.scenario);
  // A refetch can change the source, but the clone is an independent draft once opened.
  if (!source && detail.scenario) setSource(detail.scenario);
  return <TestScenarioDetailStateView scenario={source} isLoading={!source && detail.isLoading} isUnavailable={detail.isUnavailable} isError={detail.isError} onRetry={() => void detail.refetch()} onBack={() => navigate(PATHS.TEST_SCENARIOS)}>
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
