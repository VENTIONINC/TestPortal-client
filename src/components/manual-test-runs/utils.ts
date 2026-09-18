// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type {
  ManualTestRunRead,
  ManualTestRunStepRead,
  ManualTestRunStepStatus,
  ManualTestRunUpdateRequest,
  ManualTestRunStepUpdateRequest,
} from '@/redux/apis/generatedApi';

import type { ManualTestRunStepDraft, ManualTestRunStepDrafts, ManualTestRunOutcome } from './types';

export interface ManualTestRunProgressCounts {
  total: number;
  submitted: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
}

/** Trims only the outer whitespace; line breaks inside a note are retained. */
export const normalizeManualTestRunNote = (value: string | null | undefined): string | null => {
  const normalized = value?.trim() ?? '';
  return normalized || null;
};

export const getManualTestRunNotePatchPayload = (
  draft: string | null | undefined,
  saved: string | null | undefined,
): ManualTestRunUpdateRequest | null => {
  const next = normalizeManualTestRunNote(draft);
  if (next === normalizeManualTestRunNote(saved)) return null;
  return { notes: next };
};

export const getManualTestRunStepPatchPayload = (
  draft: ManualTestRunStepDraft,
  saved: Pick<ManualTestRunStepRead, 'status' | 'notes'>,
): ManualTestRunStepUpdateRequest | null => {
  const payload: ManualTestRunStepUpdateRequest = {};
  if (draft.status !== saved.status) payload.status = draft.status;

  const nextNotes = normalizeManualTestRunNote(draft.notes);
  if (nextNotes !== normalizeManualTestRunNote(saved.notes)) payload.notes = nextNotes;

  return Object.keys(payload).length > 0 ? payload : null;
};

export const getManualTestRunStepDrafts = (steps: ManualTestRunStepRead[]): ManualTestRunStepDrafts =>
  Object.fromEntries(
    steps.map((step) => [step.id, { status: step.status, notes: step.notes ?? '' } satisfies ManualTestRunStepDraft]),
  );

export const isManualTestRunPassedEligible = (steps: Pick<ManualTestRunStepRead, 'status'>[]): boolean =>
  steps.length === 0 ||
  (steps.some((step) => step.status === 'passed') &&
    steps.every((step) => step.status === 'passed' || step.status === 'skipped'));

export const isManualTestRunOutcome = (value: string): value is ManualTestRunOutcome =>
  value === 'passed' || value === 'failed' || value === 'blocked' || value === 'skipped';

export const isManualTestRunStepStatus = (value: string): value is ManualTestRunStepStatus =>
  value === 'not_started' || value === 'passed' || value === 'failed' || value === 'blocked' || value === 'skipped';

export const getManualTestRunProgressCounts = (
  steps: Pick<ManualTestRunStepRead, 'status'>[],
): ManualTestRunProgressCounts => {
  const counts: ManualTestRunProgressCounts = {
    total: steps.length,
    submitted: 0,
    passed: 0,
    failed: 0,
    blocked: 0,
    skipped: 0,
  };

  for (const step of steps) {
    if (step.status !== 'not_started') counts.submitted += 1;
    if (step.status in counts) counts[step.status as keyof Omit<ManualTestRunProgressCounts, 'total' | 'submitted'>] += 1;
  }

  return counts;
};

export const hasManualTestRunStepDraftChanges = (
  steps: ManualTestRunStepRead[],
  drafts: ManualTestRunStepDrafts,
): boolean =>
  steps.some((step) => getManualTestRunStepPatchPayload(drafts[step.id] ?? { status: step.status, notes: '' }, step));

export const hasManualTestRunDraftChanges = (
  run: ManualTestRunRead,
  runNotesDraft: string,
  stepDrafts: ManualTestRunStepDrafts,
) => Boolean(getManualTestRunNotePatchPayload(runNotesDraft, run.notes)) || hasManualTestRunStepDraftChanges(run.steps, stepDrafts);
