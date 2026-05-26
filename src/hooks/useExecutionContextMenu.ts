import { MouseEvent } from 'react';
import { FiTrash2 } from 'react-icons/fi';

import { useOpenContextMenu } from '@/redux/slices/contextMenu';
import { useConfirmExecutionDeletionDialog } from '@/components/ui';

type UseExecutionContextMenuType = () => (
  evt: MouseEvent,
  execution: { id: string; name: string; projectId: string },
) => void;

export const useExecutionContextMenu: UseExecutionContextMenuType = () => {
  const openContextMenu = useOpenContextMenu();
  const confirmExecutionDeletionDialog = useConfirmExecutionDeletionDialog();

  const getOptions = (execution: { id: string; name: string; projectId: string }) => [
    {
      title: 'Delete Execution',
      onClick: () => confirmExecutionDeletionDialog(execution.id, execution.name, execution.projectId),
      icon: FiTrash2,
      divider: true,
    },
  ];

  return (evt, execution) => {
    openContextMenu(evt, getOptions(execution));
  };
};
