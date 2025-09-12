import { Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Dialog, DialogBody, DialogFooter, Input, Textarea, toaster } from '@/components/ui';
import { usePostApiV2ProjectsMutation } from '@/redux/apis/generatedApi';
import { createProjectSchema } from '@/schemas';
import { DefaultDialogProps } from '@/types';

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export const CreateProjectDialog = ({ closeDialog }: DefaultDialogProps) => {
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
