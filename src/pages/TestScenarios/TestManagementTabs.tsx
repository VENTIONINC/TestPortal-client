// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Tabs } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router';

import { useSelectedProject } from '@/hooks/useSelectedProject';
import { useGetApiV2ManualTestRunsQuery, useGetApiV2TestSuitesQuery } from '@/redux/apis/extendedApi';
import { useGetApiV2TestScenariosQuery } from '@/redux/apis/generatedApi';
import { MANUAL_RUN_PERIOD, MANUAL_RUN_STATUS } from '@/components/manual-test-runs/constants';
import { getScenarioOrigin } from '@/components/test-scenarios/scenarioOrigin';

import './TestManagementTabs.css';

export type TestManagementTab = 'scenarios' | 'suites' | 'manual-runs';

const triggerStyle = {
  px: 3, py: 2, fontSize: 'sm', lineHeight: 'shorter', whiteSpace: 'nowrap',
  borderRadius: 0, borderBottomWidth: 0, _selected: { color: 'blue.fg' },
} as const;

export function TestManagementTabList({ onNavigate }: { onNavigate?: (tab: TestManagementTab) => void }) {
  const { selectedProjectId } = useSelectedProject();
  const projectId = selectedProjectId ?? '';
  const scenarios = useGetApiV2TestScenariosQuery({ projectId, page: 1, limit: 1 }, { skip: !selectedProjectId });
  const suites = useGetApiV2TestSuitesQuery({ projectId }, { skip: !selectedProjectId });
  const runs = useGetApiV2ManualTestRunsQuery({ projectId, page: 1, limit: 1, show: MANUAL_RUN_STATUS.IN_PROGRESS, period: MANUAL_RUN_PERIOD.ANY_TIME }, { skip: !selectedProjectId });
  const counts = [
    scenarios.isFetching || scenarios.error ? undefined : scenarios.currentData?.total,
    suites.isFetching || suites.error ? undefined : suites.currentData?.length,
    runs.isFetching || runs.error ? undefined : runs.currentData?.total,
  ];
  const tabs = [
    { value: 'scenarios', title: 'Scenarios', label: 'scenario' },
    { value: 'suites', title: 'Suites', label: 'suite' },
    { value: 'manual-runs', title: 'Manual runs', label: 'manual run' },
  ] as const;

  return (
    <Tabs.List aria-label="Test Management" w="full" gap={0} ps={6} borderBottomWidth="1px"
      borderColor="border.default" overflowX="auto">
      {tabs.map(({ value, title, label }, index) => (
        <Tabs.Trigger key={value} value={value} {...triggerStyle} onClick={onNavigate ? () => onNavigate(value) : undefined}>
          {title} <Count count={counts[index]} label={label} />
        </Tabs.Trigger>
      ))}
    </Tabs.List>
  );
}

export function ScenarioPageTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedProjectId } = useSelectedProject();
  const origin = getScenarioOrigin(new URLSearchParams(location.search), selectedProjectId ?? '');
  const suites = useGetApiV2TestSuitesQuery({ projectId: selectedProjectId ?? '' }, { skip: !selectedProjectId || origin.kind !== 'suite' });
  const isSuiteOrigin = origin.kind === 'suite' && Boolean(suites.currentData?.some((suite) => suite.id === origin.id));
  const navigateToTab = (tab: TestManagementTab) => {
    if (tab === 'manual-runs') navigate('/manual-test-runs');
    else navigate('/test-management', { state: { testManagementTab: tab } });
  };
  return (
    <Tabs.Root className="test-management-tabs" value={isSuiteOrigin ? 'suites' : 'scenarios'}>
      <TestManagementTabList onNavigate={navigateToTab} />
    </Tabs.Root>
  );
}

const Count = ({ count, label }: { count?: number; label: string }) => (
  <span aria-label={count === undefined ? `${label} count unavailable` : `${count} ${label}${count === 1 ? '' : 's'}`}
    style={{ marginInlineStart: 6, fontWeight: 400, fontVariantNumeric: 'tabular-nums' }}>
    {count ?? '—'}
  </span>
);
