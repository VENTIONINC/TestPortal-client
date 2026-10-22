// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { TestScenarioDetailContainer } from './TestScenarioDetailContainer';
import { TestScenarioRouteBoundary } from './TestScenarioRouteBoundary';

export const TestScenarioDetailBoundary = () => (
  <TestScenarioRouteBoundary>
    {({ projectId, scenarioId }) => (
      <TestScenarioDetailContainer projectId={projectId} scenarioId={scenarioId} />
    )}
  </TestScenarioRouteBoundary>
);
