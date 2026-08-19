// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ErrorSuggestionResponse } from '@/redux/apis/generatedApi';

export type IssueDraft = Pick<ErrorSuggestionResponse, 'name' | 'description'> & {
  category?: ErrorSuggestionResponse['category'];
};

export type SimilarIssueSuggestion = {
  issue: { id: string; name: string; description?: string | null };
  category: IssueDraft['category'];
  score: number;
  otherAffectedTests: number;
};

export const assignIssueModalStatus = {
  openingSearch: 'opening-search',
  aiCategorising: 'ai-categorising',
  unassigned: 'unassigned',
  algorithmSuggestion: 'algorithm-suggestion',
  aiSuggestion: 'ai-suggestion',
  noMatch: 'no-match',
  categorisationError: 'categorisation-error',
  similarityError: 'similarity-error',
  confirmedView: 'confirmed-view',
  confirmedEdit: 'confirmed-edit',
} as const;

export type AssignIssueModalStatus = (typeof assignIssueModalStatus)[keyof typeof assignIssueModalStatus];

export const isConfirmedIssueStatus = (status: AssignIssueModalStatus) =>
  status === assignIssueModalStatus.confirmedView || status === assignIssueModalStatus.confirmedEdit;

export const isReadOnlyIssueStatus = (status: AssignIssueModalStatus) =>
  status === assignIssueModalStatus.openingSearch ||
  status === assignIssueModalStatus.aiCategorising ||
  status === assignIssueModalStatus.algorithmSuggestion ||
  status === assignIssueModalStatus.confirmedView;

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
  | { type: 'confirmedEditRequested' }
  | { type: 'suggestionRejected' }
  | { type: 'closed' };

const emptyDraft: IssueDraft = { name: '', description: '' };

export function createAssignIssueModalState(input: {
  mode: 'assign' | 'confirmed';
  requestId: number;
  form?: IssueDraft;
}): AssignIssueModalState {
  return {
    status: input.mode === 'confirmed' ? assignIssueModalStatus.confirmedView : assignIssueModalStatus.openingSearch,
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
      return { ...state, status: assignIssueModalStatus.openingSearch, requestId: event.requestId };
    case 'similarityMatched':
      return {
        ...state,
        status: assignIssueModalStatus.algorithmSuggestion,
        suggestion: event.suggestion,
        score: event.suggestion.score,
        form: {
          ...state.form,
          category: event.suggestion.category,
          name: event.suggestion.issue.name,
          description: event.suggestion.issue.description ?? '',
        },
      };
    case 'similarityMissed':
      return { ...state, status: assignIssueModalStatus.noMatch, suggestion: undefined, score: undefined };
    case 'similarityFailed':
      return { ...state, status: assignIssueModalStatus.similarityError };
    case 'categoriseRequested':
      return { ...state, status: assignIssueModalStatus.aiCategorising, requestId: event.requestId };
    case 'categoriseSucceeded':
      return { ...state, status: assignIssueModalStatus.aiSuggestion, form: event.draft };
    case 'categoriseFailed':
      return { ...state, status: assignIssueModalStatus.categorisationError };
    case 'formChanged':
      return { ...state, form: { ...state.form, ...event.form } };
    case 'confirmedEditRequested':
      return state.status === assignIssueModalStatus.confirmedView
        ? { ...state, status: assignIssueModalStatus.confirmedEdit }
        : state;
    case 'suggestionRejected':
      return { ...state, status: assignIssueModalStatus.unassigned, form: emptyDraft, suggestion: undefined, score: undefined };
    case 'closed':
      return { ...state, closed: true };
  }
}
