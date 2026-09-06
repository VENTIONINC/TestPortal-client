// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useNavigate } from 'react-router';

import { toaster } from '@/components/ui';
import { usePatchApiV2TestScenariosByScenarioIdMutation } from '@/redux/apis/generatedApi';
import { type TestScenarioAuthoringFormData } from '@/schemas';
import { PATHS } from '@/types/paths';
import { extractApiError } from '@/utils/apiErrors';

import { TestScenarioDetailStateView, TestScenarioForm } from '../components';
import { useTestScenarioDetail } from '../hooks/useTestScenarioDetail';
import { getTestScenarioPatchPayload } from '../utils';

export interface TestScenarioEditContainerProps {
  projectId: string;
  scenarioId: string;
}

export const TestScenarioEditContainer = ({ projectId, scenarioId }: TestScenarioEditContainerProps) => {
  const navigate = useNavigate();
  const detail = useTestScenarioDetail(projectId, scenarioId);
  const [updateScenario, { isLoading: isMutationLoading }] = usePatchApiV2TestScenariosByScenarioIdMutation();
  const [apiError, setApiError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlight = useRef(false);
  const goToCatalog = () => navigate(PATHS.TEST_SCENARIOS);

  const handleSubmit = async (values: TestScenarioAuthoringFormData) => {
    if (submitInFlight.current || !detail.scenario) return;

    const payload = getTestScenarioPatchPayload(values, detail.scenario);
    setApiError(undefined);
    setSuccessMessage(undefined);

    if (!payload) {
      setSuccessMessage('No changes to save.');
      return;
    }

    submitInFlight.current = true;
    setIsSubmitting(true);

    try {
      const response = await updateScenario({
        scenarioId,
        projectId,
        updateTestScenarioRequest: payload,
      }).unwrap();

      detail.setPersistedScenario(response);
      setSuccessMessage('Test Scenario saved successfully.');
      toaster.create({ title: 'Test Scenario saved successfully.', type: 'success' });
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
    <TestScenarioDetailStateView
      scenario={detail.scenario}
      isLoading={detail.isLoading}
      isUnavailable={detail.isUnavailable}
      isError={detail.isError}
      onRetry={() => void detail.refetch()}
      onBack={goToCatalog}
    >
      {(scenario) => (
        <TestScenarioForm
          mode="edit"
          initialValues={scenario}
          isSubmitting={isSubmitting || isMutationLoading}
          apiError={apiError}
          successMessage={successMessage}
          onSubmit={handleSubmit}
          onCancel={goToCatalog}
        />
      )}
    </TestScenarioDetailStateView>
  );
};
