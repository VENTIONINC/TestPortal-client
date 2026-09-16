// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useNavigate } from 'react-router';

import { toaster } from '@/components/ui';
import { usePatchApiV2TestScenariosByScenarioIdMutation } from '@/redux/apis/generatedApi';
import { type TestScenarioAuthoringFormData } from '@/schemas';
import { PATHS } from '@/types/paths';
import { extractApiError } from '@/utils/apiErrors';

import { TestScenarioDetailStateView, TestScenarioForm, TestScenarioStepsEditor } from '../components';
import { useTestScenarioDetail } from '../hooks/useTestScenarioDetail';
import { getTestScenarioEditableValues, getTestScenarioPatchPayload } from '../utils';
import type { TestScenarioEditableField } from '../types';

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
  const [reconciliation, setReconciliation] = useState<{
    token: number;
    values: ReturnType<typeof getTestScenarioEditableValues>;
    submittedFields: TestScenarioEditableField[];
  }>();
  const submitInFlight = useRef(false);
  const mountedRef = useRef(true);
  const latestScope = useRef(`${projectId}:${scenarioId}`);
  const goToCatalog = useCallback(() => navigate(PATHS.TEST_SCENARIOS), [navigate]);

  latestScope.current = `${projectId}:${scenarioId}`;
  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  const isCurrentScope = useCallback(
    () => mountedRef.current && latestScope.current === `${projectId}:${scenarioId}`,
    [projectId, scenarioId],
  );

  const handleSubmit = async (values: TestScenarioAuthoringFormData) => {
    if (submitInFlight.current || !detail.scenario) return;

    const savedValues = getTestScenarioEditableValues(detail.scenario);
    const payload = getTestScenarioPatchPayload(values, savedValues);
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

      if (!isCurrentScope()) return;
      detail.setPersistedScenario(response);
      setReconciliation({
        token: Date.now(),
        values: getTestScenarioEditableValues(response),
        submittedFields: Object.keys(payload) as TestScenarioEditableField[],
      });
      setSuccessMessage('Test Scenario saved successfully.');
      toaster.create({ title: 'Test Scenario saved successfully.', type: 'success' });
    } catch (error) {
      if (!isCurrentScope()) return;
      const message = extractApiError(error as FetchBaseQueryError | SerializedError);
      setApiError(message);
      toaster.create({ title: message, type: 'error' });
    } finally {
      if (isCurrentScope()) {
        submitInFlight.current = false;
        setIsSubmitting(false);
      }
    }
  };

  const handleScenarioUpdated = useCallback(
    (scenario: NonNullable<typeof detail.scenario>) => {
      if (!isCurrentScope()) return;
      detail.setPersistedScenario(scenario);
      setApiError(undefined);
      setSuccessMessage(undefined);
    },
    [detail, isCurrentScope],
  );

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
        <>
          <TestScenarioForm
            mode="edit"
            initialValues={scenario}
            reconciliation={reconciliation}
            isSubmitting={isSubmitting || isMutationLoading}
            apiError={apiError}
            successMessage={successMessage}
            onSubmit={handleSubmit}
            onCancel={goToCatalog}
          />
          <TestScenarioStepsEditor
            scenario={scenario}
            projectId={projectId}
            scenarioId={scenarioId}
            onScenarioUpdated={handleScenarioUpdated}
            onRefresh={async () => detail.refetch()}
          />
        </>
      )}
    </TestScenarioDetailStateView>
  );
};
