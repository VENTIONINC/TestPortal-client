// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useNavigate } from 'react-router';

import { toaster } from '@/components/ui';
import { usePostApiV2TestScenariosMutation } from '@/redux/apis/generatedApi';
import { type TestScenarioAuthoringFormData } from '@/schemas';
import { extractApiError } from '@/utils/apiErrors';
import { PATHS } from '@/types/paths';

import { TestScenarioForm } from '../components/TestScenarioForm';
import { getTestScenarioDetailPath } from '../constants';

export interface TestScenarioCreateContainerProps {
  projectId: string;
}

const EMPTY_VALUES = { title: '', details: '', contentMd: '' } as const;

export const TestScenarioCreateContainer = ({ projectId }: TestScenarioCreateContainerProps) => {
  const navigate = useNavigate();
  const [createScenario, { isLoading: isMutationLoading }] = usePostApiV2TestScenariosMutation();
  const [apiError, setApiError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlight = useRef(false);

  const handleSubmit = async (values: TestScenarioAuthoringFormData) => {
    if (submitInFlight.current) return;

    submitInFlight.current = true;
    setIsSubmitting(true);
    setApiError(undefined);

    try {
      const scenario = await createScenario({
        createTestScenarioRequest: {
          projectId,
          title: values.title,
          contentMd: values.contentMd,
          ...(values.details?.trim() ? { details: values.details.trim() } : {}),
        },
      }).unwrap();

      toaster.create({ title: 'Test Scenario created successfully.', type: 'success' });
      navigate(getTestScenarioDetailPath(scenario.id), { replace: true });
    } catch (error) {
      const message = extractApiError(error as FetchBaseQueryError | SerializedError);
      setApiError(message);
      toaster.create({ title: message, type: 'error' });
    } finally {
      submitInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <TestScenarioForm
      mode="create"
      initialValues={EMPTY_VALUES}
      isSubmitting={isSubmitting || isMutationLoading}
      apiError={apiError}
      onSubmit={handleSubmit}
      onCancel={() => navigate(PATHS.TEST_SCENARIOS)}
    />
  );
};
