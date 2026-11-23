// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { GetApiV2ManualTestRunsApiArg, ManualTestRunScenarioResult, ManualTestRunStatus } from '@/redux/apis/generatedApi';

export const MANUAL_RUN_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const satisfies Record<string, ManualTestRunStatus>;

export const MANUAL_RUN_SHOW = {
  ...MANUAL_RUN_STATUS,
  ALL: 'all',
} as const satisfies Record<string, NonNullable<GetApiV2ManualTestRunsApiArg['show']>>;

export const MANUAL_RUN_PERIOD = {
  RECENT: 'recent',
  TODAY: 'today',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  ANY_TIME: 'any_time',
  CUSTOM: 'custom',
} as const satisfies Record<string, NonNullable<GetApiV2ManualTestRunsApiArg['period']>>;

export const MANUAL_RUN_RESULT = {
  UNTESTED: 'untested',
  PASSED: 'passed',
  FAILED: 'failed',
  BLOCKED: 'blocked',
  SKIPPED: 'skipped',
} as const satisfies Record<string, ManualTestRunScenarioResult>;

export const UNASSIGNED_FILTER_VALUE = 'unassigned';
