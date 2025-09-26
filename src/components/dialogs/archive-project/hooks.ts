import { toaster } from '@/components/ui/toaster';
import { usePutApiV2ProjectsByIdMutation } from '@/redux/apis/generatedApi';
import { useDialogActions } from '@/redux/slices/dialog';

import { ArchiveProjectDialog } from './archive-project-dialog';

export const useArchiveProjectDialog = () => {
  const { openDialog } = useDialogActions();

  return (projectId: string) => openDialog(ArchiveProjectDialog, { projectId });
};

export const useArchiveProjectBusinessLogic = (closeDialog: () => void, projectId: string) => {
  const [updateProject] = usePutApiV2ProjectsByIdMutation();

  const onConfirm = async () => {
    try {
      await updateProject({
        id: projectId,
        updateProjectRequest: {
          isActive: false,
        },
      }).unwrap();

      toaster.create({
        title: 'Project archived successfully.',
        type: 'success',
      });

      closeDialog();
    } catch {
      toaster.create({
        title: 'Failed to archive project.',
        type: 'error',
      });
    }
  };

  return {
    onConfirm,
  };
};
