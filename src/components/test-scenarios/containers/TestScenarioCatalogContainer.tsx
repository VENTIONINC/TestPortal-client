// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { PATHS } from '@/types/paths';

import { TestScenarioCatalogView } from '../components/TestScenarioCatalogView';
import { useTestScenarioCatalog } from '../hooks/useTestScenarioCatalog';
import { scenarioOriginSearch } from '../scenarioOrigin';
import { useTestScenarioContextMenu } from '../hooks/useTestScenarioContextMenu';

export interface TestScenarioCatalogContainerProps {
  projectId: string;
  organizationTab?: 'scenarios' | 'suites';
}

export const TestScenarioCatalogContainer = ({ projectId, organizationTab }: TestScenarioCatalogContainerProps) => {
  const catalog = useTestScenarioCatalog(projectId, organizationTab);
  const navigate = useNavigate();
  const scope = catalog.scope;
  const origin = scope.kind === 'folder' && scope.id ? { kind: 'folder' as const, id: scope.id } : scope.kind === 'unfiled' ? { kind: 'unfiled' as const } : { kind: 'all' as const };
  const onScenarioActions = useTestScenarioContextMenu(projectId, undefined, true, undefined, () => {}, scenarioOriginSearch(projectId, origin));
  const onCreateScenario = useCallback(() => {
    const folderId = catalog.scope.kind === 'folder' ? catalog.scope.id : undefined;
    const origin = folderId ? { kind: 'folder' as const, id: folderId } : catalog.scope.kind === 'unfiled' ? { kind: 'unfiled' as const } : { kind: 'all' as const };
    const search = new URLSearchParams();
    if (folderId || catalog.scope.kind === 'unfiled') search.set('folderId', folderId ?? 'unfiled');
    new URLSearchParams(scenarioOriginSearch(projectId, origin)).forEach((value, key) => search.set(key, value));
    navigate(`${PATHS.TEST_SCENARIO_NEW}?${search}`);
  }, [catalog.scope, navigate, projectId]);

  return (
    <TestScenarioCatalogView
      {...catalog}
      projectId={projectId}
      onScenarioActions={onScenarioActions}
      organizationTab={organizationTab}
      onMoveSelected={catalog.moveSelected}
      onMoveScenarioIds={catalog.moveScenarioIds}
      onSuiteOperationStart={catalog.startSuiteOperation}
      onSuiteOperationComplete={catalog.reconcileSuiteOperation}
      onDeleteSelected={catalog.deleteSelected}
      onRemoveSelectedFromSuite={catalog.removeSelectedFromSuite}
      onReorderSuite={catalog.reorderSuite}
      onCreateFolder={catalog.createFolder}
      onUpdateFolder={catalog.updateFolder}
      onDeleteFolder={catalog.deleteFolder}
      onCreateSuite={catalog.createSuite}
      onUpdateSuite={catalog.updateSuite}
      onDeleteSuite={catalog.deleteSuite}
      onCreateScenario={onCreateScenario}
    />
  );
};
