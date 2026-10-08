// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { PATHS } from '@/types/paths';

import { TestScenarioCatalogView } from '../components/TestScenarioCatalogView';
import { useTestScenarioCatalog } from '../hooks/useTestScenarioCatalog';

export interface TestScenarioCatalogContainerProps {
  projectId: string;
}

export const TestScenarioCatalogContainer = ({ projectId }: TestScenarioCatalogContainerProps) => {
  const catalog = useTestScenarioCatalog(projectId);
  const navigate = useNavigate();
  const onCreateScenario = useCallback(() => {
    const folderId = catalog.scope.kind === 'folder' ? catalog.scope.id : undefined;
    navigate(folderId ? `${PATHS.TEST_SCENARIO_NEW}?folderId=${encodeURIComponent(folderId)}` : PATHS.TEST_SCENARIO_NEW);
  }, [catalog.scope, navigate]);

  return (
    <TestScenarioCatalogView
      {...catalog}
      projectId={projectId}
      onMoveSelected={catalog.moveSelected}
      onAddSelectedToSuite={catalog.addSelectedToSuite}
      onRemoveSelectedFromSuite={catalog.removeSelectedFromSuite}
      onReorderSuite={catalog.reorderSuite}
      onCreateFolder={catalog.createFolder}
      onUpdateFolder={catalog.updateFolder}
      onDeleteFolder={catalog.deleteFolder}
      onCreateSuite={catalog.createSuite}
      onUpdateSuite={catalog.updateSuite}
      onDeleteSuite={catalog.deleteSuite}
      includeDescendants={catalog.includeDescendants}
      onIncludeDescendantsChange={catalog.onIncludeDescendantsChange}
      onCreateScenario={onCreateScenario}
    />
  );
};
