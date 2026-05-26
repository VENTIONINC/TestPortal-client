// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { toaster } from '@/components/ui';
import { usePutApiV2ProjectsByIdMutation, useGetApiV2ProjectsQuery } from '@/redux/apis/generatedApi';
import { updateProjectSchema, UpdateProjectFormData } from '@/schemas';
import { useDialogActions } from '@/redux/slices/dialog';

import { UpdateProjectDialog } from './update-project-dialog';

export interface UpdateProjectDialogParams {
  projectId: string;
}

export const useUpdateProject = (closeDialog: () => void, params: UpdateProjectDialogParams) => {
  const { data: projects } = useGetApiV2ProjectsQuery({});
  const project = projects!.find((p) => p.id === params.projectId);

  if (!project) {
    throw new Error('Project not found');
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProjectFormData>({
    resolver: zodResolver(updateProjectSchema),
    mode: 'onChange',
    defaultValues: {
      name: project.name,
      description: project.description || '',
    },
  });

  const [updateProject] = usePutApiV2ProjectsByIdMutation();

  const onSubmit = async (data: UpdateProjectFormData) => {
    try {
      await updateProject({
        id: params.projectId,
        updateProjectRequest: data,
      }).unwrap();

      toaster.create({ title: 'Project updated successfully.', type: 'success' });

      closeDialog();
    } catch {
      toaster.create({ title: 'Failed to update project.', type: 'error' });
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    isDirty,
  };
};

export const useUpdateProjectDialog = () => {
  const { openDialog } = useDialogActions();

  return (projectId: string) => openDialog(UpdateProjectDialog, { projectId });
};
