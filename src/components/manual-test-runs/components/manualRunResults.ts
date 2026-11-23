// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ManualTestRunScenarioResult } from '@/redux/apis/generatedApi';

import { MANUAL_RUN_RESULT } from '../constants';

export const RESULTS = [
  MANUAL_RUN_RESULT.PASSED,
  MANUAL_RUN_RESULT.FAILED,
  MANUAL_RUN_RESULT.BLOCKED,
  MANUAL_RUN_RESULT.SKIPPED,
] as const;
export const resultLabels: Record<ManualTestRunScenarioResult, string> = {
  untested: 'Untested',
  passed: 'Passed',
  failed: 'Failed',
  blocked: 'Blocked',
  skipped: 'Skipped',
};
export const resultExplanations: Record<(typeof RESULTS)[number], string> = {
  passed: 'Every step gave the expected result.',
  failed: 'At least one step gave a different result than expected. Add a comment or a bug link.',
  blocked:
    'Could not be checked right now, for example because the test stand is down, test data is missing, or another bug is in the way. Retest later in this run.',
  skipped:
    'Deliberately not checked in this run. Untested scenarios also become Skipped when the run is completed early.',
};
