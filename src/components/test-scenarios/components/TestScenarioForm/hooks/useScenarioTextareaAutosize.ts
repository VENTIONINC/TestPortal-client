// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, type RefObject } from 'react';

import type { TestScenarioAuthoringFormData } from '@/schemas';

import type { TestScenarioInitialStepDraft } from '../../../types';

export const useScenarioTextareaAutosize = (
  root: RefObject<HTMLFormElement | null>,
  steps: TestScenarioInitialStepDraft[],
  { details, preconditions, testData }: Pick<TestScenarioAuthoringFormData, 'details' | 'preconditions' | 'testData'>,
) => {
  useEffect(() => {
    const resizeFields = () => {
      root.current?.querySelectorAll<HTMLTextAreaElement>('[data-autogrow]').forEach((field) => {
        field.style.height = 'auto';
        if (!field.closest('[data-step-key], [data-autogrow-group]')) field.style.height = `${field.scrollHeight}px`;
      });
      root.current?.querySelectorAll<HTMLElement>('[data-step-key], [data-autogrow-group]').forEach((row) => {
        const fields = Array.from(row.querySelectorAll<HTMLTextAreaElement>('[data-autogrow]'));
        const heights = fields.map((field) =>
          Math.min(160, Math.max(40, field.scrollHeight + field.offsetHeight - field.clientHeight)),
        );
        const sharedHeight = Math.max(...heights);
        fields.forEach((field, index) => {
          field.style.height = `${window.innerWidth >= 768 ? sharedHeight : heights[index]}px`;
          field.style.overflowY = field.scrollHeight > field.clientHeight ? 'auto' : 'hidden';
        });
      });
    };
    resizeFields();
    window.addEventListener('resize', resizeFields);
    return () => window.removeEventListener('resize', resizeFields);
  }, [steps, details, preconditions, testData, root]);
};
