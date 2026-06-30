// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter, Input, Textarea } from '@/components/ui';
import { DefaultDialogProps } from '@/types';

import { useCreateProject } from './hooks';

export const CreateProjectDialog = ({ closeDialog }: DefaultDialogProps) => {
  const { register, handleSubmit, onSubmit, errors, isSubmitting, isDirty } = useCreateProject(closeDialog);

  return (
    <Dialog title="Create Project" onClose={closeDialog} size="lg">
      <DialogBody display="flex" flexDir="column" gap={5}>
        <Input {...register('name')} label="Project Name:" error={errors.name?.message} />
        <Textarea
          {...register('description')}
          label="Description (optional):"
          autoresize
          error={errors.description?.message}
        />
      </DialogBody>

      <DialogFooter>
        <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting} disabled={!isDirty || isSubmitting}>
          Create Project
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
