// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { useFileUpload, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

import {
  Alert,
  Dialog,
  DialogBody,
  DialogFooter,
  FileUploadDropzone,
  FileUploadRoot,
  Input,
  toaster,
} from '@/components/ui';
import type { SkillMetadata } from '@/redux/apis/generatedApi';
import { useCreateCustomSkillMutation, useReplaceCustomSkillMutation } from '@/redux/apis/extendedApi';
import { skillPackageSchema, type SkillPackageFormData } from '@/schemas';
import type { DefaultDialogProps } from '@/types';
import { extractApiError } from '@/utils/apiErrors';

export interface SkillPackageDialogProps extends DefaultDialogProps {
  mode: 'create' | 'replace';
  skill?: SkillMetadata;
}

export const SkillPackageDialog = ({ mode, skill, closeDialog }: SkillPackageDialogProps) => {
  const isReplace = mode === 'replace';
  const [apiError, setApiError] = useState<string>();
  const [createSkill, createState] = useCreateCustomSkillMutation();
  const [replaceSkill, replaceState] = useReplaceCustomSkillMutation();
  const isPending = createState.isLoading || replaceState.isLoading;
  const fileUpload = useFileUpload({
    maxFiles: 1,
    accept: ['application/zip', 'application/x-zip-compressed', '.zip'],
  });
  const {
    register,
    handleSubmit,
    setValue,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<SkillPackageFormData>({
    resolver: zodResolver(skillPackageSchema),
    defaultValues: {
      title: isReplace ? skill?.title ?? '' : '',
      category: isReplace ? skill?.category ?? '' : '',
    },
  });
  const selectedFile = fileUpload.acceptedFiles[0];

  useEffect(() => {
    if (selectedFile) {
      setValue('package', selectedFile, { shouldDirty: true, shouldValidate: true });
    } else {
      resetField('package');
    }
  }, [resetField, selectedFile, setValue]);

  const onSubmit = async (values: SkillPackageFormData) => {
    if (isPending) return;

    setApiError(undefined);

    try {
      if (isReplace) {
        if (!skill?.id) throw new Error('The selected skill is unavailable.');

        await replaceSkill({ id: skill.id, ...values }).unwrap();
      } else {
        await createSkill(values).unwrap();
      }

      toaster.create({
        title: isReplace ? 'Skill replaced successfully.' : 'Skill created successfully.',
        type: 'success',
      });
      closeDialog();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : extractApiError(error as FetchBaseQueryError | SerializedError);
      setApiError(message);
      toaster.create({ title: message, type: 'error' });
    }
  };

  const handleClearFile = () => {
    fileUpload.clearFiles();
    resetField('package');
  };

  return (
    <Dialog title={isReplace ? 'Replace skill' : 'Create skill'} onClose={closeDialog} size="lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogBody>
          <VStack align="stretch" gap={5}>
            <Text color="text.secondary">
              {isReplace
                ? 'Upload a new ZIP package to fully replace package-derived metadata, Markdown, and bundled resources. The persisted skill ID and detail route stay the same.'
                : 'Upload one ZIP package containing SKILL.md. Name, description, Markdown, and bundled resources are read from the package.'}
            </Text>

            <Input
              {...register('title')}
              label="Title"
              error={errors.title?.message}
              disabled={isPending}
              autoFocus
            />
            <Input
              {...register('category')}
              label="Category"
              error={errors.category?.message}
              disabled={isPending}
            />

            <VStack align="stretch" gap={2}>
              <Text fontSize="sm" fontWeight="medium">
                ZIP package
              </Text>
              <FileUploadRoot
                value={fileUpload}
                inputProps={{ 'aria-label': 'ZIP package' }}
                cursor="pointer"
                data-invalid={errors.package ? '' : undefined}
              >
                <FileUploadDropzone
                  label="Drag and drop a ZIP package or click to select"
                  description="Exactly one .zip file is required. Package validation is completed securely by the server."
                  w="100%"
                  minH="120px"
                  p={6}
                />
              </FileUploadRoot>
              {errors.package && (
                <Text color="status.error.text" fontSize="sm">
                  {errors.package.message}
                </Text>
              )}
              {selectedFile && (
                <HStack justify="space-between" gap={4}>
                  <Text fontSize="sm" overflow="hidden" textOverflow="ellipsis">
                    Selected: {selectedFile.name}
                  </Text>
                  <Button type="button" variant="outline" size="sm" onClick={handleClearFile} disabled={isPending}>
                    Clear file
                  </Button>
                </HStack>
              )}
            </VStack>

            {apiError && (
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>{isReplace ? 'Skill replacement failed' : 'Skill creation failed'}</Alert.Title>
                  <Alert.Description>{apiError}</Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}
          </VStack>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={closeDialog} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isPending || isSubmitting} disabled={isPending || isSubmitting}>
            {isReplace ? 'Replace skill' : 'Create skill'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
