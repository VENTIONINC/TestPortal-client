// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  useDeleteManualTestRunMutation,
  useGetApiV2ManualTestRunsByRunIdQuery,
  usePostApiV2ManualTestRunsByRunIdCompleteMutation,
  usePostApiV2ManualTestRunsByRunIdReopenMutation,
} from '@/redux/apis/extendedApi';
import type { ManualTestRunRead, ManualTestRunScenarioResult, ManualTestRunSummary } from '@/redux/apis/generatedApi';

import { MANUAL_RUN_STATUS } from '../../constants';
import {
  isRunRecoveryLocked,
  lockRunRecovery,
  unlockRunRecovery,
  useRunRecoveryLocked,
  wasRunChangeRejected,
} from '../../recoveryLock';

interface UseManualRunOptions {
  projectId: string;
  selectedRunId?: string;
  listedRuns: ManualTestRunSummary[];
  onSelectRun: (runId: string) => void;
}

export const useManualRun = ({ projectId, selectedRunId, listedRuns, onSelectRun }: UseManualRunOptions) => {
  const [currentRun, setCurrentRun] = useState<ManualTestRunRead>();
  const [feedback, setFeedback] = useState<string>();
  const [completionOpen, setCompletionOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deletedRunRef = useRef<{ projectId: string; runId: string } | null>(null);
  const scopeRef = useRef({ projectId, selectedRunId });
  scopeRef.current = { projectId, selectedRunId };
  const [isSaving, setIsSaving] = useState(false);
  const recoveryRequired = useRunRecoveryLocked(projectId, selectedRunId ?? '');
  const writesBlocked = isSaving || recoveryRequired;
  const cancelRef = useRef<HTMLButtonElement>(null);
  const completionTriggerRef = useRef<HTMLButtonElement>(null);

  const detailQuery = useGetApiV2ManualTestRunsByRunIdQuery(
    { projectId, runId: selectedRunId ?? '' },
    { skip: !selectedRunId },
  );
  const [deleteRun] = useDeleteManualTestRunMutation();
  const [completeRun] = usePostApiV2ManualTestRunsByRunIdCompleteMutation();
  const [reopenRun] = usePostApiV2ManualTestRunsByRunIdReopenMutation();
  const run = currentRun?.id === selectedRunId ? currentRun : detailQuery.currentData;
  const completed = run?.status === MANUAL_RUN_STATUS.COMPLETED;

  useEffect(() => {
    setCurrentRun(undefined);
    setFeedback(undefined);
    setCompletionOpen(false);
    setDeleteOpen(false);
    setIsSaving(false);
  }, [projectId, selectedRunId]);
  useEffect(() => {
    if (detailQuery.currentData?.projectId === projectId && detailQuery.currentData.id === selectedRunId)
      setCurrentRun(detailQuery.currentData);
  }, [detailQuery.currentData, projectId, selectedRunId]);
  useEffect(() => {
    const next = listedRuns.find(
      (item) => !(deletedRunRef.current?.projectId === projectId && deletedRunRef.current.runId === item.id),
    );
    if (!selectedRunId && next) onSelectRun(next.id);
  }, [listedRuns, onSelectRun, projectId, selectedRunId]);

  const counts = useMemo(
    () =>
      (run?.scenarios ?? []).reduce<Record<ManualTestRunScenarioResult, number>>(
        (acc, scenario) => {
          acc[scenario.result] += 1;
          return acc;
        },
        { untested: 0, passed: 0, failed: 0, blocked: 0, skipped: 0 },
      ),
    [run?.scenarios],
  );
  const untestedCount = counts.untested;
  const marked = run ? run.scenarios.length - counts.untested : 0;

  const isCurrentScope = () =>
    scopeRef.current.projectId === projectId && scopeRef.current.selectedRunId === selectedRunId;
  const acceptRun = (updated: ManualTestRunRead) => {
    if (updated.projectId !== scopeRef.current.projectId || updated.id !== scopeRef.current.selectedRunId) return;
    setCurrentRun(updated);
    setFeedback(undefined);
  };
  const refreshForRecovery = async () => {
    try {
      const refreshed = await detailQuery.refetch();
      if (!isCurrentScope()) return;
      if (
        refreshed.error ||
        !refreshed.data ||
        refreshed.data.id !== selectedRunId ||
        refreshed.data.projectId !== projectId
      ) {
        setFeedback('Could not refresh the run. Retry the refresh before making changes.');
        return;
      }
      acceptRun(refreshed.data);
      const rejected = wasRunChangeRejected(projectId, selectedRunId ?? '');
      unlockRunRecovery(projectId, selectedRunId ?? '');
      setFeedback(
        rejected && refreshed.data.status === 'completed'
          ? `Your change was not saved because ${refreshed.data.completedBy?.name || 'another user'} completed the run.`
          : rejected
            ? 'Your change was not saved. Review the refreshed run before trying again.'
            : 'The run was refreshed. Review its current values before trying again.',
      );
    } catch {
      if (isCurrentScope()) setFeedback('Could not refresh the run. Retry the refresh before making changes.');
    }
  };
  const recover = async (error: unknown) => {
    const rejected = Boolean(error && typeof error === 'object' && 'status' in error && error.status === 409);
    lockRunRecovery(projectId, selectedRunId ?? '', rejected);
    if (!isCurrentScope()) return;
    setFeedback('The server did not confirm this update. Refreshing the run.');
    setCurrentRun(undefined);
    await refreshForRecovery();
  };
  const mutate = async (operation: (runId: string) => Promise<ManualTestRunRead>) => {
    if (!run || completed || writesBlocked || isRunRecoveryLocked(projectId, selectedRunId ?? '')) return false;
    setIsSaving(true);
    setFeedback(undefined);
    let saved = false;
    try {
      acceptRun(await operation(run.id));
      saved = true;
    } catch (error) {
      await recover(error);
    } finally {
      if (isCurrentScope()) setIsSaving(false);
    }
    return saved;
  };

  const deleteSelectedRun = async () => {
    if (!run || writesBlocked) return;
    setIsSaving(true);
    try {
      await deleteRun({ projectId, runId: run.id }).unwrap();
      if (!isCurrentScope()) return;
      deletedRunRef.current = { projectId, runId: run.id };
      setDeleteOpen(false);
      setCurrentRun(undefined);
      onSelectRun('');
    } catch (error) {
      if (isCurrentScope()) setDeleteOpen(false);
      await recover(error);
    } finally {
      if (isCurrentScope()) setIsSaving(false);
    }
  };

  const complete = async () => {
    if (!run || completed || writesBlocked) return;
    setIsSaving(true);
    try {
      acceptRun(await completeRun({ projectId, runId: run.id, body: {} }).unwrap());
      if (isCurrentScope()) setCompletionOpen(false);
    } catch (error) {
      await recover(error);
      if (isCurrentScope()) setCompletionOpen(false);
    } finally {
      if (isCurrentScope()) setIsSaving(false);
    }
  };

  const reopen = async () => {
    if (!run || !completed || writesBlocked) return;
    setIsSaving(true);
    try {
      acceptRun(await reopenRun({ projectId, runId: run.id, body: {} }).unwrap());
    } catch (error) {
      await recover(error);
    } finally {
      if (isCurrentScope()) setIsSaving(false);
    }
  };

  const requestCompletion = (trigger: HTMLButtonElement) => {
    completionTriggerRef.current = trigger;
    if (untestedCount) setCompletionOpen(true);
    else void complete();
  };

  const cancelCompletion = () => {
    setCompletionOpen(false);
  };

  const openDelete = () => setDeleteOpen(true);
  const cancelDelete = () => setDeleteOpen(false);
  const retryLoad = () => void detailQuery.refetch();
  const retryRecovery = () => void refreshForRecovery();

  return {
    run,
    completed,
    counts,
    marked,
    untestedCount,
    isLoading: Boolean(selectedRunId && detailQuery.isLoading),
    isUnavailable: Boolean(selectedRunId && detailQuery.error),
    retryLoad,
    feedback,
    recoveryRequired,
    isSaving,
    writesBlocked,
    retryRecovery,
    mutate,
    completionTriggerRef,
    cancelRef,
    completionOpen,
    requestCompletion,
    cancelCompletion,
    complete,
    reopen,
    deleteOpen,
    openDelete,
    cancelDelete,
    deleteSelectedRun,
  };
};
