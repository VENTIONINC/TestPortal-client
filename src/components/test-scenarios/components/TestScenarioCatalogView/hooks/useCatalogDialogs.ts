// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useLayoutEffect, useRef } from 'react';

import { useCatalogScopeLifetime } from '../../../hooks/useCatalogScopeLifetime';
import { useCatalogOrganizationDialog } from '../../catalog/dialogs/hooks/useCatalogOrganizationDialog';
import { useDeleteSelectedScenariosDialog } from '../../catalog/dialogs/hooks/useDeleteSelectedScenariosDialog';
import { useRemoveScenariosFromSuiteDialog } from '../../catalog/dialogs/hooks/useRemoveScenariosFromSuiteDialog';
import { useManageSuiteScenariosDialog } from '../../catalog/dialogs/manage-suite-scenarios/hooks/useManageSuiteScenariosDialog';
import type { TestScenarioCatalogViewProps } from '../../catalog/types';

type UseCatalogDialogsOptions = Pick<
  TestScenarioCatalogViewProps,
  'projectId' | 'organizationTab' | 'scope' | 'removeSuiteMembership' | 'refreshSuiteData'
>;

export const useCatalogDialogs = ({
  projectId,
  organizationTab,
  scope,
  removeSuiteMembership,
  refreshSuiteData,
}: UseCatalogDialogsOptions) => {
  const scopeKey = JSON.stringify([projectId, organizationTab, scope.kind, scope.id]);
  const dialogScopeLifetime = useCatalogScopeLifetime(scopeKey);
  const openOrganizationDialog = useCatalogOrganizationDialog(scopeKey);
  const openManageSuiteScenariosDialog = useManageSuiteScenariosDialog(scopeKey);
  const openDeleteSelectedDialog = useDeleteSelectedScenariosDialog(scopeKey);
  const openRemoveFromSuiteDialog = useRemoveScenariosFromSuiteDialog(scopeKey);
  const suiteMembershipActions = useRef({ removeSuiteMembership, refreshSuiteData });

  useLayoutEffect(() => {
    suiteMembershipActions.current = { removeSuiteMembership, refreshSuiteData };
  }, [removeSuiteMembership, refreshSuiteData]);

  return {
    dialogScopeLifetime,
    openOrganizationDialog,
    openManageSuiteScenariosDialog,
    openDeleteSelectedDialog,
    openRemoveFromSuiteDialog,
    suiteMembershipActions,
  };
};
