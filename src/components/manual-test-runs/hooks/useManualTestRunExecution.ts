// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useSelector } from 'react-redux';

import type { RootState } from '@/redux/store';
import { getUserIdFromToken } from '@/utils/auth';
import { createReadableLabelSchema } from '@/schemas';
import {
  usePatchApiV2ManualTestRunsByRunIdMutation,
  usePatchApiV2ManualTestRunsByRunIdStepsAndStepIdMutation,
  usePostApiV2ManualTestRunsByRunIdCompleteMutation,
} from '@/redux/apis/extendedApi';
import type { ManualTestRunRead, ManualTestRunStepRead, ManualTestRunStepStatus } from '@/redux/apis/generatedApi';
import { extractApiError } from '@/utils/apiErrors';

import {
  getManualTestRunNotePatchPayload,
  getManualTestRunKeyPatchPayload,
  getManualTestRunStepDrafts,
  getManualTestRunStepPatchPayload,
  hasManualTestRunDraftChanges,
  isManualTestRunPassedEligible,
  normalizeManualTestRunNote,
  normalizeManualTestRunKey,
} from '../utils';
import type { ManualTestRunOutcome, ManualTestRunStepDrafts, ManualTestRunStepSaveState } from '../types';

export type ManualTestRunPendingWrite =
  | { kind: 'run' }
  | { kind: 'metadata' }
  | { kind: 'step'; stepId: string }
  | { kind: 'completion' }
  | null;

export interface ManualTestRunFeedback {
  status: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
}

export interface UseManualTestRunExecutionProps {
  projectId: string;
  runId: string;
  run: ManualTestRunRead;
  setPersistedRun: (run: ManualTestRunRead) => void;
  refetch: () => Promise<ManualTestRunRead | undefined>;
}

export interface UseManualTestRunExecutionResult {
  savedRun: ManualTestRunRead;
  runNotesDraft: string;
  stepDrafts: ManualTestRunStepDrafts;
  pendingWrite: ManualTestRunPendingWrite;
  feedback?: ManualTestRunFeedback;
  recoveryBlocked: boolean;
  isReadOnly: boolean;
  canEditRunKey: boolean;
  isDirty: boolean;
  isRunNotesDirty: boolean;
  runKeyDraft: string;
  runKeyError?: string;
  isRunKeyDirty: boolean;
  dirtyStepIds: string[];
  stepSaveStates: Record<string, ManualTestRunStepSaveState>;
  setRunNotesDraft: (value: string) => void;
  setRunKeyDraft: (value: string) => void;
  setStepStatus: (stepId: string, status: ManualTestRunStepStatus) => void;
  setStepNotes: (stepId: string, notes: string) => void;
  saveRunNotes: () => Promise<void>;
  saveRunKey: () => Promise<void>;
  saveStep: (stepId: string) => Promise<void>;
  discardRunNotes: () => void;
  discardRunKey: () => void;
  discardStep: (stepId: string) => void;
  requestCompletion: () => void;
  isCompletionOpen: boolean;
  closeCompletion: () => void;
  confirmCompletion: (outcome: ManualTestRunOutcome) => Promise<void>;
  retryAuthoritativeRecovery: () => Promise<void>;
  canStartRetest: () => boolean;
}

const getStatus = (error: unknown) =>
  error && typeof error === 'object' && 'status' in error ? (error as FetchBaseQueryError).status : undefined;

const isConflict = (error: unknown) => getStatus(error) === 409;

const getStepSaveState = (
  step: Pick<ManualTestRunStepRead, 'status' | 'notes'>,
): ManualTestRunStepSaveState | undefined => {
  if (step.status !== 'not_started') return 'submitted';
  return step.notes ? 'saved_notes' : undefined;
};

const reconcileDrafts = (
  baseline: ManualTestRunRead,
  nextSaved: ManualTestRunRead,
  runNotesDraft: string,
  runKeyDraft: string,
  stepDrafts: ManualTestRunStepDrafts,
) => {
  const nextRunNotesDraft =
    normalizeManualTestRunNote(runNotesDraft) === normalizeManualTestRunNote(baseline.notes)
      ? (nextSaved.notes ?? '')
      : runNotesDraft;
  const nextRunKeyDraft =
    normalizeManualTestRunKey(runKeyDraft) === normalizeManualTestRunKey(baseline.runKey)
      ? (nextSaved.runKey ?? '')
      : runKeyDraft;
  const nextStepDrafts: ManualTestRunStepDrafts = { ...stepDrafts };

  for (const step of nextSaved.steps) {
    const previousSaved = baseline.steps.find((candidate) => candidate.id === step.id);
    const draft = stepDrafts[step.id];
    const isDirty = previousSaved ? draft && getManualTestRunStepPatchPayload(draft, previousSaved) !== null : false;

    if (!isDirty || !draft) nextStepDrafts[step.id] = { status: step.status, notes: step.notes ?? '' };
  }

  return { nextRunNotesDraft, nextRunKeyDraft, nextStepDrafts };
};

