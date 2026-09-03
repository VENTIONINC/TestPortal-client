// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  type GetApiV2TestScenariosApiArg,
  type TestScenario,
  type TestScenarioListResponse,
} from '@/redux/apis/generatedApi';

const scenario: TestScenario = {
  id: 'scenario-1',
  projectId: 'project-1',
  createdById: 'user-1',
  title: 'Checkout flow',
  contentMd: '# Checkout flow',
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-02T11:00:00.000Z',
};

const listArgs: GetApiV2TestScenariosApiArg = {
  projectId: 'project-1',
  page: 2,
  limit: 30,
};

const listResponse: TestScenarioListResponse = {
  scenarios: [scenario],
  total: 31,
  page: 2,
  limit: 30,
  totalPages: 2,
};

describe('generated Test Scenario list contract', () => {
  it('exposes scenario fields and pagination metadata at compile time', () => {
    expectTypeOf(listArgs).toEqualTypeOf<GetApiV2TestScenariosApiArg>();
    expectTypeOf(listResponse).toEqualTypeOf<TestScenarioListResponse>();
    expect(scenario).toMatchObject({
      id: expect.any(String),
      projectId: expect.any(String),
      createdById: expect.any(String),
      title: expect.any(String),
      contentMd: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(listResponse).toMatchObject({
      scenarios: [scenario],
      total: 31,
      page: 2,
      limit: 30,
      totalPages: 2,
    });
    expect(listArgs).toEqual({ projectId: 'project-1', page: 2, limit: 30 });
  });
});
