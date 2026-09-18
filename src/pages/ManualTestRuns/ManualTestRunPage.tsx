// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { ManualTestRunDetailContainer, ManualTestRunRouteBoundary } from '@/components/manual-test-runs';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';

export function ManualTestRunPage() {
  return (
    <MainTemplate pageHeader="Manual Test Run">
      <ManualTestRunRouteBoundary>
        {({ projectId, runId }) => <ManualTestRunDetailContainer projectId={projectId} runId={runId} />}
      </ManualTestRunRouteBoundary>
    </MainTemplate>
  );
}
