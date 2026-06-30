// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { toaster } from '@/components/ui/toaster';
import { usePutApiV2ProjectsByIdMutation } from '@/redux/apis/generatedApi';
import { useDialogActions } from '@/redux/slices/dialog';

import { ArchiveProjectDialog } from './archive-project-dialog';

export const useArchiveProjectDialog = () => {
  const { openDialog } = useDialogActions();

  return (projectId: string, archive = false) =>
    openDialog(ArchiveProjectDialog, { projectId, archive });
};

export const useArchiveProjectBusinessLogic = (
  closeDialog: () => void,
  projectId: string,
  archive = false
) => {
  const [updateProject] = usePutApiV2ProjectsByIdMutation();

  const onConfirm = async () => {
    try {
      await updateProject({
        id: projectId,
        updateProjectRequest: {
          isActive: !archive,
        },
      }).unwrap();

      toaster.create({
        title: archive ? 'Project archived successfully.' : 'Project unarchived successfully.',
        type: 'success',
      });

      closeDialog();
    } catch {
      toaster.create({
        title: archive ? 'Failed to archive project.' : 'Failed to unarchive project.',
        type: 'error',
      });
    }
  };

  return {
    onConfirm,
  };
};
