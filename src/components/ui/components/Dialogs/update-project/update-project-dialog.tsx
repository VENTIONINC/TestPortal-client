import { Button, Box, SimpleGrid, Text } from '@chakra-ui/react';

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

        <Box borderWidth="1px" borderColor="border.muted" borderRadius="md" p={4} mt={2}>
          <Text fontSize="sm" fontWeight="bold" mb={3} color="fg">
            Category Weights (0 - 100):
          </Text>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4}>
            <Input
              {...register('categoryWeights.bug', { valueAsNumber: true })}
              type="number"
              min={0}
              max={100}
              label="Bug Weight:"
              error={errors.categoryWeights?.bug?.message}
            />
            <Input
              {...register('categoryWeights.infra', { valueAsNumber: true })}
              type="number"
              min={0}
              max={100}
              label="Environment Weight:"
              error={errors.categoryWeights?.infra?.message}
            />
            <Input
              {...register('categoryWeights.script', { valueAsNumber: true })}
              type="number"
              min={0}
              max={100}
              label="Script Weight:"
              error={errors.categoryWeights?.script?.message}
            />
            <Input
              {...register('categoryWeights.performance', { valueAsNumber: true })}
              type="number"
              min={0}
              max={100}
              label="Performance Weight:"
              error={errors.categoryWeights?.performance?.message}
            />
            <Input
              {...register('categoryWeights.other', { valueAsNumber: true })}
              type="number"
              min={0}
              max={100}
              label="Other Weight:"
              error={errors.categoryWeights?.other?.message}
            />
          </SimpleGrid>
        </Box>
      </DialogBody>

      <DialogFooter>
        <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting} disabled={!isDirty || isSubmitting}>
          Update Project
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
