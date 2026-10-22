// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { TestScenarioEditContainer } from './TestScenarioEditContainer';
import { TestScenarioRouteBoundary } from './TestScenarioRouteBoundary';

export const TestScenarioEditBoundary = () => (
  <TestScenarioRouteBoundary>
    {({ projectId, scenarioId }) => <TestScenarioEditContainer projectId={projectId} scenarioId={scenarioId} />}
  </TestScenarioRouteBoundary>
);
