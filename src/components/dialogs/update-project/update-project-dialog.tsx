import { Button } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter, Input, Textarea } from '@/components/ui';
import { DefaultDialogProps } from '@/types';

import { useUpdateProject, UpdateProjectDialogParams } from './hooks';

export const UpdateProjectDialog = ({ 
  closeDialog, 
  ...params 
}: DefaultDialogProps & UpdateProjectDialogParams) => {
  const { register, handleSubmit, onSubmit, errors, isSubmitting, isDirty } = useUpdateProject(
    closeDialog, 
    params
  );

  return (
    <Dialog title="Update Project" onClose={closeDialog} size="lg">
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
          Update Project
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
