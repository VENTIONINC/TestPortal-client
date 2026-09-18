// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type {
  ManualTestRunRead,
  ManualTestRunStepRead,
  ManualTestRunStepStatus,
  ManualTestRunStatus,
} from '@/redux/apis/generatedApi';

export type ManualTestRunOutcome = Exclude<ManualTestRunStatus, 'in_progress'>;

export type ManualTestRunStepDraft = Pick<ManualTestRunStepRead, 'status'> & { notes: string };
export type ManualTestRunStepDrafts = Record<string, ManualTestRunStepDraft>;
export type ManualTestRunStepSaveState = 'submitted' | 'saved_notes' | 'not_saved';

export const MANUAL_TEST_RUN_STEP_STATUSES: ManualTestRunStepStatus[] = [
  'not_started',
  'passed',
  'failed',
  'blocked',
  'skipped',
];

export const MANUAL_TEST_RUN_OUTCOMES: ManualTestRunOutcome[] = ['passed', 'failed', 'blocked', 'skipped'];

export type ManualTestRunSavedValues = Pick<ManualTestRunRead, 'notes' | 'steps'>;
