// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Tabs } from '@chakra-ui/react';
import { useLocation } from 'react-router';

import { ManualTestRunHistoryBoundary } from '@/components/manual-test-runs';
import { TestScenarioCatalog } from '@/components/test-scenarios';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';

import { TestManagementTabList, type TestManagementTab } from './TestManagementTabs';

export function TestScenariosPage({ initialTab }: { initialTab?: TestManagementTab }) {
  const location = useLocation();
  const requestedTab = (location.state as { testManagementTab?: TestManagementTab } | null)?.testManagementTab;
  const tab = initialTab ?? (location.pathname === '/manual-test-runs' ? 'manual-runs' : requestedTab === 'suites' ? 'suites' : 'scenarios');

  return (
    <MainTemplate pageHeader="Test Management">
      <Tabs.Root className="test-management-tabs" defaultValue={tab} lazyMount unmountOnExit>
        <TestManagementTabList />
        <Tabs.Content value="scenarios" pt={0}>
          <TestScenarioCatalog organizationTab="scenarios" />
        </Tabs.Content>
        <Tabs.Content value="suites" pt={0}>
          <TestScenarioCatalog organizationTab="suites" />
        </Tabs.Content>
        <Tabs.Content value="manual-runs" pt={0}>
          <ManualTestRunHistoryBoundary />
        </Tabs.Content>
      </Tabs.Root>
    </MainTemplate>
  );
}

