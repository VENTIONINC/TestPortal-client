// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { TestScenarioCreateBoundary } from '@/components/test-scenarios';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';

import { ScenarioPageTabs } from './TestManagementTabs';

export function TestScenarioCreatePage() {
  return (
    <MainTemplate pageHeader="Create Test Scenario">
      <ScenarioPageTabs />
      <TestScenarioCreateBoundary />
    </MainTemplate>
  );
}
