import { useDialogActions } from '@/redux/slices/dialog';

import { CreateProjectDialog } from './create-project-dialog';

export const useCreateProjectDialog = () => {
  const { openDialog } = useDialogActions();

  return () => openDialog(CreateProjectDialog, {});
};