// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter, NativeSelect } from '@/components/ui';
import { DefaultDialogProps } from '@/types';

import { useGenerateApiKeyBusinessLogic } from './hooks';

export const GenerateApiKeyDialog = ({ closeDialog }: DefaultDialogProps) => {
  const { register, handleSubmit, onSubmit, errors, isSubmitting, projects } =
    useGenerateApiKeyBusinessLogic(closeDialog);

  const projectItems = projects
    .filter((project) => project.isActive)
    .map((project) => ({
      value: project.id,
      label: project.name,
    }));

  return (
    <Dialog title="Generate API Key" onClose={closeDialog} size="md">
      <DialogBody display="flex" flexDir="column" gap={5}>
        <NativeSelect
          {...register('projectId')}
          label="Select Project:"
          items={projectItems}
          error={errors.projectId?.message}
        />
      </DialogBody>

      <DialogFooter>
        <Button variant="ghost" onClick={closeDialog}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting} disabled={isSubmitting}>
          Generate
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
