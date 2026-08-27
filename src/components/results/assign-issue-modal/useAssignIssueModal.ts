// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import {
  useConfirmAssumptionMutation,
  usePatchApiV2ResultErrorsByResultErrorIdIssueMutation,
  usePostApiV2ResultErrorsByResultErrorIdIssueMutation,
  useResultErrorModalContextQuery,
} from '@/redux/apis/extendedApi';
import {
  usePatchApiV2ResultErrorsByResultErrorIdReviewMutation,
  usePostApiV2ErrorFormatterMutation,
  usePostApiV2ErrorFormatterResultMutation,
  type ResultErrorModalAssignment,
} from '@/redux/apis/generatedApi';

import {
  assignIssueModalReducer,
  assignIssueModalStatus,
  createAssignIssueModalState,
  type IssueDraft,
} from './assignIssueModalState';

interface UseAssignIssueModalProps {
  resultErrorId: string;
  projectId: string;
  mode: 'assign' | 'confirmed' | 'context';
  selectedAssumptionId?: string;
  onClose?: () => void;
}

type PolishField = 'name' | 'description';
type PolishFieldState = { status: 'idle' | 'loading' | 'success' | 'error'; previous?: string };
const initialPolishState: Record<PolishField, PolishFieldState> = {
  name: { status: 'idle' },
  description: { status: 'idle' },
};

const isIssueDraftValid = (
  draft: IssueDraft,
): draft is IssueDraft & { category: NonNullable<IssueDraft['category']> } =>
  Boolean(draft.category && draft.name.trim() && draft.description.trim());

