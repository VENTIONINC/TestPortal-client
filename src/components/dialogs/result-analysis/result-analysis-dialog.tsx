import { Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Dialog, DialogBody, DialogFooter, Field, NativeSelect, Slider, Textarea, toaster } from '@/components/ui';
import { usePatchApiV2ResultsByResultIdAnalysisFeedbackMutation } from '@/redux/apis/generatedApi';
import { resultAnalysisSchema } from '@/schemas';
import { AnalysisCategory, BaseResult, DefaultDialogProps } from '@/types';
import { ANALYSIS_CATEGORY_LABELS, getConfidenceLabel, getErrorQualityLabel } from '@/utils';

type ResultAnalysisFormData = z.infer<typeof resultAnalysisSchema>;

interface ResultAnalysisDialogProps extends DefaultDialogProps {
  result: BaseResult;
}

const toAnalysisCategory = (value?: string): AnalysisCategory | undefined => {
  if (!value) {
    return undefined;
  }

  return Object.values(AnalysisCategory).includes(value as AnalysisCategory) ? (value as AnalysisCategory) : undefined;
};

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
      analysisCategory: toAnalysisCategory(result.analysisFeedbackCategory) ?? result.analysisCategory,
      analysisConclusion: result.analysisFeedbackConclusion ?? result.analysisConclusion,
      analysisConfidence: result.analysisFeedbackConfidence ?? result.analysisConfidence,
    },
  });

  const [updateResultAnalysis] = usePatchApiV2ResultsByResultIdAnalysisFeedbackMutation();

  const onSubmit = async (data: ResultAnalysisFormData) => {
    try {
      await updateResultAnalysis({
        resultId: String(result.id),
        updateResultAnalysisFeedbackRequest: {
          analysisFeedbackCategory: data.analysisCategory,
          analysisFeedbackConclusion: data.analysisConclusion,
          analysisFeedbackConfidence: data.analysisConfidence,
        },
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
              label: ANALYSIS_CATEGORY_LABELS[category],
            })),
          ]}
        />
        <Slider
          label="Analysis Confidence:"
          value={[watch('analysisConfidence')]}
          onValueChange={({ value }) => {
            setValue('analysisConfidence', value[0], { shouldDirty: true });
          }}
          min={1}
          max={5}
          step={1}
          showValue
          formatValue={(value) => getConfidenceLabel(value)}
          marks={[1, 2, 3, 4, 5]}
        />
        <Slider
          label="Error Quality:"
          value={[result.analysisErrorQuality || 0]}
          min={0}
          max={5}
          step={1}
          showValue
          formatValue={(value) => getErrorQualityLabel(value)}
          marks={[1, 2, 3, 4, 5]}
          readOnly
        />
        <Field label="Error Quality Conclusion:" readOnly>
          {result.analysisErrorQualityConclusion || 'N/A'}
        </Field>
      </DialogBody>

      <DialogFooter>
        <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting} disabled={!isDirty || isSubmitting}>
          Save
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
