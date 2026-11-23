// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useDialogActions } from '@/redux/slices/dialog';

import { CatalogOrganizationDialog, type CatalogOrganizationDialogOptions } from '../CatalogOrganizationDialog';

export const useCatalogOrganizationDialog = (scopeKey: string) => {
  const { openDialog } = useDialogActions(scopeKey);

  return (options: CatalogOrganizationDialogOptions) => openDialog(CatalogOrganizationDialog, { options });
};
