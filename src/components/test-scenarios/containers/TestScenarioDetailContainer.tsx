// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { toaster } from '@/components/ui';
import {
  useDeleteApiV2TestSuitesBySuiteIdMembersMutation,
  useGetApiV2TestScenarioFoldersQuery,
  useGetApiV2TestSuitesQuery,
} from '@/redux/apis/extendedApi';
import { PATHS } from '@/types/paths';
import { extractApiError } from '@/utils/apiErrors';

import { TestScenarioDetailStateView, TestScenarioDetailsView } from '../components';
import { getTestScenarioEditPath } from '../constants';
import { useTestScenarioContextMenu } from '../hooks/useTestScenarioContextMenu';
import { useTestScenarioDetail } from '../hooks/useTestScenarioDetail';
import { flattenScenarioFolders, getScenarioFolderReturnPath } from '../utils';
import type { ScenarioOperationReport } from '../utils';
import { getScenarioOrigin, scenarioOriginSearch } from '../scenarioOrigin';

export interface TestScenarioDetailContainerProps {
  projectId: string;
  scenarioId: string;
}

export const TestScenarioDetailContainer = ({ projectId, scenarioId }: TestScenarioDetailContainerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const originSearch = search.has('originProject') ? scenarioOriginSearch(projectId, getScenarioOrigin(search, projectId)) : '';
  const onContextMenu = useTestScenarioContextMenu(projectId, undefined, false, (scenario) => {
    const params = new URLSearchParams({ clone: scenario.id });
    new URLSearchParams(originSearch).forEach((value, key) => params.set(key, value));
    navigate(`${PATHS.TEST_SCENARIO_NEW}?${params}`);
  }, () => {
    navigate(`${PATHS.TEST_SCENARIOS}?${new URLSearchParams({ projectId })}`);
  });
  const detail = useTestScenarioDetail(projectId, scenarioId);
  const foldersQuery = useGetApiV2TestScenarioFoldersQuery({ projectId });
  const suitesQuery = useGetApiV2TestSuitesQuery({ projectId });
  const [removeSuiteMembers] = useDeleteApiV2TestSuitesBySuiteIdMembersMutation();
  const [removingSuiteIds, setRemovingSuiteIds] = useState<string[]>([]);
  const [suiteError, setSuiteError] = useState<string>();
  const mounted = useRef(true);
  const scope = useRef(`${projectId}:${scenarioId}`);
  scope.current = `${projectId}:${scenarioId}`;
  const isCurrentScope = () => mounted.current && scope.current === `${projectId}:${scenarioId}`;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    setSuiteError(undefined);
    setRemovingSuiteIds([]);
  }, [projectId, scenarioId]);
  const folders = flattenScenarioFolders(foldersQuery.currentData ?? []);
  const origin = getScenarioOrigin(search, projectId);
  const originSuite = origin.kind === 'suite' ? suitesQuery.currentData?.find((item) => item.id === origin.id) : undefined;
  const folder = detail.scenario?.folderId
    ? folders.find(({ id }) => id === detail.scenario?.folderId)
    : undefined;
  const folderName = detail.scenario?.folderId ? folder?.name ?? 'Folder unavailable' : 'No folder';
  const backPath = origin.kind === 'suite' && originSuite
    ? `${PATHS.TEST_SCENARIOS}?${new URLSearchParams({ projectId, tab: 'suites', suiteId: originSuite.id })}`
    : getScenarioFolderReturnPath(projectId, detail.scenario?.folderId ?? null, folders);

  const refreshMembership = async () => {
    await Promise.all([detail.refetch(), suitesQuery.refetch()]);
  };

  const handleAddSuiteComplete = async (report: ScenarioOperationReport) => {
    if (!isCurrentScope()) return;
    if (report.succeededIds.includes(scenarioId) && !report.failedIds.length && !report.uncertainIds.length) {
      setSuiteError(undefined);
      await refreshMembership();
      return;
    }

    await suitesQuery.refetch();
    if (report.uncertainIds.length && isCurrentScope()) await detail.refetch();
    if (!isCurrentScope()) return;
    setSuiteError(
      report.uncertainIds.length
        ? 'The suite update could not be confirmed. Memberships were refreshed; check the list before trying again.'
        : `${report.errorMessage ?? 'Could not add this scenario to the suite.'} The confirmed suite membership is unchanged.`,
    );
  };

  const handleRemoveSuite = async (suiteId: string) => {
    if (removingSuiteIds.includes(suiteId)) return;
    setSuiteError(undefined);
    setRemovingSuiteIds((current) => [...current, suiteId]);
    try {
      await removeSuiteMembers({ suiteId, body: { projectId, scenarioIds: [scenarioId] } }).unwrap();
      if (!isCurrentScope()) return;
      await refreshMembership();
      if (!isCurrentScope()) return;
      toaster.create({ title: 'Removed from suite.', type: 'success' });
    } catch (error) {
      if (!isCurrentScope()) return;
      const status = error && typeof error === 'object' && 'status' in error ? Number((error as { status: unknown }).status) : NaN;
      const isUncertain = !Number.isInteger(status) || status >= 500;
      if (isUncertain) await refreshMembership();
      if (!isCurrentScope()) return;
      setSuiteError(
        isUncertain
          ? 'The removal outcome is unknown. Memberships were refreshed; check the list before trying again.'
          : `${extractApiError(error as never)} The saved suite membership was kept.`,
      );
    } finally {
      if (isCurrentScope()) setRemovingSuiteIds((current) => current.filter((id) => id !== suiteId));
    }
  };

  return (
    <TestScenarioDetailStateView
      scenario={detail.scenario}
      isLoading={detail.isLoading}
      isUnavailable={detail.isUnavailable}
      isError={detail.isError}
      onRetry={() => void detail.refetch()}
      onBack={() => navigate(PATHS.TEST_SCENARIOS)}
    >
      {(scenario) => (
        <TestScenarioDetailsView
          scenario={scenario}
          projectId={projectId}
          folderName={folderName}
          backLabel={origin.kind === 'suite' && originSuite ? originSuite.name : detail.scenario?.folderId && !folder ? 'All scenarios' : folderName}
          originKind={origin.kind === 'suite' && originSuite ? 'suites' : 'scenarios'}
          backPath={backPath}
          onEdit={() => navigate(`${getTestScenarioEditPath(scenario.id)}${originSearch}`)}
          onContextMenu={onContextMenu}
          onAddSuiteComplete={(report) => void handleAddSuiteComplete(report)}
          suiteError={suiteError}
          onRemoveSuite={(suiteId) => void handleRemoveSuite(suiteId)}
          removingSuiteIds={removingSuiteIds}
        />
      )}
    </TestScenarioDetailStateView>
  );
};
