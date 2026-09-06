// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { TestScenarioDetailBoundary } from '@/components/test-scenarios';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';

export function TestScenarioDetailPage() {
  return (
    <MainTemplate pageHeader="Test Scenario">
      <TestScenarioDetailBoundary />
    </MainTemplate>
  );
}
