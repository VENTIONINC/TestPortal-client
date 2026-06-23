import { Button, Text, Box } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Dialog, DialogBody, DialogFooter, NativeSelect, Slider, Textarea, toaster, Alert } from '@/components/ui';
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

  const isConfirmed = Boolean(result.analysisFeedbackCategory);

  return (
    <Dialog title="Result analysis" onClose={closeDialog} size="md">
      <DialogBody display="flex" flexDir="column" gap={5}>
        {isConfirmed ? (
          <Alert.Root status="success">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title fontSize="xs" fontWeight="bold">Verified Analysis</Alert.Title>
              <Alert.Description fontSize="xs">
                This classification has been reviewed and verified by a user.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        ) : (
          <Alert.Root status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title fontSize="xs" fontWeight="bold">AI-Generated Proposal</Alert.Title>
              <Alert.Description fontSize="xs">
                Suggested by AI (GPT-4.1-mini). Review and click "Save" to verify or adjust details.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}
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

        <Box>
          <Text mb={1} fontWeight={400} fontSize="sm" color="text.main">
            Error quality conclusion:
          </Text>
          <Text fontWeight={400} fontSize="sm" color="text.secondary" lineHeight="md">
            {result.analysisErrorQualityConclusion || 'N/A'}
          </Text>
        </Box>
      </DialogBody>

      <DialogFooter pb={4} pt={0} px={6}>
        <Button variant="outline" onClick={closeDialog} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="primary"
          px={4}
          loading={isSubmitting}
          disabled={!isDirty || isSubmitting}
        >
          Save
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
