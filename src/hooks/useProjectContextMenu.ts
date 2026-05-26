// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { MouseEvent } from 'react';
import { FiEdit, FiArchive, FiRotateCcw, FiTrash2 } from 'react-icons/fi';

import { useUpdateProjectDialog, useArchiveProjectDialog, useDeleteProjectDialog } from '@/components/ui';
import { useOpenContextMenu } from '@/redux/slices/contextMenu';

type UseProjectContextMenuType = () => (evt: MouseEvent, project: { id: string; isActive: boolean }) => void;

export const useProjectContextMenu: UseProjectContextMenuType = () => {
  const openContextMenu = useOpenContextMenu();
  const updateProjectDialog = useUpdateProjectDialog();
  const archiveProjectDialog = useArchiveProjectDialog();
  const deleteProjectDialog = useDeleteProjectDialog();

  const getOptions = (project: { id: string; isActive: boolean }) => [
    {
      title: 'Edit Project',
      onClick: () => updateProjectDialog(project.id),
      icon: FiEdit,
      disabled: !project.isActive,
    },
    project.isActive
      ? {
          title: 'Archive Project',
          onClick: () => archiveProjectDialog(project.id, true),
          icon: FiArchive,
        }
      : {
          title: 'Unarchive Project',
          onClick: () => archiveProjectDialog(project.id, false),
          icon: FiRotateCcw,
        },
    {
      title: 'Delete Project',
      onClick: () => deleteProjectDialog(project.id),
      icon: FiTrash2,
      disabled: project.isActive,
    },
  ];

  return (evt, project) => {
    openContextMenu(evt, getOptions(project));
  };
};
