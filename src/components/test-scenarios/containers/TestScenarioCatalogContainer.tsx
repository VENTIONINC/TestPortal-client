// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { PATHS } from '@/types/paths';

import { TestScenarioCatalogView } from '../components/TestScenarioCatalogView';
import { useTestScenarioContextMenu } from '../hooks/useTestScenarioContextMenu';
import { useTestScenarioCatalog } from '../hooks/useTestScenarioCatalog';

export interface TestScenarioCatalogContainerProps {
  projectId: string;
}

export const TestScenarioCatalogContainer = ({ projectId }: TestScenarioCatalogContainerProps) => {
  const catalog = useTestScenarioCatalog(projectId);
  const navigate = useNavigate();
  const onContextMenu = useTestScenarioContextMenu(projectId);
  const onCreateScenario = useCallback(() => navigate(PATHS.TEST_SCENARIO_NEW), [navigate]);

  return <TestScenarioCatalogView {...catalog} onCreateScenario={onCreateScenario} onContextMenu={onContextMenu} />;
};
