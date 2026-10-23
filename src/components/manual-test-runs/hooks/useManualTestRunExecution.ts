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
  | { kind: 'executor' }
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
  stepSavedAt: Record<string, number>;
  setRunNotesDraft: (value: string) => void;
  setRunKeyDraft: (value: string) => void;
  setStepStatus: (stepId: string, status: ManualTestRunStepStatus) => void;
  setStepNotes: (stepId: string, notes: string) => void;
  saveRunNotes: () => Promise<void>;
  saveRunKey: () => Promise<void>;
  saveStep: (stepId: string) => Promise<void>;
  flushStepNotes: (stepId: string) => void;
  coordinateExternalWrite: (write: () => Promise<ManualTestRunRead | undefined>) => Promise<ManualTestRunRead | undefined>;
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
  hasUnacknowledgedRevision: (stepId: string) => boolean,
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

    if (!draft || (!isDirty && !hasUnacknowledgedRevision(step.id))) {
      nextStepDrafts[step.id] = { status: step.status, notes: step.notes ?? '' };
    }
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
  const [stepSavedAt, setStepSavedAt] = useState<Record<string, number>>({});
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
  const queuedSteps = useRef(new Set<string>());
  const noteTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const revisions = useRef<Record<string, number>>({});
  const acknowledgedRevisions = useRef<Record<string, number>>({});
  const failedSteps = useRef(new Set<string>());
  const pumpRef = useRef<() => void>(() => {});
  const editableRef = useRef(!isReadOnly);
  const executionEpochRef = useRef(0);
  if (editableRef.current !== !isReadOnly) executionEpochRef.current += 1;
  editableRef.current = !isReadOnly;
  const cancelAutomaticWrites = useCallback(() => {
    noteTimers.current.forEach(clearTimeout);
    noteTimers.current.clear();
    queuedSteps.current.clear();
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; cancelAutomaticWrites(); };
  }, [cancelAutomaticWrites]);
  useEffect(() => {
    cancelAutomaticWrites();
    failedSteps.current.clear();
    revisions.current = {};
    acknowledgedRevisions.current = {};
    writeInFlightRef.current = false;
    setPendingWrite(null);
    setRecoveryBlocked(false);
    setIsCompletionOpen(false);
  }, [projectId, runId, cancelAutomaticWrites]);
  useEffect(() => { if (isReadOnly) cancelAutomaticWrites(); }, [isReadOnly, cancelAutomaticWrites]);

  const scopeEpochRef = useRef(0);
  if (latestScopeRef.current !== `${projectId}:${runId}`) scopeEpochRef.current += 1;
  const scopeEpoch = scopeEpochRef.current;
  latestScopeRef.current = `${projectId}:${runId}`;
  draftStateRef.current = { runNotesDraft, runKeyDraft, stepDrafts };

  const isCurrentScope = useCallback(
    () => mountedRef.current && scopeEpochRef.current === scopeEpoch && latestScopeRef.current === `${projectId}:${runId}`,
    [projectId, runId, scopeEpoch],
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
      (stepId) => (revisions.current[stepId] ?? 0) > (acknowledgedRevisions.current[stepId] ?? 0),
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
        (stepId) => (revisions.current[stepId] ?? 0) > (acknowledgedRevisions.current[stepId] ?? 0),
      );
      savedRunRef.current = response;
      const nextEditable = response.status === 'in_progress' && response.executedById === currentUserId;
      if (editableRef.current !== nextEditable) executionEpochRef.current += 1;
      editableRef.current = nextEditable;
      if (!editableRef.current) cancelAutomaticWrites();
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
    [cancelAutomaticWrites, currentUserId, isCurrentScope, projectId, runId, setPersistedRun],
  );

  const recoverAuthoritativeState = useCallback(
    async (reason: 'conflict' | 'uncertain-completion' | 'run-key-conflict') => {
      if (!isCurrentScope()) return undefined;
      setRecoveryBlocked(true);
      let response: ManualTestRunRead | undefined;
      try { response = await refetch(); } catch { response = undefined; }
      if (!isCurrentScope()) return undefined;

      if (!response || response.id !== runId || response.projectId !== projectId) {
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
    [applySavedResponse, isCurrentScope, projectId, refetch, runId],
  );

  const [patchRun] = usePatchApiV2ManualTestRunsByRunIdMutation();
  const [patchStep] = usePatchApiV2ManualTestRunsByRunIdStepsAndStepIdMutation();
  const [completeRun] = usePostApiV2ManualTestRunsByRunIdCompleteMutation();

  const beginWrite = useCallback(
    (write: Exclude<ManualTestRunPendingWrite, null>) => {
      if (
        writeInFlightRef.current ||
        (write.kind !== 'step' && (queuedSteps.current.size > 0 || noteTimers.current.size > 0 || failedSteps.current.size > 0)) ||
        !isCurrentScope() ||
        (write.kind !== 'metadata' && write.kind !== 'executor' && savedRunRef.current.status !== 'in_progress') ||
        !currentUserId ||
        (write.kind !== 'executor' && savedRunRef.current.executedById !== currentUserId) ||
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
    queueMicrotask(() => pumpRef.current());
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
      draftStateRef.current = { ...draftStateRef.current, runNotesDraft: value };
      setRunNotesDraftState(value);
    },
    [isReadOnly, pendingWrite],
  );

  const setRunKeyDraft = useCallback(
    (value: string) => {
      if (!canEditRunKey || pendingWrite?.kind === 'metadata') return;
      setRunKeyError(undefined);
      draftStateRef.current = { ...draftStateRef.current, runKeyDraft: value };
      setRunKeyDraftState(value);
    },
    [canEditRunKey, pendingWrite],
  );

  const enqueueStep = useCallback((stepId: string) => {
    if (!editableRef.current || failedSteps.current.has(stepId)) return;
    queuedSteps.current.add(stepId);
    queueMicrotask(() => pumpRef.current());
  }, []);

  const flushStepNotes = useCallback((stepId: string) => {
    clearTimeout(noteTimers.current.get(stepId));
    noteTimers.current.delete(stepId);
    enqueueStep(stepId);
  }, [enqueueStep]);

  const changeStep = useCallback((stepId: string, changes: Partial<ManualTestRunStepDrafts[string]>) => {
    if (!editableRef.current || !isCurrentScope()) return false;
    const current = draftStateRef.current.stepDrafts;
    if (!current[stepId]) return false;
    const next = { ...current, [stepId]: { ...current[stepId], ...changes } };
    revisions.current[stepId] = (revisions.current[stepId] ?? 0) + 1;
    draftStateRef.current = { ...draftStateRef.current, stepDrafts: next };
    setStepDrafts(next);
    return true;
  }, [isCurrentScope]);

  const setStepStatus = useCallback((stepId: string, status: ManualTestRunStepStatus) => {
    if (!changeStep(stepId, { status })) return;
    flushStepNotes(stepId);
  }, [changeStep, flushStepNotes]);

  const setStepNotes = useCallback((stepId: string, notes: string) => {
    if (!changeStep(stepId, { notes })) return;
    clearTimeout(noteTimers.current.get(stepId));
    noteTimers.current.set(stepId, setTimeout(() => {
      noteTimers.current.delete(stepId);
      enqueueStep(stepId);
    }, 500));
  }, [changeStep, enqueueStep]);

  const saveRunNotes = useCallback(async () => {
    const baseline = savedRunRef.current;
    const payload = getManualTestRunNotePatchPayload(draftStateRef.current.runNotesDraft, baseline.notes);
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
  ]);

  const saveRunKey = useCallback(async () => {
    const baseline = savedRunRef.current;
    const validation = createReadableLabelSchema('Run key').safeParse(draftStateRef.current.runKeyDraft);
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
  }, [applySavedResponse, beginWrite, endWrite, isCurrentScope, patchRun, projectId, recoverAuthoritativeState, runId]);

  const saveStep = useCallback(
    async (stepId: string) => {
      const baseline = savedRunRef.current;
      const savedStep = baseline.steps.find((step) => step.id === stepId);
      const draft = draftStateRef.current.stepDrafts[stepId];
      const revision = revisions.current[stepId] ?? 0;
      const executionEpoch = executionEpochRef.current;
      if (!savedStep || !draft) return;
      const payload = getManualTestRunStepPatchPayload(draft, savedStep);
      if (!payload) {
        failedSteps.current.delete(stepId);
        acknowledgedRevisions.current[stepId] = revision;
        updateStepSaveState(stepId, getStepSaveState(savedStep));
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
        if (!isCurrentScope() || !editableRef.current || executionEpochRef.current !== executionEpoch) return;
        acknowledgedRevisions.current[stepId] = revision;
        applySavedResponse(response, baseline);
        const responseStep = response.steps.find((step) => step.id === stepId) ?? savedStep;
        if ((revisions.current[stepId] ?? 0) === revision) {
          const next = { ...draftStateRef.current.stepDrafts,
            [stepId]: { status: responseStep.status, notes: responseStep.notes ?? '' } };
          draftStateRef.current = { ...draftStateRef.current, stepDrafts: next };
          setStepDrafts(next);
        }
        failedSteps.current.delete(stepId);
        updateStepSaveState(stepId, getStepSaveState(responseStep));
        setStepSavedAt((current) => ({ ...current, [stepId]: Date.now() }));
      } catch (error) {
        if (!isCurrentScope() || !editableRef.current || executionEpochRef.current !== executionEpoch) return;
        failedSteps.current.add(stepId);
        queuedSteps.current.delete(stepId);
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
      updateStepSaveState,
    ],
  );

  pumpRef.current = () => {
    if (!isCurrentScope() || !editableRef.current || recoveryBlocked || failedSteps.current.size > 0 || writeInFlightRef.current) return;
    const stepId = queuedSteps.current.values().next().value;
    if (!stepId) return;
    queuedSteps.current.delete(stepId);
    if (failedSteps.current.has(stepId)) return;
    void saveStep(stepId).finally(() => { if (isCurrentScope()) pumpRef.current(); });
  };

  const retryStep = useCallback(async (stepId: string) => {
    if (writeInFlightRef.current || recoveryBlocked) return;
    failedSteps.current.delete(stepId);
    clearTimeout(noteTimers.current.get(stepId));
    noteTimers.current.delete(stepId);
    try {
      await saveStep(stepId);
    } finally {
      if (isCurrentScope()) queueMicrotask(() => pumpRef.current());
    }
  }, [isCurrentScope, recoveryBlocked, saveStep]);

  const coordinateExternalWrite = useCallback(async (write: () => Promise<ManualTestRunRead | undefined>) => {
    if (queuedSteps.current.size || noteTimers.current.size || !beginWrite({ kind: 'executor' })) return undefined;
    try {
      const response = await write();
      if (!isCurrentScope() || (response && (response.id !== runId || response.projectId !== projectId))) return undefined;
      if (response) applySavedResponse(response);
      return response;
    } finally {
      endWrite();
    }
  }, [applySavedResponse, beginWrite, endWrite, isCurrentScope, projectId, runId]);

  const discardRunNotes = useCallback(() => {
    if (isReadOnly || pendingWrite) return;
    draftStateRef.current = { ...draftStateRef.current, runNotesDraft: savedRunRef.current.notes ?? '' };
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
      clearTimeout(noteTimers.current.get(stepId));
      noteTimers.current.delete(stepId);
      queuedSteps.current.delete(stepId);
      failedSteps.current.delete(stepId);
      revisions.current[stepId] = (revisions.current[stepId] ?? 0) + 1;
      acknowledgedRevisions.current[stepId] = revisions.current[stepId];
      const next = { ...draftStateRef.current.stepDrafts,
        [stepId]: { status: savedStep.status, notes: savedStep.notes ?? '' } };
      draftStateRef.current = { ...draftStateRef.current, stepDrafts: next };
      setStepDrafts(next);
      updateStepSaveState(stepId, getStepSaveState(savedStep));
      setFeedback(undefined);
      queueMicrotask(() => pumpRef.current());
    },
    [pendingWrite, updateStepSaveState, isReadOnly],
  );

  const isRunNotesDirty = Boolean(getManualTestRunNotePatchPayload(runNotesDraft, savedRun.notes));
  const isRunKeyDirty = Boolean(getManualTestRunKeyPatchPayload(runKeyDraft, savedRun.runKey));
  const dirtyStepIds = savedRun.steps
    .filter((step) => getManualTestRunStepPatchPayload(stepDrafts[step.id] ?? { status: step.status, notes: '' }, step))
    .map((step) => step.id);
  const isDirty = hasManualTestRunDraftChanges(savedRun, runNotesDraft, stepDrafts);

  useEffect(() => {
    if (!isDirty && !isRunKeyDirty && !pendingWrite) return;
    const preventLeave = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', preventLeave);
    return () => window.removeEventListener('beforeunload', preventLeave);
  }, [isDirty, isRunKeyDirty, pendingWrite]);

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
    if (hasManualTestRunDraftChanges(savedRunRef.current, draftStateRef.current.runNotesDraft,
      draftStateRef.current.stepDrafts) || getManualTestRunKeyPatchPayload(draftStateRef.current.runKeyDraft, savedRunRef.current.runKey)) {
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
  }, [isReadOnly, pendingWrite, recoveryBlocked, savedRun.status]);

  const closeCompletion = useCallback(() => setIsCompletionOpen(false), []);

  const confirmCompletion = useCallback(
    async (outcome: ManualTestRunOutcome) => {
      if (!isManualOutcome(outcome)) return;
      if (hasManualTestRunDraftChanges(savedRunRef.current, draftStateRef.current.runNotesDraft,
      draftStateRef.current.stepDrafts) || getManualTestRunKeyPatchPayload(draftStateRef.current.runKeyDraft, savedRunRef.current.runKey)) {
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
    stepSavedAt,
    setRunNotesDraft,
    setRunKeyDraft,
    setStepStatus,
    setStepNotes,
    saveRunNotes,
    saveRunKey,
    saveStep: retryStep,
    flushStepNotes,
    coordinateExternalWrite,
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
