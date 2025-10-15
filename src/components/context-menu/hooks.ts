import { MouseEvent } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

import { useOpenContextMenu } from '@/redux/slices/contextMenu';
import { useUpdateProjectDialog } from '@/components/dialogs/update-project';
import { useArchiveProjectDialog } from '@/components/dialogs/archive-project';

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
