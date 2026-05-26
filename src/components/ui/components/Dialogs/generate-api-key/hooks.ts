// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { toaster } from '@/components/ui';
import { useGetApiV2ProjectsQuery, usePostApiV2UploadGenerateKeyMutation } from '@/redux/apis/generatedApi';
import { generateApiKeySchema, GenerateApiKeyFormData } from '@/schemas';
import { useDialogActions } from '@/redux/slices/dialog';

import { GenerateApiKeyDialog } from './generate-api-key-dialog';

export const useGenerateApiKeyBusinessLogic = (closeDialog: () => void) => {
  const { data: projects } = useGetApiV2ProjectsQuery({});

  const firstActiveProject = projects?.find((project) => project.isActive);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GenerateApiKeyFormData>({
    resolver: zodResolver(generateApiKeySchema),
    mode: 'onChange',
    defaultValues: {
      projectId: firstActiveProject?.id || '',
    },
  });

  const [generateKey] = usePostApiV2UploadGenerateKeyMutation();

  const onSubmit = async (data: GenerateApiKeyFormData) => {
    try {
      await generateKey({
        projectId: data.projectId,
      }).unwrap();

      toaster.create({
        title: 'API Key Generated',
        description: 'Your API key has been generated successfully.',
        type: 'success',
      });

      closeDialog();
    } catch {
      toaster.create({
        title: 'Failed to generate API key',
        description: 'Please try again.',
        type: 'error',
      });
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    projects: projects || [],
  };
};

export const useGenerateApiKeyDialog = () => {
  const { openDialog } = useDialogActions();

  return () => openDialog(GenerateApiKeyDialog);
};
