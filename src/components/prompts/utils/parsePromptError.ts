// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function parsePromptError(error: unknown) {
  const fallbackMessage = 'Failed to generate prompt. Please try again.';
  const validationErrors: Record<string, string> = {};

  if (!isRecord(error) || !isRecord(error.data)) {
    return { message: fallbackMessage, validationErrors };
  }

  const { data } = error;
  const message = typeof data.error === 'string' ? data.error : fallbackMessage;

  if (Array.isArray(data.fields)) {
    for (const field of data.fields) {
      if (!isRecord(field)) continue;
      if (typeof field.field !== 'string' || typeof field.message !== 'string') continue;
      validationErrors[field.field] = field.message;
    }
  }

  return { message, validationErrors };
}