export function useAssignIssueModal({ resultErrorId, projectId, mode, selectedAssumptionId, onClose }: UseAssignIssueModalProps) {
  const requestId = useRef(1);
  const searchStarted = useRef(false);
  const [state, dispatch] = useReducer(
    assignIssueModalReducer,
    createAssignIssueModalState({ mode: mode === 'context' ? 'assign' : mode, requestId: requestId.current }),
  );
  const [polish, setPolish] = useState(initialPolishState);
  const [operationError, setOperationError] = useState<string | null>(null);
  const contextQuery = useResultErrorModalContextQuery({ resultErrorId, projectId });
  const [reviewError, similarityRequest] = usePatchApiV2ResultErrorsByResultErrorIdReviewMutation();
  const [requestDraft, categorisationRequest] = usePostApiV2ErrorFormatterResultMutation();
  const [createIssue, createIssueRequest] = usePostApiV2ResultErrorsByResultErrorIdIssueMutation();
  const [updateIssue, updateIssueRequest] = usePatchApiV2ResultErrorsByResultErrorIdIssueMutation();
  const [confirmAssumption, confirmAssumptionRequest] = useConfirmAssumptionMutation();
  const [formatField, formatFieldRequest] = usePostApiV2ErrorFormatterMutation();
  const isMutating =
    createIssueRequest.isLoading ||
    updateIssueRequest.isLoading ||
    confirmAssumptionRequest.isLoading;
  const canFindMatchingIssues = state.status !== assignIssueModalStatus.aiSuggestion;

  const showAssumption = useCallback(
    (activeRequestId: number, assumption: ResultErrorModalAssignment) => {
      dispatch({
        type: 'similarityMatched',
        requestId: activeRequestId,
        suggestion: {
          assumptionId: assumption.id,
          issue: assumption.issue,
          category: assumption.issue.category,
          score: Math.round(assumption.score * 100),
          otherAffectedTests: 0,
        },
      });
    },
    [],
  );

  const runSimilarity = useCallback(async () => {
    const activeRequestId = ++requestId.current;
    dispatch({ type: 'searchRequested', requestId: activeRequestId });

    try {
      await reviewError({ resultErrorId }).unwrap();
      const refreshed = await contextQuery.refetch();
      const context = refreshed.data;
      const assumption = context && [...context.assignments.suggestions].sort((left, right) => right.score - left.score)[0];
      if (!context || !assumption) {
        dispatch({ type: 'similarityMissed', requestId: activeRequestId });
        return;
      }
      showAssumption(activeRequestId, assumption);
    } catch {
      dispatch({ type: 'similarityFailed', requestId: activeRequestId });
    }
  }, [contextQuery, resultErrorId, reviewError, showAssumption]);

  useEffect(() => {
    if ((mode !== 'assign' && mode !== 'context') || selectedAssumptionId || !contextQuery.data || searchStarted.current) return;
    searchStarted.current = true;
    void runSimilarity();
  }, [contextQuery.data, mode, runSimilarity, selectedAssumptionId]);

  useEffect(() => {
    if (!selectedAssumptionId || !contextQuery.data || searchStarted.current) return;
    searchStarted.current = true;
    const assumption = contextQuery.data.assignments.suggestions.find((candidate) => candidate.id === selectedAssumptionId);
    if (!assumption) {
      dispatch({ type: 'similarityMissed', requestId: requestId.current });
      return;
    }
    showAssumption(requestId.current, assumption);
  }, [contextQuery.data, selectedAssumptionId, showAssumption]);

  useEffect(() => {
    const context = contextQuery.data;
    const confirmed = context?.assignments.confirmed;
    if (mode !== 'confirmed' || !context || !confirmed) return;
    dispatch({
      type: 'formChanged',
      form: {
        category: confirmed.issue.category,
        name: confirmed.issue.name,
        description: confirmed.issue.description ?? '',
      },
    });
  }, [contextQuery.data, mode]);

  const categorise = useCallback(async () => {
    if (!contextQuery.data) return;
    const activeRequestId = ++requestId.current;
    dispatch({ type: 'categoriseRequested', requestId: activeRequestId });

    try {
      const draft = await requestDraft({
        errorSuggestionRequest: { resultId: contextQuery.data.result.id, projectId },
      }).unwrap();
      dispatch({ type: 'categoriseSucceeded', requestId: activeRequestId, draft });
    } catch {
      dispatch({ type: 'categoriseFailed', requestId: activeRequestId });
    }
  }, [contextQuery.data, projectId, requestDraft]);

  const finishClose = useCallback(() => {
    dispatch({ type: 'closed' });
    onClose?.();
  }, [onClose]);

  const updateDisplayedHypothesis = useCallback(async (isConfirmed: boolean) => {
    const assumptionId = state.suggestion?.assumptionId;
    if (!assumptionId) return;
    await confirmAssumption({
      assumptionId,
      updateAssumptionRequest: { madeBy: 'user', isConfirmed },
    }).unwrap();
  }, [confirmAssumption, state.suggestion?.assumptionId]);

  const runOperation = useCallback(async (operation: () => Promise<void>) => {
    setOperationError(null);
    try {
      await operation();
    } catch {
      setOperationError('The issue change could not be saved. Your draft is still available.');
    }
  }, []);

  const createAndAssign = useCallback(
    () =>
      runOperation(async () => {
        if (!isIssueDraftValid(state.form)) return;
        await createIssue({
          resultErrorId,
          resultErrorIssueCreateRequest: {
            projectId,
            category: state.form.category,
            name: state.form.name.trim(),
            description: state.form.description,
          },
        }).unwrap();
        finishClose();
      }),
    [createIssue, finishClose, projectId, resultErrorId, runOperation, state.form],
  );

  const confirmSuggestion = useCallback(
    () =>
      runOperation(async () => {
        if (!state.suggestion) return;
        await updateDisplayedHypothesis(true);
        finishClose();
      }),
    [finishClose, runOperation, state.suggestion, updateDisplayedHypothesis],
  );

  const updateConfirmedIssue = useCallback(
    () =>
      runOperation(async () => {
        const confirmed = contextQuery.data?.assignments.confirmed;
        if (!confirmed || !isIssueDraftValid(state.form)) return;
        await updateIssue({
          resultErrorId,
          resultErrorIssueUpdateRequest: {
            projectId,
            category: state.form.category,
            name: state.form.name.trim(),
            description: state.form.description,
          },
        }).unwrap();
        finishClose();
      }),
    [contextQuery.data?.assignments.confirmed, finishClose, projectId, resultErrorId, runOperation, state.form, updateIssue],
  );

  const unassign = useCallback(
    () =>
      runOperation(async () => {
        const assumptionId = contextQuery.data?.assignments.confirmed?.id;
        if (!assumptionId) return;
        await confirmAssumption({
          assumptionId,
          updateAssumptionRequest: { madeBy: 'user', isConfirmed: false },
        }).unwrap();
        finishClose();
      }),
    [confirmAssumption, contextQuery.data?.assignments.confirmed?.id, finishClose, runOperation],
  );

  const rejectSuggestion = useCallback(
    () => {
      dispatch({ type: 'suggestionRejected' });

      void runOperation(async () => {
        await updateDisplayedHypothesis(false);
      });
    },
    [runOperation, updateDisplayedHypothesis],
  );

  const close = useCallback(() => {
    if (!isMutating) finishClose();
  }, [finishClose, isMutating]);

  const polishField = useCallback(
    async (field: PolishField) => {
      const previous = state.form[field];
      setPolish((current) => ({ ...current, [field]: { status: 'loading', previous } }));
      try {
        const formatted = await formatField({
          errorFormatterRequest: {
            name: state.form.name || 'Untitled issue',
            description: state.form.description || 'No description provided.',
            contextCategory: state.form.category,
          },
        }).unwrap();
        dispatch({ type: 'formChanged', form: { [field]: formatted[field] } });
        setPolish((current) => ({ ...current, [field]: { status: 'success', previous } }));
      } catch {
        setPolish((current) => ({ ...current, [field]: { status: 'error', previous } }));
      }
    },
    [formatField, state.form],
  );

  const undoPolish = useCallback(
    (field: PolishField) => {
      const previous = polish[field].previous;
      if (previous !== undefined) dispatch({ type: 'formChanged', form: { [field]: previous } });
      setPolish((current) => ({ ...current, [field]: { status: 'idle' } }));
    },
    [polish],
  );

  return {
    state,
    context: contextQuery.data,
    contextQuery,
    similarityRequest,
    categorisationRequest,
    polish,
    operationError,
    isMutating,
    canFindMatchingIssues,
    formatFieldRequest,
    actions: {
      updateForm: (form: Partial<IssueDraft>) => dispatch({ type: 'formChanged', form }),
      rejectSuggestion,
      retrySimilarity: runSimilarity,
      categorise,
      createAndAssign,
      editConfirmedIssue: () => dispatch({ type: 'confirmedEditRequested' }),
      confirmSuggestion,
      updateConfirmedIssue,
      unassign,
      polishField,
      undoPolish,
      retryPolish: polishField,
      close,
    },
  };
}
