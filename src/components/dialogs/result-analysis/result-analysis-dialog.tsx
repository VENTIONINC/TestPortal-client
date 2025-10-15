import { Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Dialog, DialogBody, DialogFooter, NativeSelect, Slider, Textarea, toaster } from '@/components/ui';
import { usePatchApiV1ResultsByResultIdAnalysisMutation } from '@/redux/apis/generatedApi';
import { resultAnalysisSchema } from '@/schemas';
import { AnalysisCategory, BaseResult, DefaultDialogProps } from '@/types';

type ResultAnalysisFormData = z.infer<typeof resultAnalysisSchema>;

interface ResultAnalysisDialogProps extends DefaultDialogProps {
  result: BaseResult;
}

export const ResultAnalysisDialog = ({ result, closeDialog }: ResultAnalysisDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
    setValue,
  } = useForm<ResultAnalysisFormData>({
    resolver: zodResolver(resultAnalysisSchema),
    mode: 'onChange',
    defaultValues: {
      analysisCategory: result.analysisCategory,
      analysisConclusion: result.analysisConclusion,
      analysisConfidence: result.analysisConfidence,
    },
  });

  const [updateResultAnalysis] = usePatchApiV1ResultsByResultIdAnalysisMutation();

  const onSubmit = async (data: ResultAnalysisFormData) => {
    try {
      await updateResultAnalysis({
        resultId: String(result.id),
        updateResultAnalysisRequest: data,
      }).unwrap();

      toaster.create({ title: 'The result analysis has been updated successfully.', type: 'success' });

      closeDialog();
    } catch {
      toaster.create({ title: 'Failed to update the result analysis.', type: 'error' });
    }
  };

  return (
    <Dialog title="Result Analysis" onClose={closeDialog} size="lg">
      <DialogBody display="flex" flexDir="column" gap={5}>
        <Textarea
          {...register('analysisConclusion')}
          label="Analysis Conclusion:"
          autoresize
          error={errors.analysisConclusion?.message}
        />
        <NativeSelect
          {...register('analysisCategory')}
          label="Analysis Category:"
          items={[
            ...Object.values(AnalysisCategory).map((category) => ({
              value: category,
              label: category.charAt(0).toUpperCase() + category.slice(1),
            })),
          ]}
        />
        <Slider
          label="Analysis Confidence:"
          value={[watch('analysisConfidence')]}
          onValueChange={({ value }) => {
            setValue('analysisConfidence', value[0], { shouldDirty: true });
          }}
          min={0}
          max={1}
          step={0.01}
          showValue
          formatValue={(value) => `${Math.round(value * 100)}%`}
          marks={[
            { value: 0, label: '0%' },
            { value: 0.25, label: '25%' },
            { value: 0.5, label: '50%' },
            { value: 0.75, label: '75%' },
            { value: 1, label: '100%' },
          ]}
        />
      </DialogBody>

      <DialogFooter>
        <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting} disabled={!isDirty || isSubmitting}>
          Save
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
