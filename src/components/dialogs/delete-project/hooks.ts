import { toaster } from '@/components/ui/toaster';
import { useDeleteApiV2ProjectsByIdMutation } from '@/redux/apis/generatedApi';
import { useDialogActions } from '@/redux/slices/dialog';

import { DeleteProjectDialog } from './delete-project-dialog';

export const useDeleteProjectDialog = () => {
  const { openDialog } = useDialogActions();

  return (projectId: string) =>
    openDialog(DeleteProjectDialog, { projectId });
};

export const useDeleteProjectBusinessLogic = (
  closeDialog: () => void,
  projectId: string
) => {
  const [deleteProject] = useDeleteApiV2ProjectsByIdMutation();

  const onConfirm = async () => {
    try {
      await deleteProject({
        id: projectId,
      }).unwrap();

      toaster.create({
        title: 'Project deleted successfully.',
        type: 'success',
      });

      closeDialog();
    } catch {
      toaster.create({
        title: 'Failed to delete project.',
        type: 'error',
      });
    }
  };

  return {
    onConfirm,
  };
};
