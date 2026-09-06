// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { TestScenarioListResponse } from '@/redux/apis/generatedApi';
export type { TestScenarioSummary } from '@/redux/apis/generatedApi';

export interface TestScenarioPagination {
  page: TestScenarioListResponse['page'];
  limit: TestScenarioListResponse['limit'];
  total: TestScenarioListResponse['total'];
  totalPages: TestScenarioListResponse['totalPages'];
}
