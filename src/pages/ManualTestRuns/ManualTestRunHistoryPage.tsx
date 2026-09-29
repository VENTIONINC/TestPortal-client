// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { ManualTestRunHistoryBoundary } from '@/components/manual-test-runs';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';

export function ManualTestRunHistoryPage() {
  return (
    <MainTemplate pageHeader="Manual Test Runs">
      <ManualTestRunHistoryBoundary />
    </MainTemplate>
  );
}
