// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  atomicCreate: vi.fn(),
  atomicUpdate: vi.fn(),
  createAssumption: vi.fn(),
  createIssue: vi.fn(),
  updateIssue: vi.fn(),
  updateFeedback: vi.fn(),
  confirmAssumption: vi.fn(),
  reviewError: vi.fn(),
  requestDraft: vi.fn(),
  formatField: vi.fn(),
  assignExistingIssue: vi.fn(),
}));

const issue = {
  id: 'issue-1',
  name: 'Existing issue',
  category: 'script' as const,
  description: 'Existing description',
  portal: null,
  service: null,
  ticket: null,
};

const suggestion = {
  id: 'assumption-1',
  isConfirmed: false,
  score: 0.91,
  madeBy: 'ai',
  issue,
};

const context = {
  error: {
    id: 'error-1',
    type: 'Error',
    message: 'Failure',
    callLog: [],
    callStack: [],
    logs: [],
    sourceSnippet: null,
    generatedTestCase: null,
    location: 'test.spec.ts:1',
  },
  result: {
    id: 'result-1',
    attempt: 1,
    status: 'failed',
    duration: 10,
    startTime: '2026-08-01T00:00:00.000Z',
    reportPortalLink: null,
    category: 'bug' as const,
    testTitle: 'checkout',
    specPath: 'checkout.spec.ts',
    specKey: 'checkout',
    executionName: 'CI',
    environment: 'test',
  },
  assignments: {
    confirmed: { ...suggestion, isConfirmed: true },
    suggestions: [suggestion],
  },
};

const mutationState = { isLoading: false };
const resolvedMutation = (mock: ReturnType<typeof vi.fn>, value: unknown = {}) => {
  mock.mockImplementation(() => ({ unwrap: vi.fn().mockResolvedValue(value) }));
};

vi.mock('@/redux/apis/extendedApi', () => ({
  useCreateAssumptionMutation: () => [mocks.createAssumption, mutationState],
  useConfirmAssumptionMutation: () => [mocks.confirmAssumption, mutationState],
  usePostApiV2ResultErrorsByResultErrorIdIssueMutation: () => [mocks.atomicCreate, mutationState],
  usePatchApiV2ResultErrorsByResultErrorIdIssueMutation: () => [mocks.atomicUpdate, mutationState],
  useResultErrorModalContextQuery: () => ({ data: context, refetch: vi.fn(), isError: false }),
}));

vi.mock('@/redux/apis/generatedApi', () => ({
  usePatchApiV2ResultErrorsByResultErrorIdReviewMutation: () => [mocks.reviewError, mutationState],
  usePostApiV2ErrorFormatterResultMutation: () => [mocks.requestDraft, mutationState],
  usePostApiV2ErrorFormatterMutation: () => [mocks.formatField, mutationState],
  usePatchApiV2ResultErrorsByResultErrorIdAssignIssueMutation: () => [mocks.assignExistingIssue, mutationState],
  usePostApiV2IssuesMutation: () => [mocks.createIssue, mutationState],
  usePatchApiV2IssuesByIssueIdMutation: () => [mocks.updateIssue, mutationState],
  usePatchApiV2ResultsByResultIdAnalysisFeedbackMutation: () => [mocks.updateFeedback, mutationState],
}));

import { useAssignIssueModal } from '@/components/results/assign-issue-modal/useAssignIssueModal';

describe('useAssignIssueModal category workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const mock of Object.values(mocks)) resolvedMutation(mock);
  });

  it('creates and assigns through the single atomic result-error workflow', async () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useAssignIssueModal({
        resultErrorId: 'error-1',
        projectId: 'project-1',
        mode: 'assign',
        selectedAssumptionId: 'missing',
        onClose,
      }),
    );

    act(() => result.current.actions.updateForm({ category: 'performance', name: '  New issue  ', description: 'Details' }));
    await act(async () => result.current.actions.createAndAssign());

    expect(mocks.atomicCreate).toHaveBeenCalledWith({
      resultErrorId: 'error-1',
      resultErrorIssueCreateRequest: {
        projectId: 'project-1',
        category: 'performance',
        name: 'New issue',
        description: 'Details',
      },
    });
    expect(mocks.updateFeedback).not.toHaveBeenCalled();
    expect(mocks.createIssue).not.toHaveBeenCalled();
    expect(mocks.createAssumption).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('loads and updates a confirmed issue category through the atomic workflow', async () => {
    const { result } = renderHook(() =>
      useAssignIssueModal({ resultErrorId: 'error-1', projectId: 'project-1', mode: 'confirmed' }),
    );

    await waitFor(() => expect(result.current.state.form.category).toBe('script'));
    act(() => result.current.actions.editConfirmedIssue());
    act(() => result.current.actions.updateForm({ category: 'infra', name: '  Updated issue  ' }));
    await act(async () => result.current.actions.updateConfirmedIssue());

    expect(mocks.atomicUpdate).toHaveBeenCalledWith({
      resultErrorId: 'error-1',
      resultErrorIssueUpdateRequest: {
        projectId: 'project-1',
        category: 'infra',
        name: 'Updated issue',
        description: 'Existing description',
      },
    });
    expect(mocks.updateFeedback).not.toHaveBeenCalled();
    expect(mocks.updateIssue).not.toHaveBeenCalled();
  });

  it('keeps the modal open with an empty editable draft after unassigning a confirmed issue', async () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useAssignIssueModal({ resultErrorId: 'error-1', projectId: 'project-1', mode: 'confirmed', onClose }),
    );

    await act(async () => result.current.actions.unassign());

    expect(result.current.state).toMatchObject({
      closed: false,
      status: 'unassigned',
      form: { name: '', description: '' },
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(mocks.reviewError).not.toHaveBeenCalled();
  });

  it('loads a similarity suggestion from its Issue category and confirms only the assumption', async () => {
    const { result } = renderHook(() =>
      useAssignIssueModal({
        resultErrorId: 'error-1',
        projectId: 'project-1',
        mode: 'assign',
        selectedAssumptionId: 'assumption-1',
      }),
    );

    await waitFor(() => expect(result.current.state.form.category).toBe('script'));
    await act(async () => result.current.actions.confirmSuggestion());

    expect(mocks.confirmAssumption).toHaveBeenCalledWith({
      assumptionId: 'assumption-1',
      updateAssumptionRequest: { madeBy: 'user', isConfirmed: true },
    });
    expect(mocks.updateFeedback).not.toHaveBeenCalled();
  });

  it('links a manually selected existing issue', async () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useAssignIssueModal({
        resultErrorId: 'error-1',
        projectId: 'project-1',
        mode: 'assign',
        selectedAssumptionId: 'missing',
        onClose,
      }),
    );

    act(() => result.current.actions.selectExistingIssue(issue));

    expect(result.current.state).toMatchObject({
      status: 'manual-suggestion',
      form: { category: 'script', name: 'Existing issue', description: 'Existing description' },
    });

    await act(async () => result.current.actions.confirmSuggestion());

    expect(mocks.assignExistingIssue).toHaveBeenCalledWith({
      resultErrorId: 'error-1',
      assignIssueRequest: { issueId: 'issue-1' },
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('clears a manually selected issue when it is rejected', () => {
    const { result } = renderHook(() =>
      useAssignIssueModal({ resultErrorId: 'error-1', projectId: 'project-1', mode: 'assign', selectedAssumptionId: 'missing' }),
    );

    act(() => result.current.actions.selectExistingIssue(issue));
    act(() => result.current.actions.rejectSuggestion());

    expect(result.current.state).toMatchObject({
      status: 'unassigned',
      form: { name: '', description: '' },
    });
  });
});
