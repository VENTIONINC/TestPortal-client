// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { PATHS } from '@/types/paths';

export const TEST_SCENARIO_PAGE_LIMIT = 10;

export const getTestScenarioDetailPath = (scenarioId: string) =>
  PATHS.TEST_SCENARIO_DETAILS.replace(':scenarioId', encodeURIComponent(scenarioId));

export const getTestScenarioEditPath = (scenarioId: string) =>
  PATHS.TEST_SCENARIO_EDIT.replace(':scenarioId', encodeURIComponent(scenarioId));
