// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { TestScenarioCatalog } from '@/components/test-scenarios';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';

export function TestScenariosPage() {
  return (
    <MainTemplate pageHeader="Test Scenarios">
      <TestScenarioCatalog />
    </MainTemplate>
  );
}

