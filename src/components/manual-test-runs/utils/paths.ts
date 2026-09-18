// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { PATHS } from '@/types/paths';

export const getManualTestRunPath = (runId: string) =>
  PATHS.MANUAL_TEST_RUN_DETAILS.replace(':runId', encodeURIComponent(runId));

export const getManualTestRunScenarioHistoryPath = (scenarioId: string) =>
  PATHS.TEST_SCENARIO_MANUAL_RUNS.replace(':scenarioId', encodeURIComponent(scenarioId));
