import { MouseEvent } from 'react';
import { FiTrash2 } from 'react-icons/fi';

import { useConfirmResultDeletionDialog } from '@/components/dialogs/confirm-result-deletion';
import { useOpenContextMenu } from '@/redux/slices/contextMenu';

type UseResultContextMenuType = () => (
  evt: MouseEvent,
  result: {
    id: string;
    retry: number;
    specName: string;
    projectId: string;
  },
) => void;

export const useResultContextMenu: UseResultContextMenuType = () => {
  const openContextMenu = useOpenContextMenu();
  const confirmResultDeletionDialog = useConfirmResultDeletionDialog();

  const getOptions = (result: { id: string; retry: number; specName: string; projectId: string }) => [
    {
      title: 'Delete Result',
      onClick: () => confirmResultDeletionDialog(result.id, result.retry, result.specName, result.projectId),
      icon: FiTrash2,
      divider: true,
    },
  ];

  return (evt, result) => {
    openContextMenu(evt, getOptions(result));
  };
};
