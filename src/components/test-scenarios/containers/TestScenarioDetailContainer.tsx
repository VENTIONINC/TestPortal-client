// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useNavigate } from 'react-router';

import { PATHS } from '@/types/paths';

import { TestScenarioDetailStateView, TestScenarioDetailsView } from '../components';
import { useTestScenarioContextMenu } from '../hooks/useTestScenarioContextMenu';
import { useTestScenarioDetail } from '../hooks/useTestScenarioDetail';

export interface TestScenarioDetailContainerProps {
  projectId: string;
  scenarioId: string;
}

export const TestScenarioDetailContainer = ({ projectId, scenarioId }: TestScenarioDetailContainerProps) => {
  const navigate = useNavigate();
  const onContextMenu = useTestScenarioContextMenu(projectId);
  const detail = useTestScenarioDetail(projectId, scenarioId);
  const goToCatalog = () => navigate(PATHS.TEST_SCENARIOS);

  return (
    <TestScenarioDetailStateView
      scenario={detail.scenario}
      isLoading={detail.isLoading}
      isUnavailable={detail.isUnavailable}
      isError={detail.isError}
      onRetry={() => void detail.refetch()}
      onBack={goToCatalog}
    >
      {(scenario) => (
        <TestScenarioDetailsView
          scenario={scenario}
          onContextMenu={onContextMenu}
        />
      )}
    </TestScenarioDetailStateView>
  );
};
