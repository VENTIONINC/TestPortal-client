import { z } from 'zod';

import { IssueCategory } from '@/types';

export * from './result-analysis-schemas';
export * from './authSchemas';

export const formatMessageSchema = z.object({
  name: z.string().min(1, 'Issue name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.nativeEnum(IssueCategory, {
    errorMap: () => ({ message: 'Please select a category' }),
  }),
});

const categoryWeightsSchema = z.object({
  bug: z.number().min(0, 'Weight must be at least 0').max(100, 'Weight cannot exceed 100'),
  infra: z.number().min(0, 'Weight must be at least 0').max(100, 'Weight cannot exceed 100'),
  script: z.number().min(0, 'Weight must be at least 0').max(100, 'Weight cannot exceed 100'),
  performance: z.number().min(0, 'Weight must be at least 0').max(100, 'Weight cannot exceed 100'),
  other: z.number().min(0, 'Weight must be at least 0').max(100, 'Weight cannot exceed 100'),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  categoryWeights: categoryWeightsSchema.optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  categoryWeights: categoryWeightsSchema.optional(),
});

export const generateApiKeySchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
});

export const analysisExportSchema = z
  .object({
    projectId: z.string().min(1, 'Project is required'),
    dateFrom: z.string().min(1, 'Date from is required'),
    dateTo: z.string().min(1, 'Date to is required'),
  })
  .refine(
    (data) => {
      if (!data.dateFrom || !data.dateTo) return true;
      return new Date(data.dateFrom) <= new Date(data.dateTo);
    },
    {
      message: 'Date to must be on or after date from',
      path: ['dateTo'],
    },
  );

export type FormatMessageFormData = z.infer<typeof formatMessageSchema>;
export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;
export type GenerateApiKeyFormData = z.infer<typeof generateApiKeySchema>;
export type AnalysisExportFormData = z.infer<typeof analysisExportSchema>;
