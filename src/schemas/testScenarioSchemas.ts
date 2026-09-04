// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';

export const testScenarioAuthoringSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  contentMd: z.string().min(1, 'Markdown content is required'),
});

export type TestScenarioAuthoringFormData = z.infer<typeof testScenarioAuthoringSchema>;

// Keep the shorter names available for callers that treat the schema as the form contract.
export const testScenarioFormSchema = testScenarioAuthoringSchema;
export type TestScenarioFormData = TestScenarioAuthoringFormData;
