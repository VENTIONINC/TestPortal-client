// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';

const isZipFile = (value: unknown): value is File =>
  value instanceof File &&
  (value.name.toLowerCase().endsWith('.zip') ||
    value.type === 'application/zip' ||
    value.type === 'application/x-zip-compressed');

export const skillPackageSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  category: z.string().trim().min(1, 'Category is required'),
  package: z
    .custom<File>((value) => value instanceof File, 'A ZIP package is required')
    .refine(isZipFile, 'Select a ZIP package'),
});

export type SkillPackageFormData = z.infer<typeof skillPackageSchema>;
