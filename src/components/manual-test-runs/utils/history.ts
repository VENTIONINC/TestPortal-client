// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ManualTestRunStatus } from '@/redux/apis/generatedApi';

export const MANUAL_TEST_RUN_HISTORY_LIMIT = 30;

export const MANUAL_TEST_RUN_HISTORY_STATUSES: Array<{ value: ManualTestRunStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'skipped', label: 'Skipped' },
];

export interface ManualTestRunHistoryFilters {
  status: ManualTestRunStatus | '';
  sourceTestScenarioId: string;
  startedOnOrAfter: string;
  startedOnOrBefore: string;
}

export const DEFAULT_MANUAL_TEST_RUN_HISTORY_FILTERS: ManualTestRunHistoryFilters = {
  status: '',
  sourceTestScenarioId: '',
  startedOnOrAfter: '',
  startedOnOrBefore: '',
};

const parseCalendarDate = (value: string): Date | undefined => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return undefined;

  return date;
};

export const getManualTestRunHistoryDateError = (
  filters: Pick<ManualTestRunHistoryFilters, 'startedOnOrAfter' | 'startedOnOrBefore'>,
) => {
  const start = filters.startedOnOrAfter ? parseCalendarDate(filters.startedOnOrAfter) : undefined;
  const end = filters.startedOnOrBefore ? parseCalendarDate(filters.startedOnOrBefore) : undefined;

  if (filters.startedOnOrAfter && !start) return 'The start date is invalid.';
  if (filters.startedOnOrBefore && !end) return 'The end date is invalid.';
  if (start && end && start.getTime() > end.getTime()) return 'The start date must be on or before the end date.';

  return undefined;
};

export const calendarDateToManualTestRunBoundary = (value: string, boundary: 'from' | 'before') => {
  const date = parseCalendarDate(value);
  if (!date) return undefined;
  if (boundary === 'before') date.setDate(date.getDate() + 1);
  return date.toISOString();
};

export const hasManualTestRunHistoryFilters = (filters: ManualTestRunHistoryFilters) =>
  Boolean(filters.status || filters.sourceTestScenarioId || filters.startedOnOrAfter || filters.startedOnOrBefore);
