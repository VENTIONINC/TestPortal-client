// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { MouseEvent } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

import { useOpenContextMenu } from '@/redux/slices/contextMenu';
import { useUpdateProjectDialog, useArchiveProjectDialog } from '@/components/ui/components';

type UseProjectContextMenuType = () => (evt: MouseEvent, project: { id: string; isActive: boolean }) => void;

export const useProjectContextMenu: UseProjectContextMenuType = () => {
  const openContextMenu = useOpenContextMenu();
  const updateProjectDialog = useUpdateProjectDialog();
  const archiveProjectDialog = useArchiveProjectDialog();

  const getOptions = (project: { id: string; isActive: boolean }) => [
    {
      title: 'Edit Project',
      onClick: () => updateProjectDialog(project.id),
      icon: FiEdit,
      disabled: !project.isActive,
    },
    {
      title: 'Archive Project',
      onClick: () => archiveProjectDialog(project.id),
      icon: FiTrash2,
      divider: true,
      disabled: !project.isActive,
    },
  ];

  return (evt, project) => {
    openContextMenu(evt, getOptions(project));
  };
};
