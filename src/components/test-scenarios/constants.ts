// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { PATHS } from '@/types/paths';

export const TEST_SCENARIO_PAGE_LIMIT = 25;
export const TEST_SCENARIO_PAGE_SIZES = [10, 25, 50, 100] as const;
export type TestScenarioPageSize = (typeof TEST_SCENARIO_PAGE_SIZES)[number];

export const getTestScenarioDetailPath = (scenarioId: string) =>
  PATHS.TEST_SCENARIO_DETAILS.replace(':scenarioId', encodeURIComponent(scenarioId));

export const getTestScenarioEditPath = (scenarioId: string) =>
  PATHS.TEST_SCENARIO_EDIT.replace(':scenarioId', encodeURIComponent(scenarioId));

export const getManualTestRunPath = (runId: string) =>
  PATHS.MANUAL_TEST_RUN_DETAILS.replace(':runId', encodeURIComponent(runId));
