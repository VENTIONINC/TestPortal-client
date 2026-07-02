// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';

import { AnalysisCategory } from '@/types';

export const resultAnalysisSchema = z.object({
  analysisCategory: z.nativeEnum(AnalysisCategory),
  analysisConclusion: z.string().min(1, 'Analysis conclusion is required'),
  analysisConfidence: z
    .number()
    .int('Analysis confidence must be an integer')
    .min(1, 'Analysis confidence must be at least 1')
    .max(5, 'Analysis confidence must be at most 5'),
});
