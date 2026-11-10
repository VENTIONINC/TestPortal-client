// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import type { TestScenario } from '@/redux/apis/generatedApi';

export const scenarioCloneDraft = (source: TestScenario) => ({
  values: {
    title: /^copy of\s/i.test(source.title) ? source.title : `Copy of ${source.title}`,
    details: source.details,
    preconditions: source.preconditions,
    testData: source.testData,
    priority: source.priority,
    relatedIssueUrl: source.relatedIssueUrl,
  },
  steps: [...source.steps].sort((a, b) => a.position - b.position).map((step, index) => ({
    key: `clone-step-${index}`,
    action: step.action,
    expectedResult: step.expectedResult ?? '',
  })),
  folderId: source.folderId,
  suites: source.suites.map(({ id, name }) => ({ id, name })),
});
