// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { TestScenarioEditBoundary } from '@/components/test-scenarios';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';

export function TestScenarioEditPage() {
  return (
    <MainTemplate pageHeader="Edit Test Scenario">
      <TestScenarioEditBoundary />
    </MainTemplate>
  );
}
