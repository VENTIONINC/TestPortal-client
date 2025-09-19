import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { toaster } from '@/components/ui';
import { usePostApiV2ProjectsMutation } from '@/redux/apis/generatedApi';
import { createProjectSchema } from '@/schemas';
import { useDialogActions } from '@/redux/slices/dialog';

import { CreateProjectDialog } from './create-project-dialog';

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export const useCreateProject = (closeDialog: () => void) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const [createProject] = usePostApiV2ProjectsMutation();

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      await createProject({
        createProjectRequest: data,
      }).unwrap();

      toaster.create({ title: 'Project created successfully.', type: 'success' });

      closeDialog();
    } catch {
      toaster.create({ title: 'Failed to create project.', type: 'error' });
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

export const useCreateProjectDialog = () => {
  const { openDialog } = useDialogActions();

  return () => openDialog(CreateProjectDialog, {});
};