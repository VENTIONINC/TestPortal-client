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

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
});

export type FormatMessageFormData = z.infer<typeof formatMessageSchema>;
export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
