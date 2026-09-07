// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';

export const testScenarioAuthoringSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  details: z.string().trim().optional(),
  objective: z.string().trim().optional(),
  preconditions: z.string().trim().optional(),
  testData: z.string().trim().optional(),
  expectedResult: z.string().trim().optional(),
  notes: z.string().trim().optional(),
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
