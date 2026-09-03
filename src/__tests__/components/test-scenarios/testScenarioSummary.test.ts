// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import type { TestScenario } from '@/redux/apis/generatedApi';
import { mapTestScenarioToSummary, mapTestScenariosToSummaries } from '@/components/test-scenarios/utils';

const scenario: TestScenario = {
  id: 'scenario-1',
  projectId: 'project-1',
  createdById: 'user-1',
  title: 'Checkout flow',
  contentMd: '# Checkout flow\n\nSensitive Markdown content',
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-02T11:00:00.000Z',
};

describe('Test Scenario summary mapping', () => {
  it('projects only the fields used by the catalog', () => {
    const summary = mapTestScenarioToSummary(scenario);

    expect(summary).toEqual({
      id: 'scenario-1',
      title: 'Checkout flow',
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-02T11:00:00.000Z',
    });
    expect(Object.hasOwn(summary, 'contentMd')).toBe(false);
  });

  it('maps every API record to a summary without passing Markdown content through', () => {
    expect(mapTestScenariosToSummaries([scenario])).toEqual([
      {
        id: 'scenario-1',
        title: 'Checkout flow',
        createdAt: '2026-09-01T10:00:00.000Z',
        updatedAt: '2026-09-02T11:00:00.000Z',
      },
    ]);
  });
});
