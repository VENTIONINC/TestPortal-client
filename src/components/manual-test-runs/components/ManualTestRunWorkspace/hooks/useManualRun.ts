// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import {
  useGetApiV2ManualTestRunsByRunIdQuery,
  usePostApiV2ManualTestRunsByRunIdCompleteMutation,
  usePostApiV2ManualTestRunsByRunIdReopenMutation,
} from '@/redux/apis/extendedApi';
import type { ManualTestRunRead, ManualTestRunScenarioResult, ManualTestRunSummary } from '@/redux/apis/generatedApi';

import { MANUAL_RUN_STATUS } from '../../../constants';
import {
  isRunRecoveryLocked,
  lockRunRecovery,
  unlockRunRecovery,
  useRunRecoveryLocked,
  wasRunChangeRejected,
} from '../../../recoveryLock';
import { finishRunWrite, tryStartRunWrite, useRunWritePending } from '../runWriteLock';

interface UseManualRunOptions {
  projectId: string;
  selectedRunId?: string;
  listedRuns: ManualTestRunSummary[];
  onSelectRun: (runId: string) => void;
}

const runKey = (projectId: string, runId: string) => JSON.stringify([projectId, runId]);

export const useManualRun = ({ projectId, selectedRunId, listedRuns, onSelectRun }: UseManualRunOptions) => {
  const [currentRun, setCurrentRun] = useState<ManualTestRunRead>();
  const [feedback, setFeedback] = useState<string>();
  const [deletedRuns, setDeletedRuns] = useState(() => new Set<string>());
  const scope = useMemo(() => ({ projectId, selectedRunId }), [projectId, selectedRunId]);
  const scopeRef = useRef<{ scope: typeof scope; onSelectRun: UseManualRunOptions['onSelectRun'] } | null>(null);
  const isSaving = useRunWritePending(projectId, selectedRunId ?? '');
  const recoveryRequired = useRunRecoveryLocked(projectId, selectedRunId ?? '');
  const writesBlocked = isSaving || recoveryRequired;

  const detailQuery = useGetApiV2ManualTestRunsByRunIdQuery(
    { projectId, runId: selectedRunId ?? '' },
    { skip: !selectedRunId },
  );
  const [completeRun] = usePostApiV2ManualTestRunsByRunIdCompleteMutation();
  const [reopenRun] = usePostApiV2ManualTestRunsByRunIdReopenMutation();
  const fetchedRun = detailQuery.currentData;
  const loadError = detailQuery.error;
  const deletedRun = selectedRunId !== undefined && deletedRuns.has(runKey(projectId, selectedRunId));
  const missingRun = deletedRun || (loadError && 'status' in loadError && loadError.status === 404);
  const matchingRun = fetchedRun?.projectId === projectId && fetchedRun.id === selectedRunId ? fetchedRun : undefined;
  const matchingCachedRun =
    currentRun?.projectId === projectId && currentRun.id === selectedRunId ? currentRun : undefined;
  const run = missingRun ? undefined : (matchingCachedRun ?? matchingRun);
  const completed = run?.status === MANUAL_RUN_STATUS.COMPLETED;
  const activeRunRef = useRef(run);

  useLayoutEffect(() => {
    scopeRef.current = { scope, onSelectRun };
    return () => {
      scopeRef.current = null;
    };
  }, [scope, onSelectRun]);
  useLayoutEffect(() => {
    activeRunRef.current = run;
  }, [run]);

  useEffect(() => {
    setCurrentRun(undefined);
    setFeedback(undefined);
  }, [projectId, selectedRunId]);
  useEffect(() => {
    if (matchingRun) setCurrentRun(matchingRun);
  }, [matchingRun]);
  useEffect(() => {
    if (selectedRunId) return;
    const next = listedRuns.find((item) => !deletedRuns.has(runKey(projectId, item.id)));
    if (next) onSelectRun(next.id);
  }, [deletedRuns, listedRuns, onSelectRun, projectId, selectedRunId]);

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

  const isCurrentScope = () => scopeRef.current?.scope === scope;
  const getRun = () => (isCurrentScope() ? activeRunRef.current : undefined);
  const acceptRun = (updated: ManualTestRunRead) => {
    if (!isCurrentScope() || updated.projectId !== projectId || updated.id !== selectedRunId) return;
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

  const beginWrite = () => {
    const activeRun = getRun();
    if (!activeRun || isRunRecoveryLocked(projectId, activeRun.id) || !tryStartRunWrite(projectId, activeRun.id)) {
      return false;
    }
    setFeedback(undefined);
    return true;
  };

  const finishWrite = () => {
    if (selectedRunId) finishRunWrite(projectId, selectedRunId);
  };

  const mutate = async (operation: (runId: string) => Promise<ManualTestRunRead>) => {
    const activeRun = getRun();
    if (!activeRun || activeRun.status === MANUAL_RUN_STATUS.COMPLETED || !beginWrite()) return false;
    let saved = false;
    try {
      acceptRun(await operation(activeRun.id));
      saved = true;
    } catch (error) {
      await recover(error);
    } finally {
      finishWrite();
    }
    return saved;
  };

  const acceptDeletion = () => {
    const active = scopeRef.current;
    if (!selectedRunId || !active) return;

    setDeletedRuns((current) => new Set(current).add(runKey(projectId, selectedRunId)));
    if (active.scope.projectId === projectId && active.scope.selectedRunId === selectedRunId) {
      active.onSelectRun('');
    }
  };

  const complete = async () => {
    if (!run || completed || !beginWrite()) return;
    try {
      acceptRun(await completeRun({ projectId, runId: run.id, body: {} }).unwrap());
    } catch (error) {
      await recover(error);
    } finally {
      finishWrite();
    }
  };

  const reopen = async () => {
    if (!run || !completed || !beginWrite()) return;
    try {
      acceptRun(await reopenRun({ projectId, runId: run.id, body: {} }).unwrap());
    } catch (error) {
      await recover(error);
    } finally {
      finishWrite();
    }
  };

  const retryLoad = () => void detailQuery.refetch();
  const retryRecovery = () => void refreshForRecovery();

  return {
    run,
    completed,
    counts,
    marked,
    untestedCount,
    isLoading: Boolean(selectedRunId && detailQuery.isLoading),
    isUnavailable: deletedRun || Boolean(selectedRunId && loadError),
    retryLoad,
    feedback,
    recoveryRequired,
    isSaving,
    writesBlocked,
    retryRecovery,
    mutate,
    getRun,
    beginWrite,
    finishWrite,
    acceptRun,
    acceptDeletion,
    recover,
    complete,
    reopen,
  };
};