export const useManualTestRunExecution = ({
  projectId,
  runId,
  run,
  setPersistedRun,
  refetch,
}: UseManualTestRunExecutionProps): UseManualTestRunExecutionResult => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const currentUserId = accessToken ? getUserIdFromToken(accessToken) : null;
  const [savedRun, setSavedRun] = useState(run);
  const isReadOnly = savedRun.status !== 'in_progress' || !currentUserId || savedRun.executedById !== currentUserId;
  const canEditRunKey = Boolean(currentUserId && savedRun.executedById === currentUserId);
  const [runNotesDraft, setRunNotesDraftState] = useState(run.notes ?? '');
  const [runKeyDraft, setRunKeyDraftState] = useState(run.runKey ?? '');
  const [runKeyError, setRunKeyError] = useState<string>();
  const [stepDrafts, setStepDrafts] = useState<ManualTestRunStepDrafts>(() => getManualTestRunStepDrafts(run.steps));
  const [stepSaveStates, setStepSaveStates] = useState<Record<string, ManualTestRunStepSaveState>>({});
  const [pendingWrite, setPendingWrite] = useState<ManualTestRunPendingWrite>(null);
  const [feedback, setFeedback] = useState<ManualTestRunFeedback>();
  const [recoveryBlocked, setRecoveryBlocked] = useState(false);
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const savedRunRef = useRef(run);
  const draftStateRef = useRef({ runNotesDraft, runKeyDraft, stepDrafts });
  const mountedRef = useRef(true);
  const latestScopeRef = useRef(`${projectId}:${runId}`);
  const writeInFlightRef = useRef(false);

  latestScopeRef.current = `${projectId}:${runId}`;
  draftStateRef.current = { runNotesDraft, runKeyDraft, stepDrafts };

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  const isCurrentScope = useCallback(
    () => mountedRef.current && latestScopeRef.current === `${projectId}:${runId}`,
    [projectId, runId],
  );

  useEffect(() => {
    if (savedRunRef.current.id !== run.id || savedRunRef.current.projectId !== run.projectId) {
      savedRunRef.current = run;
      setSavedRun(run);
      setRunNotesDraftState(run.notes ?? '');
      setRunKeyDraftState(run.runKey ?? '');
      setRunKeyError(undefined);
      setStepDrafts(getManualTestRunStepDrafts(run.steps));
      setStepSaveStates({});
      return;
    }

    const baseline = savedRunRef.current;
    const reconciled = reconcileDrafts(
      baseline,
      run,
      draftStateRef.current.runNotesDraft,
      draftStateRef.current.runKeyDraft,
      draftStateRef.current.stepDrafts,
    );
    savedRunRef.current = run;
    setSavedRun(run);
    setRunNotesDraftState(reconciled.nextRunNotesDraft);
    setRunKeyDraftState(reconciled.nextRunKeyDraft);
    setStepDrafts(reconciled.nextStepDrafts);
  }, [run]);

  const applySavedResponse = useCallback(
    (response: ManualTestRunRead, baseline = savedRunRef.current) => {
      if (!isCurrentScope() || response.id !== runId || response.projectId !== projectId) return;
      const currentDrafts = draftStateRef.current;
      const reconciled = reconcileDrafts(
        baseline,
        response,
        currentDrafts.runNotesDraft,
        currentDrafts.runKeyDraft,
        currentDrafts.stepDrafts,
      );
      savedRunRef.current = response;
      setSavedRun(response);
      setRunNotesDraftState(reconciled.nextRunNotesDraft);
      setRunKeyDraftState(reconciled.nextRunKeyDraft);
      setStepDrafts(reconciled.nextStepDrafts);
      draftStateRef.current = {
        runNotesDraft: reconciled.nextRunNotesDraft,
        runKeyDraft: reconciled.nextRunKeyDraft,
        stepDrafts: reconciled.nextStepDrafts,
      };
      setPersistedRun(response);
    },
    [isCurrentScope, projectId, runId, setPersistedRun],
  );

  const recoverAuthoritativeState = useCallback(
    async (reason: 'conflict' | 'uncertain-completion' | 'run-key-conflict') => {
      if (!isCurrentScope()) return undefined;
      setRecoveryBlocked(true);
      const response = await refetch();
      if (!isCurrentScope()) return undefined;

      if (!response) {
        setFeedback({
          status: 'error',
          title: 'Could not refresh the saved run',
          description: 'Retry the refresh before making another execution change.',
        });
        return undefined;
      }

      applySavedResponse(response);
      setRecoveryBlocked(false);
      if (reason === 'run-key-conflict') {
        setFeedback({
          status: 'warning',
          title: 'Run key was not saved.',
          description: 'The refreshed saved key is authoritative. Your rejected label remains available for review; execution results stay frozen.',
        });
      } else if (response.status !== 'in_progress') {
        setFeedback({
          status: 'warning',
          title: 'Execution is read-only',
          description:
            reason === 'conflict'
              ? 'The rejected local change was not saved. The completed result is authoritative; keep the rejected text for review or copying.'
              : 'Completion may have succeeded before the response was lost. The completed result is authoritative.',
        });
      }
      return response;
    },
    [applySavedResponse, isCurrentScope, refetch],
  );

  const [patchRun] = usePatchApiV2ManualTestRunsByRunIdMutation();
  const [patchStep] = usePatchApiV2ManualTestRunsByRunIdStepsAndStepIdMutation();
  const [completeRun] = usePostApiV2ManualTestRunsByRunIdCompleteMutation();

  const beginWrite = useCallback(
    (write: Exclude<ManualTestRunPendingWrite, null>) => {
      if (
        writeInFlightRef.current ||
        !isCurrentScope() ||
        (write.kind !== 'metadata' && savedRunRef.current.status !== 'in_progress') ||
        !currentUserId ||
        savedRunRef.current.executedById !== currentUserId ||
        recoveryBlocked
      ) {
        return false;
      }
      writeInFlightRef.current = true;
      setPendingWrite(write);
      setFeedback(undefined);
      return true;
    },
    [currentUserId, isCurrentScope, recoveryBlocked],
  );

  const endWrite = useCallback(() => {
    if (!isCurrentScope()) return;
    writeInFlightRef.current = false;
    setPendingWrite(null);
  }, [isCurrentScope]);

  const updateStepSaveState = useCallback((stepId: string, state: ManualTestRunStepSaveState | undefined) => {
    setStepSaveStates((current) => {
      const next = { ...current };
      if (state) next[stepId] = state;
      else delete next[stepId];
      return next;
    });
  }, []);

  const setRunNotesDraft = useCallback(
    (value: string) => {
      if (isReadOnly || pendingWrite?.kind === 'run') return;
      setRunNotesDraftState(value);
    },
    [isReadOnly, pendingWrite],
  );

  const setRunKeyDraft = useCallback(
    (value: string) => {
      if (!canEditRunKey || pendingWrite?.kind === 'metadata') return;
      setRunKeyError(undefined);
      setRunKeyDraftState(value);
    },
    [canEditRunKey, pendingWrite],
  );

  const setStepStatus = useCallback(
    (stepId: string, status: ManualTestRunStepStatus) => {
      if (isReadOnly || (pendingWrite?.kind === 'step' && pendingWrite.stepId === stepId)) return;
      setStepDrafts((current) => ({ ...current, [stepId]: { ...(current[stepId] ?? { notes: '' }), status } }));
    },
    [isReadOnly, pendingWrite],
  );

  const setStepNotes = useCallback(
    (stepId: string, notes: string) => {
      if (isReadOnly || (pendingWrite?.kind === 'step' && pendingWrite.stepId === stepId)) return;
      setStepDrafts((current) => ({
        ...current,
        [stepId]: { ...(current[stepId] ?? { status: 'not_started' }), notes },
      }));
    },
    [isReadOnly, pendingWrite],
  );

  const saveRunNotes = useCallback(async () => {
    const baseline = savedRunRef.current;
    const payload = getManualTestRunNotePatchPayload(runNotesDraft, baseline.notes);
    if (!payload) {
      setFeedback({ status: 'info', title: 'No execution note changes to save.' });
      return;
    }
    if (!beginWrite({ kind: 'run' })) {
      setFeedback({
        status: 'warning',
        title: 'A run update is already pending.',
        description: 'Wait for it to finish before saving another change.',
      });
      return;
    }

    try {
      const response = await patchRun({ projectId, runId, manualTestRunUpdateRequest: payload }).unwrap();
      if (!isCurrentScope()) return;
      applySavedResponse(response, baseline);
      setRunNotesDraftState(response.notes ?? '');
      setFeedback({ status: 'success', title: 'Execution notes saved.' });
    } catch (error) {
      if (!isCurrentScope()) return;
      if (isConflict(error)) {
        const authoritative = await recoverAuthoritativeState('conflict');
        if (authoritative?.status === 'in_progress') {
          setFeedback({
            status: 'warning',
            title: 'Execution note was not saved.',
            description: 'The run changed elsewhere. Review the refreshed saved values and save explicitly again.',
          });
        }
      } else {
        setFeedback({
          status: 'error',
          title: 'Execution notes were not saved.',
          description: extractApiError(error as FetchBaseQueryError | SerializedError),
        });
      }
    } finally {
      endWrite();
    }
  }, [
    applySavedResponse,
    beginWrite,
    endWrite,
    isCurrentScope,
    patchRun,
    projectId,
    recoverAuthoritativeState,
    runId,
    runNotesDraft,
  ]);

  const saveRunKey = useCallback(async () => {
    const baseline = savedRunRef.current;
    const validation = createReadableLabelSchema('Run key').safeParse(runKeyDraft);
    if (!validation.success) {
      const message = validation.error.issues[0]?.message ?? 'Enter a valid Run key.';
      setRunKeyError(message);
      setFeedback({ status: 'error', title: 'Run key is invalid.', description: message });
      return;
    }
    setRunKeyError(undefined);
    const payload = getManualTestRunKeyPatchPayload(validation.data, baseline.runKey);
    if (!payload) {
      setFeedback({ status: 'info', title: 'No Run key changes to save.' });
      return;
    }
    if (!beginWrite({ kind: 'metadata' })) {
      setFeedback({
        status: 'warning',
        title: 'A run update is already pending.',
        description: 'Wait for it to finish before saving the Run key.',
      });
      return;
    }

    try {
      const response = await patchRun({ projectId, runId, manualTestRunUpdateRequest: payload }).unwrap();
      if (!isCurrentScope()) return;
      applySavedResponse(response, baseline);
      const savedKey = response.runKey ?? '';
      draftStateRef.current = { ...draftStateRef.current, runKeyDraft: savedKey };
      setRunKeyDraftState(savedKey);
      setRunKeyError(undefined);
      setFeedback({ status: 'success', title: 'Run key saved.' });
    } catch (error) {
      if (!isCurrentScope()) return;
      if (isConflict(error)) {
        const authoritative = await recoverAuthoritativeState('run-key-conflict');
        if (authoritative?.status === 'in_progress') {
          setFeedback({
            status: 'warning',
            title: 'Run key was not saved.',
            description: 'The run changed elsewhere. Review the refreshed saved key and save explicitly again.',
          });
        }
      } else {
        setFeedback({
          status: 'error',
          title: 'Run key was not saved.',
          description: extractApiError(error as FetchBaseQueryError | SerializedError),
        });
      }
    } finally {
      endWrite();
    }
  }, [applySavedResponse, beginWrite, endWrite, isCurrentScope, patchRun, projectId, recoverAuthoritativeState, runId, runKeyDraft]);

  const saveStep = useCallback(
    async (stepId: string) => {
      const baseline = savedRunRef.current;
      const savedStep = baseline.steps.find((step) => step.id === stepId);
      const draft = stepDrafts[stepId];
      if (!savedStep || !draft) return;
      const payload = getManualTestRunStepPatchPayload(draft, savedStep);
      if (!payload) {
        setFeedback({ status: 'info', title: 'No step changes to save.' });
        return;
      }
      if (!beginWrite({ kind: 'step', stepId })) {
        setFeedback({
          status: 'warning',
          title: 'A run update is already pending.',
          description: 'Wait for it to finish before saving another change.',
        });
        return;
      }

      try {
        const response = await patchStep({
          projectId,
          runId,
          stepId,
          manualTestRunStepUpdateRequest: payload,
        }).unwrap();
        if (!isCurrentScope()) return;
        applySavedResponse(response, baseline);
        const responseStep = response.steps.find((step) => step.id === stepId) ?? savedStep;
        setStepDrafts((current) => ({
          ...current,
          [stepId]: { status: responseStep.status, notes: responseStep.notes ?? '' },
        }));
        updateStepSaveState(stepId, getStepSaveState(responseStep));
        setFeedback({ status: 'success', title: 'Step result saved.' });
      } catch (error) {
        if (!isCurrentScope()) return;
        if (isConflict(error)) {
          updateStepSaveState(stepId, 'not_saved');
          const authoritative = await recoverAuthoritativeState('conflict');
          if (authoritative?.status === 'in_progress') {
            setFeedback({
              status: 'warning',
              title: 'Step result was not saved.',
              description: 'The run changed elsewhere. Review the refreshed saved values and save explicitly again.',
            });
          }
        } else {
          updateStepSaveState(stepId, 'not_saved');
          setFeedback({
            status: 'error',
            title: 'Step result was not saved.',
            description: extractApiError(error as FetchBaseQueryError | SerializedError),
          });
        }
      } finally {
        endWrite();
      }
    },
    [
      applySavedResponse,
      beginWrite,
      endWrite,
      isCurrentScope,
      patchStep,
      projectId,
      recoverAuthoritativeState,
      runId,
      stepDrafts,
      updateStepSaveState,
    ],
  );

  const discardRunNotes = useCallback(() => {
    if (isReadOnly || pendingWrite) return;
    setRunNotesDraftState(savedRunRef.current.notes ?? '');
    setFeedback(undefined);
  }, [isReadOnly, pendingWrite]);

  const discardRunKey = useCallback(() => {
    if (!canEditRunKey || pendingWrite) return;
    const savedKey = savedRunRef.current.runKey ?? '';
    draftStateRef.current = { ...draftStateRef.current, runKeyDraft: savedKey };
    setRunKeyDraftState(savedKey);
    setRunKeyError(undefined);
    setFeedback(undefined);
  }, [canEditRunKey, pendingWrite]);

  const discardStep = useCallback(
    (stepId: string) => {
      if (isReadOnly || pendingWrite) return;
      const savedStep = savedRunRef.current.steps.find((step) => step.id === stepId);
      if (!savedStep) return;
      setStepDrafts((current) => ({
        ...current,
        [stepId]: { status: savedStep.status, notes: savedStep.notes ?? '' },
      }));
      updateStepSaveState(stepId, getStepSaveState(savedStep));
      setFeedback(undefined);
    },
    [pendingWrite, updateStepSaveState, isReadOnly],
  );

  const isRunNotesDirty = Boolean(getManualTestRunNotePatchPayload(runNotesDraft, savedRun.notes));
  const isRunKeyDirty = Boolean(getManualTestRunKeyPatchPayload(runKeyDraft, savedRun.runKey));
  const dirtyStepIds = savedRun.steps
    .filter((step) => getManualTestRunStepPatchPayload(stepDrafts[step.id] ?? { status: step.status, notes: '' }, step))
    .map((step) => step.id);
  const isDirty = hasManualTestRunDraftChanges(savedRun, runNotesDraft, stepDrafts);

  const canStartRetest = useCallback(() => {
    if (isRunKeyDirty) {
      setFeedback({
        status: 'warning',
        title: 'Save or discard Run key changes before Retest.',
        description: 'Retest starts a new run and will not carry this unsaved label draft forward.',
      });
      return false;
    }
    if (pendingWrite || recoveryBlocked) {
      setFeedback({
        status: 'warning',
        title: recoveryBlocked ? 'Refresh the saved run first.' : 'A run update is still pending.',
        description: recoveryBlocked
          ? 'Further writes are blocked until authoritative state is recovered.'
          : 'Wait for the current write to finish before starting a Retest.',
      });
      return false;
    }
    return true;
  }, [isRunKeyDirty, pendingWrite, recoveryBlocked]);

  const requestCompletion = useCallback(() => {
    if (isReadOnly) return;
    if (pendingWrite) {
      setFeedback({
        status: 'warning',
        title: 'Save is still pending.',
        description: 'Wait for the current write to finish before completing the run.',
      });
      return;
    }
    if (recoveryBlocked) {
      setFeedback({
        status: 'error',
        title: 'Refresh the saved run first.',
        description: 'Further writes are blocked until authoritative state is recovered.',
      });
      return;
    }
    if (isDirty || isRunKeyDirty) {
      setFeedback({
        status: 'warning',
        title: 'Save or discard drafts before completing.',
        description: 'Completion never silently saves or discards execution changes or the Run key.',
      });
      return;
    }
    if (savedRun.status !== 'in_progress') return;
    setFeedback(undefined);
    setIsCompletionOpen(true);
  }, [isDirty, isReadOnly, isRunKeyDirty, pendingWrite, recoveryBlocked, savedRun.status]);

  const closeCompletion = useCallback(() => setIsCompletionOpen(false), []);

  const confirmCompletion = useCallback(
    async (outcome: ManualTestRunOutcome) => {
      if (!isManualOutcome(outcome)) return;
      if (isDirty || isRunKeyDirty) {
        setFeedback({
          status: 'warning',
          title: 'Save or discard drafts before completing.',
          description: 'Completion cannot include or silently save or discard execution changes or the Run key.',
        });
        setIsCompletionOpen(false);
        return;
      }
      if (savedRunRef.current.status !== 'in_progress' || recoveryBlocked) return;
      if (outcome === 'passed' && !isManualTestRunPassedEligible(savedRun.steps)) {
        setFeedback({
          status: 'warning',
          title: 'Passed completion is not eligible.',
          description: 'Every step must be passed or skipped, with at least one passed step.',
        });
        return;
      }
      if (!beginWrite({ kind: 'completion' })) {
        setFeedback({
          status: 'warning',
          title: 'A run update is already pending.',
          description: 'Wait for it to finish before completing.',
        });
        return;
      }

      const baseline = savedRunRef.current;
      try {
        const response = await completeRun({
          projectId,
          runId,
          manualTestRunCompleteRequest: { status: outcome },
        }).unwrap();
        if (!isCurrentScope()) return;
        applySavedResponse(response, baseline);
        setIsCompletionOpen(false);
        setFeedback({
          status: 'success',
          title: 'Manual test run completed.',
          description: 'The saved result is now read-only.',
        });
      } catch (error) {
        if (!isCurrentScope()) return;
        if (isConflict(error)) {
          const authoritative = await recoverAuthoritativeState('conflict');
          if (authoritative?.status === 'in_progress') {
            setFeedback({
              status: 'warning',
              title: 'Completion was not accepted.',
              description: 'The run is still active. Review the refreshed saved values before trying again.',
            });
          }
        } else if (getStatus(error) === 'FETCH_ERROR' || getStatus(error) === 'TIMEOUT_ERROR') {
          setFeedback({
            status: 'warning',
            title: 'Completion result is uncertain.',
            description: 'The run may have completed. Refreshing authoritative state before another attempt.',
          });
          const authoritative = await recoverAuthoritativeState('uncertain-completion');
          if (authoritative?.status === 'in_progress') {
            setFeedback({
              status: 'warning',
              title: 'Run remains active.',
              description: 'Review the saved state, then explicitly choose completion again if needed.',
            });
          }
        } else {
          setFeedback({
            status: 'error',
            title: 'Run was not completed.',
            description: extractApiError(error as FetchBaseQueryError | SerializedError),
          });
        }
      } finally {
        endWrite();
      }
    },
    [
      applySavedResponse,
      beginWrite,
      completeRun,
      endWrite,
      isCurrentScope,
      projectId,
      recoverAuthoritativeState,
      runId,
      savedRun.steps,
      isDirty,
      isRunKeyDirty,
      recoveryBlocked,
    ],
  );

  const retryAuthoritativeRecovery = useCallback(async () => {
    await recoverAuthoritativeState('conflict');
  }, [recoverAuthoritativeState]);

  return {
    savedRun,
    runNotesDraft,
    stepDrafts,
    pendingWrite,
    feedback,
    recoveryBlocked,
    isReadOnly,
    canEditRunKey,
    isDirty,
    isRunNotesDirty,
    runKeyDraft,
    runKeyError,
    isRunKeyDirty,
    dirtyStepIds,
    stepSaveStates,
    setRunNotesDraft,
    setRunKeyDraft,
    setStepStatus,
    setStepNotes,
    saveRunNotes,
    saveRunKey,
    saveStep,
    discardRunNotes,
    discardRunKey,
    discardStep,
    requestCompletion,
    isCompletionOpen,
    closeCompletion,
    confirmCompletion,
    retryAuthoritativeRecovery,
    canStartRetest,
  };
};

const isManualOutcome = (value: string): value is ManualTestRunOutcome =>
  value === 'passed' || value === 'failed' || value === 'blocked' || value === 'skipped';
