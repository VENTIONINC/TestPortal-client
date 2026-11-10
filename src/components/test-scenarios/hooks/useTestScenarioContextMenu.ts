// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useRef, type MouseEvent } from 'react';
import { FiCopy, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router';

import { useDeleteTestScenarioDialog } from '@/components/ui';
import { useCloseContextMenu, useContextMenuState, useOpenContextMenu } from '@/redux/slices/contextMenu';
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
  includeEdit = true,
  onClone?: (scenario: TestScenarioContextMenuScenario) => void,
  onDeletedOverride?: () => void,
  editSearch = '',
): TestScenarioContextMenuHandler => {
  const openContextMenu = useOpenContextMenu();
  const closeContextMenu = useCloseContextMenu();
  const { show } = useContextMenuState();
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const openDeleteDialog = useDeleteTestScenarioDialog();
  const navigate = useNavigate();
  const selectedProjectId = useSelectedProjectId();
  const currentProjectId = projectId ?? selectedProjectId;
  const onDeleted = useCallback(() => onDeletedOverride ? onDeletedOverride() : navigate(PATHS.TEST_SCENARIOS), [navigate, onDeletedOverride]);

  return useCallback(
    (event, scenario) => {
      if (show && lastTrigger.current === event.currentTarget) {
        event.preventDefault();
        event.stopPropagation();
        closeContextMenu();
        lastTrigger.current = null;
        return;
      }
      lastTrigger.current = event.currentTarget;
      openContextMenu(event, [
        ...(onClone ? [{ title: 'Clone', icon: FiCopy, iconAtStart: true, onClick: () => onClone(scenario) }] : []),
        ...(includeEdit ? [{
          title: 'Edit Scenario',
          icon: FiEdit,
          iconAtStart: true,
          onClick: () => navigate(`${getTestScenarioEditPath(scenario.id)}${editSearch}`),
        }] : []),
        ...(onRemoveFromSuite
          ? [{
              title: 'Remove from suite',
              icon: FiTrash2,
              iconAtStart: true,
              onClick: () => onRemoveFromSuite(scenario),
            }]
          : []),
        {
          title: 'Delete Scenario',
          icon: FiTrash2,
          iconAtStart: true,
          destructive: true,
          onClick: () => {
            if (currentProjectId) openDeleteDialog(scenario.id, currentProjectId, scenario.title, onDeleted);
          },
        },
      ]);
    },
    [closeContextMenu, currentProjectId, editSearch, includeEdit, navigate, onDeleted, onRemoveFromSuite, onClone, openContextMenu, openDeleteDialog, show],
  );
};
