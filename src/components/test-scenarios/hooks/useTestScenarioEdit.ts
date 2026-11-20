// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef, useState } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { usePatchApiV2TestScenariosByScenarioIdMutation } from '@/redux/apis/extendedApi';
import type { TestScenario } from '@/redux/apis/generatedApi';
import { extractApiError } from '@/utils/apiErrors';

import type { TestScenarioFormProps } from '../components/TestScenarioForm';
import { getTestScenarioEditableValues, getTestScenarioPatchPayload } from '../utils';
import { useTestScenarioDetail } from './useTestScenarioDetail';

export const useTestScenarioEdit = (projectId: string, scenarioId: string, onSaved: () => void) => {
  const detail = useTestScenarioDetail(projectId, scenarioId);
  const [updateScenario, { isLoading }] = usePatchApiV2TestScenariosByScenarioIdMutation();
  const [baseline, setBaseline] = useState<TestScenario>();
  const [apiError, setApiError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState(0);
  const inFlight = useRef(false);
  const allowNavigation = useRef(false);
  const mounted = useRef(true);
  const scope = useRef(`${projectId}:${scenarioId}`);
  scope.current = `${projectId}:${scenarioId}`;
  const isCurrent = () => mounted.current && scope.current === `${projectId}:${scenarioId}`;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (detail.scenario && !baseline) setBaseline(detail.scenario);
  }, [baseline, detail.scenario]);

  const adopt = (scenario: TestScenario) => {
    setBaseline(scenario);
    detail.setPersistedScenario(scenario);
    setToken((value) => value + 1);
    setDirty(false);
  };

  const handleSubmit: TestScenarioFormProps['onSubmit'] = async (values, steps, folderId, collections) => {
    if (inFlight.current || !baseline) return;
    const fields = getTestScenarioPatchPayload(values, getTestScenarioEditableValues(baseline));
    const finalSteps = steps.map(({ id, action, expectedResult }) => ({
      ...(id ? { id } : {}),
      action: action.trim(),
      expectedResult: expectedResult.trim() || null,
    }));
    const savedSteps = baseline.steps.map(({ id, action, expectedResult }) => ({ id, action, expectedResult }));
    const suiteIds = collections?.suiteIds ?? [];
    const newSuites = collections?.newSuites ?? [];
    const folderChanged = folderId !== undefined && folderId !== baseline.folderId;
    if (
      !fields &&
      !folderChanged &&
      JSON.stringify(finalSteps) === JSON.stringify(savedSteps) &&
      JSON.stringify([...suiteIds].sort()) === JSON.stringify((baseline.suites ?? []).map((s) => s.id).sort()) &&
      !newSuites.length
    ) {
      setSuccessMessage('No changes to save.');
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    setApiError(undefined);
    setSuccessMessage(undefined);
    try {
      const request = {
        ...fields,
        ...(folderChanged ? { folderId } : {}),
        expectedRevision: baseline.revision,
        steps: finalSteps,
        suiteIds,
        newSuites,
      };
      const response = await updateScenario({ scenarioId, projectId, updateTestScenarioRequest: request }).unwrap();
      if (!isCurrent()) return;
      adopt(response);
      allowNavigation.current = true;
      setSaved(true);
      setSuccessMessage('Test Scenario saved successfully.');
      setTimeout(() => {
        if (isCurrent()) onSaved();
      }, 0);
    } catch (error) {
      if (!isCurrent()) return;
      setApiError(
        (error as FetchBaseQueryError).status === 409
          ? 'The saved scenario or suite membership changed. Your entire draft is preserved. Correct any suite name conflict, or reload the saved scenario to recover from a stale revision.'
          : extractApiError(error as FetchBaseQueryError | SerializedError),
      );
    } finally {
      if (isCurrent()) {
        inFlight.current = false;
        setSubmitting(false);
      }
    }
  };

  const reloadScenario = async () => {
    if (inFlight.current || !window.confirm('Discard unsaved scenario changes and reload the saved scenario?')) return;
    inFlight.current = true;
    setSubmitting(true);
    try {
      const result = (await detail.refetch()) as { data?: TestScenario; error?: unknown };
      if (!isCurrent()) return;
      if (result.error || !result.data) throw result.error ?? new Error('Reload failed');
      adopt(result.data);
      setApiError(undefined);
      setSuccessMessage(undefined);
    } catch {
      if (isCurrent()) setApiError('Reload failed. Your draft is preserved. Please try again.');
    } finally {
      if (isCurrent()) {
        inFlight.current = false;
        setSubmitting(false);
      }
    }
  };

  const scenario = baseline ?? detail.scenario;

  return {
    scenario,
    isLoading: detail.isLoading,
    isUnavailable: detail.isUnavailable,
    isError: detail.isError,
    retry: detail.refetch,
    allowNavigation,
    hasUnsavedChanges: dirty && !saved,
    setDirty,
    isSubmitting: submitting || isLoading,
    apiError,
    successMessage,
    reconciliation:
      token && scenario ? { token, values: getTestScenarioEditableValues(scenario), submittedFields: [] } : undefined,
    handleSubmit,
    reloadScenario,
  };
};
