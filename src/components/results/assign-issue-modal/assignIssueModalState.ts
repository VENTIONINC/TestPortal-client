// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ErrorSuggestionResponse } from '@/redux/apis/generatedApi';

export type IssueDraft = Pick<ErrorSuggestionResponse, 'category' | 'name' | 'description'>;

export type SimilarIssueSuggestion = {
  issue: { id: string; name: string; description?: string | null };
  score: number;
  otherAffectedTests: number;
};

export type AssignIssueModalStatus =
  | 'opening-search'
  | 'ai-categorising'
  | 'unassigned'
  | 'algorithm-suggestion'
  | 'ai-suggestion'
  | 'no-match'
  | 'categorisation-error'
  | 'similarity-error'
  | 'confirmed-edit';

export type AssignIssueModalState = {
  status: AssignIssueModalStatus;
  requestId: number;
  closed: boolean;
  form: IssueDraft;
  suggestion?: SimilarIssueSuggestion;
  score?: number;
};

export type AssignIssueModalEvent =
  | { type: 'searchRequested'; requestId: number }
  | { type: 'similarityMatched'; requestId: number; suggestion: SimilarIssueSuggestion }
  | { type: 'similarityMissed'; requestId: number }
  | { type: 'similarityFailed'; requestId: number }
  | { type: 'categoriseRequested'; requestId: number }
  | { type: 'categoriseSucceeded'; requestId: number; draft: IssueDraft }
  | { type: 'categoriseFailed'; requestId: number }
  | { type: 'formChanged'; form: Partial<IssueDraft> }
  | { type: 'suggestionRejected' }
  | { type: 'closed' };

const emptyDraft: IssueDraft = { category: 'other', name: '', description: '' };

export function createAssignIssueModalState(input: {
  mode: 'assign' | 'confirmed';
  requestId: number;
  form?: IssueDraft;
}): AssignIssueModalState {
  return {
    status: input.mode === 'confirmed' ? 'confirmed-edit' : 'opening-search',
    requestId: input.requestId,
    closed: false,
    form: input.form ?? emptyDraft,
  };
}

export function assignIssueModalReducer(
  state: AssignIssueModalState,
  event: AssignIssueModalEvent,
): AssignIssueModalState {
  if (state.closed) return state;

  if (
    'requestId' in event &&
    event.requestId !== state.requestId &&
    event.type !== 'categoriseRequested' &&
    event.type !== 'searchRequested'
  ) {
    return state;
  }

  switch (event.type) {
    case 'searchRequested':
      return { ...state, status: 'opening-search', requestId: event.requestId };
    case 'similarityMatched':
      return {
        ...state,
        status: 'algorithm-suggestion',
        suggestion: event.suggestion,
        score: event.suggestion.score,
        form: {
          ...state.form,
          name: event.suggestion.issue.name,
          description: event.suggestion.issue.description ?? '',
        },
      };
    case 'similarityMissed':
      return { ...state, status: 'no-match', suggestion: undefined, score: undefined };
    case 'similarityFailed':
      return { ...state, status: 'similarity-error' };
    case 'categoriseRequested':
      return { ...state, status: 'ai-categorising', requestId: event.requestId };
    case 'categoriseSucceeded':
      return { ...state, status: 'ai-suggestion', form: event.draft };
    case 'categoriseFailed':
      return { ...state, status: 'categorisation-error' };
    case 'formChanged':
      return { ...state, form: { ...state.form, ...event.form } };
    case 'suggestionRejected':
      return { ...state, status: 'unassigned', form: emptyDraft, suggestion: undefined, score: undefined };
    case 'closed':
      return { ...state, closed: true };
  }
}
