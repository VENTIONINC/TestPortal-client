// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Tabs } from '@chakra-ui/react';
import { useLocation } from 'react-router';

import { ManualTestRunHistoryBoundary } from '@/components/manual-test-runs';
import { TestScenarioCatalog } from '@/components/test-scenarios';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { useGetApiV2ManualTestRunsQuery, useGetApiV2TestSuitesQuery } from '@/redux/apis/extendedApi';
import { useGetApiV2TestScenariosQuery } from '@/redux/apis/generatedApi';

export type TestManagementTab = 'scenarios' | 'suites' | 'manual-runs';

export function TestScenariosPage({ initialTab }: { initialTab?: TestManagementTab }) {
  const location = useLocation();
  const { selectedProjectId } = useSelectedProject();
  const projectId = selectedProjectId ?? '';
  const scenarios = useGetApiV2TestScenariosQuery({ projectId, page: 1, limit: 1 }, { skip: !selectedProjectId });
  const suites = useGetApiV2TestSuitesQuery({ projectId }, { skip: !selectedProjectId });
  const manualRuns = useGetApiV2ManualTestRunsQuery({ projectId, page: 1, limit: 1 }, { skip: !selectedProjectId });
  const tab = initialTab ?? (location.pathname === '/manual-test-runs' ? 'manual-runs' : 'scenarios');
  const scenarioCount = scenarios.isFetching || scenarios.error ? undefined : scenarios.currentData?.total;
  const suiteCount = suites.isFetching || suites.error ? undefined : suites.currentData?.length;
  const runCount = manualRuns.isFetching || manualRuns.error ? undefined : manualRuns.currentData?.total;

  return (
    <MainTemplate pageHeader="Test Management">
      <Tabs.Root defaultValue={tab} lazyMount unmountOnExit>
        <Tabs.List aria-label="Test Management">
          <Tabs.Trigger value="scenarios">
            Scenarios <Count count={scenarioCount} label="scenario" />
          </Tabs.Trigger>
          <Tabs.Trigger value="suites">
            Suites <Count count={suiteCount} label="suite" />
          </Tabs.Trigger>
          <Tabs.Trigger value="manual-runs">
            Manual runs <Count count={runCount} label="manual run" />
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="scenarios">
          <TestScenarioCatalog organizationTab="scenarios" />
        </Tabs.Content>
        <Tabs.Content value="suites">
          <TestScenarioCatalog organizationTab="suites" />
        </Tabs.Content>
        <Tabs.Content value="manual-runs">
          <ManualTestRunHistoryBoundary />
        </Tabs.Content>
      </Tabs.Root>
    </MainTemplate>
  );
}

const Count = ({ count, label }: { count?: number; label: string }) =>
  count === undefined ? (
    <span aria-label={`${label} count unavailable`}>—</span>
  ) : (
    <span aria-label={`${count} ${label}${count === 1 ? '' : 's'}`}>{count}</span>
  );
