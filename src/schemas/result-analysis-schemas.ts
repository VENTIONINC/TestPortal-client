import { z } from 'zod';

import { AnalysisCategory } from '@/types';

export const resultAnalysisSchema = z.object({
  analysisCategory: z.nativeEnum(AnalysisCategory),
  analysisConclusion: z.string().min(1, 'Analysis conclusion is required'),
  analysisConfidence: z
    .number()
    .min(0, 'Analysis confidence is required')
    .max(1, 'Analysis confidence must be less than or equal to 1'),
});
