// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';

export const createReadableLabelSchema = (label: string) =>
  z
    .string()
    .refine((value) => !/[\r\n]/.test(value), `${label} must be a single line`)
    .refine((value) => value.trim().length <= 100, `${label} must be 100 characters or fewer`)
    .transform((value) => value.trim());

export const testScenarioAuthoringSchema = z.object({
  scenarioKey: createReadableLabelSchema('Scenario key').optional(),
  title: z.string().trim().min(1, 'Title is required'),
  details: z.string().trim().optional(),
  priority: z.enum(['', 'low', 'medium', 'high']).optional(),
  relatedIssueUrl: z.string().trim().refine((value) => {
    if (!value) return true;
    if (!/^https?:\/\//i.test(value)) return false;
    try { const url = new URL(value); return url.protocol === 'http:' || url.protocol === 'https:'; } catch { return false; }
  }, 'Enter an absolute HTTP(S) URL').optional(),
  preconditions: z.string().trim().optional(),
  testData: z.string().trim().optional(),
});

export type TestScenarioAuthoringFormData = z.infer<typeof testScenarioAuthoringSchema>;

export const testScenarioStepSchema = z.object({
  action: z.string().trim().min(1, 'Step action is required'),
  expectedResult: z.string().trim().optional(),
});

export type TestScenarioStepFormData = z.infer<typeof testScenarioStepSchema>;

// Keep the shorter names available for callers that treat the schema as the form contract.
export const testScenarioFormSchema = testScenarioAuthoringSchema;
export type TestScenarioFormData = TestScenarioAuthoringFormData;
