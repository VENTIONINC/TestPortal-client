// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { TestScenario, TestScenarioListResponse } from '@/redux/apis/generatedApi';

export type TestScenarioSummary = Pick<TestScenario, 'id' | 'title' | 'createdAt' | 'updatedAt'>;

export interface TestScenarioPagination {
  page: TestScenarioListResponse['page'];
  limit: TestScenarioListResponse['limit'];
  total: TestScenarioListResponse['total'];
  totalPages: TestScenarioListResponse['totalPages'];
}

