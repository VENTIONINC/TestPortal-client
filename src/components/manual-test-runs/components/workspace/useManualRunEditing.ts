// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';

import { usePutApiV2ManualTestRunsByRunIdDetailsMutation, type ManualTestRunRead } from '@/redux/apis/generatedApi';

import { MANUAL_RUN_RESULT } from '../../constants';
import { normalizeEnvironment } from '../ManualRunDetailsDialog';
import type { useManualRun } from './useManualRun';

interface UseManualRunEditingOptions {
  projectId: string;
  run: ManualTestRunRead | undefined;
  completed: boolean;
  writesBlocked: boolean;
  mutate: ReturnType<typeof useManualRun>['mutate'];
}

export const useManualRunEditing = ({
  projectId,
  run,
  completed,
  writesBlocked,
  mutate,
}: UseManualRunEditingOptions) => {
  const [editOpen, setEditOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editScenarioIds, setEditScenarioIds] = useState<string[]>([]);
  const [editEnvironment, setEditEnvironment] = useState<Array<{ name: string; value: string }>>([]);
  const [confirmRemovedResults, setConfirmRemovedResults] = useState(false);
  const [saveDetails] = usePutApiV2ManualTestRunsByRunIdDetailsMutation();

  const openEdit = () => {
    if (!run || completed || writesBlocked) return;
    setEditTitle(run.title);
    setEditScenarioIds(run.scenarios.map((scenario) => scenario.sourceScenarioId));
    setEditEnvironment(run.environmentProperties.map((property) => ({ ...property })));
    setConfirmRemovedResults(false);
    setEditOpen(true);
  };
  const commitEdit = async (selectedIds: string[]) => {
    if (!run || completed || writesBlocked || !editTitle.trim() || !selectedIds.length) return;
    const selected = new Set(selectedIds);
    const removedMarked = run.scenarios.filter(
      (scenario) => !selected.has(scenario.sourceScenarioId) && scenario.result !== MANUAL_RUN_RESULT.UNTESTED,
    ).length;
    if (removedMarked > 0 && !confirmRemovedResults) {
      setConfirmRemovedResults(true);
      return;
    }
    const saved = await mutate((runId) =>
      saveDetails({
        projectId,
        runId,
        manualTestRunDetailsRequest: {
          title: editTitle.trim(),
          scenarioIds: selectedIds,
          environmentProperties: normalizeEnvironment(editEnvironment),
        },
      }).unwrap(),
    );
    if (!saved) return;
    setEditOpen(false);
    setManageOpen(false);
    setConfirmRemovedResults(false);
  };

  const handleManageScenarios = () => {
    if (!run) return;

    setEditTitle(run.title);
    setEditEnvironment(run.environmentProperties.map((property) => ({ ...property })));
    setConfirmRemovedResults(false);
    setManageOpen(true);
  };

  const handleCloseManageScenarios = () => {
    setManageOpen(false);
    setConfirmRemovedResults(false);
  };

  const handleEditSelectionChange = (ids: string[]) => {
    setEditScenarioIds(ids);
    setConfirmRemovedResults(false);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setConfirmRemovedResults(false);
  };

  const handleManageSelectionChange = () => setConfirmRemovedResults(false);
  const saveManagedScenarios = (ids: string[]) => void commitEdit(ids);
  const saveRunDetails = () => void commitEdit(editScenarioIds);

  return {
    editTitle,
    setEditTitle,
    editScenarioIds,
    editEnvironment,
    setEditEnvironment,
    confirmRemovedResults,
    managedRun: manageOpen ? run : undefined,
    editedRun: editOpen ? run : undefined,
    openEdit,
    handleManageScenarios,
    handleCloseManageScenarios,
    handleEditSelectionChange,
    handleCloseEdit,
    handleManageSelectionChange,
    saveManagedScenarios,
    saveRunDetails,
  };
};
