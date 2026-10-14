// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, type MouseEvent } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router';

import { useDeleteTestScenarioDialog } from '@/components/ui';
import { useOpenContextMenu } from '@/redux/slices/contextMenu';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { PATHS } from '@/types/paths';

import { getTestScenarioEditPath } from '../constants';
import type { TestScenarioSummary } from '../types';

export type TestScenarioContextMenuScenario = Pick<TestScenarioSummary, 'id' | 'title'>;
export type TestScenarioContextMenuHandler = (
  event: MouseEvent<HTMLButtonElement>,
  scenario: TestScenarioContextMenuScenario,
) => void;

export const useTestScenarioContextMenu = (
  projectId?: string,
  onRemoveFromSuite?: (scenario: TestScenarioContextMenuScenario) => void,
): TestScenarioContextMenuHandler => {
  const openContextMenu = useOpenContextMenu();
  const openDeleteDialog = useDeleteTestScenarioDialog();
  const navigate = useNavigate();
  const selectedProjectId = useSelectedProjectId();
  const currentProjectId = projectId ?? selectedProjectId;
  const onDeleted = useCallback(() => navigate(PATHS.TEST_SCENARIOS), [navigate]);

  return useCallback(
    (event, scenario) => {
      openContextMenu(event, [
        {
          title: 'Edit Scenario',
          icon: FiEdit,
          onClick: () => navigate(getTestScenarioEditPath(scenario.id)),
        },
        ...(onRemoveFromSuite
          ? [{
              title: 'Remove from suite',
              icon: FiTrash2,
              onClick: () => onRemoveFromSuite(scenario),
            }]
          : []),
        {
          title: 'Delete Scenario',
          icon: FiTrash2,
          onClick: () => {
            if (currentProjectId) openDeleteDialog(scenario.id, currentProjectId, scenario.title, onDeleted);
          },
        },
      ]);
    },
    [currentProjectId, navigate, onDeleted, onRemoveFromSuite, openContextMenu, openDeleteDialog],
  );
};
