// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useLocation, useNavigate } from 'react-router';

import { useGetApiV2TestScenarioFoldersQuery, useGetApiV2TestSuitesQuery } from '@/redux/apis/extendedApi';
import { PATHS } from '@/types/paths';

import { getTestScenarioDetailPath } from '../constants';
import {
  getScenarioOrigin,
  scenarioOriginDestination,
  scenarioOriginSearch,
  type ScenarioOrigin,
} from '../scenarioOrigin';
import { flattenScenarioFolders, getScenarioFolderReturnPath } from '../utils';

export const useTestScenarioEditNavigation = (projectId: string, scenarioId: string) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentData: folders = [] } = useGetApiV2TestScenarioFoldersQuery({ projectId });
  const { currentData: suites = [] } = useGetApiV2TestSuitesQuery({ projectId });
  const flatFolders = flattenScenarioFolders(folders);
  const search = new URLSearchParams(location.search);
  const origin = getScenarioOrigin(search, projectId);
  const originSearch = search.has('originProject') ? scenarioOriginSearch(projectId, origin) : '';

  const getBreadcrumb = (folderId?: string | null) => {
    const breadcrumbOrigin: ScenarioOrigin =
      origin.kind === 'suite' ? origin : folderId ? { kind: 'folder', id: folderId } : { kind: 'unfiled' };
    const destination = scenarioOriginDestination(projectId, breadcrumbOrigin, flatFolders, suites);
    const isSuiteOrigin = origin.kind === 'suite' && destination.label !== 'All scenarios';
    const sectionSearch = new URLSearchParams({ projectId, ...(isSuiteOrigin ? { tab: 'suites' } : {}) });

    return {
      originLabel: destination.label,
      originKind: isSuiteOrigin ? ('suites' as const) : ('scenarios' as const),
      onNavigateOrigin: () => navigate(destination.path),
      onNavigateSection: () => navigate(`${PATHS.TEST_MANAGEMENT}?${sectionSearch}`),
    };
  };

  return {
    folders: flatFolders,
    suites,
    getBreadcrumb,
    navigateBack: (folderId?: string | null) =>
      navigate(getScenarioFolderReturnPath(projectId, folderId ?? null, flatFolders)),
    navigateAfterSave: () => navigate(`${getTestScenarioDetailPath(scenarioId)}${originSearch}`),
    cancelEdit: () => navigate(`/test-scenarios/${scenarioId}${originSearch}`),
  };
};
