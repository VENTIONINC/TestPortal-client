// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';

import { useGetApiV2PromptsByNameQuery, usePostApiV2PromptsByNameGenerateMutation, useGetApiV2ProjectsQuery, type GetApiV2PromptsByNameApiArg } from '@/redux/apis/generatedApi';
import { useProjectsActions, useSelectedProjectId } from '@/redux/slices/projects';

import { parsePromptError } from '../utils/parsePromptError';

type PromptName = GetApiV2PromptsByNameApiArg['name'];
const promptNames: readonly string[] = ['developer-code-assistant', 'test-portal-assistant', 'issue-analysis-assistant', 'environment-performance-assistant', 'software-documentation-assistant', 'tms-workflow-assistant'] satisfies PromptName[];
const isPromptName = (name: string): name is PromptName => promptNames.includes(name);

export const usePromptBuilder = (name: string) => {
  const isTms = name === 'tms-workflow-assistant';
  const selectedProjectId = useSelectedProjectId();
  const { setSelectedProjectId } = useProjectsActions();
  const { data: projects, isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useGetApiV2ProjectsQuery(undefined, { skip: !isTms });
  const activeProjects = useMemo(() => projects?.filter(project => project.isActive) ?? [], [projects]);
  const project = !projectsError && !projectsLoading ? activeProjects.find(item => item.id === selectedProjectId) : undefined;
  const [parameterState, setParameterState] = useState<{ name: string; values: Record<string, string> }>({ name, values: {} });
  if (parameterState.name !== name) {
    setParameterState({ name, values: {} });
  }
  const parameterValues = useMemo(() => parameterState.name === name ? parameterState.values : {}, [parameterState, name]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<{ key: string; text: string }>();
  const [failure, setFailure] = useState<{ key: string; message: string }>();
  const [isGenerating, setIsGenerating] = useState(false);
  const sequence = useRef(0);
  const { currentData: prompt, isFetching, error } = useGetApiV2PromptsByNameQuery(isPromptName(name) ? { name } : skipToken);
  const [generatePrompt] = usePostApiV2PromptsByNameGenerateMutation();
  const payload = useMemo(() => {
    if (!isTms) return parameterValues;
    const result: Record<string, string> = {};
    if (project) result.project_id = project.id;
    if (parameterValues.task?.trim()) result.task = parameterValues.task;
    if (parameterValues.execution_mode) result.execution_mode = parameterValues.execution_mode;
    return result;
  }, [isTms, project, parameterValues]);
  const key = JSON.stringify([name, isTms ? project?.id : null, payload]);
  const currentKey = useRef(key);
  if (currentKey.current !== key) sequence.current += 1;
  currentKey.current = key;
  const generatedPrompt = output?.key === key ? output.text : '';
  const generateError = failure?.key === key ? failure.message : undefined;
  const requiredFieldsEmpty = Boolean(isTms && !project) || Boolean(prompt && Object.entries(prompt.parameters).some(([paramName, param]) => param.required && !parameterValues[paramName]?.trim()));

  const handleParameterChange = useCallback((paramName: string, value: string) => {
    setParameterState(prev => ({ name, values: { ...(prev.name === name ? prev.values : {}), [paramName]: value } }));
    setValidationErrors(prev => { const next = { ...prev }; delete next[paramName]; return next; });
  }, [name]);

  const handleGenerate = useCallback(async () => {
    if (!prompt || !isPromptName(name) || requiredFieldsEmpty) return;
    const request = ++sequence.current;
    const requestKey = key;
    setIsGenerating(true);
    setOutput(undefined);
    setFailure(undefined);
    setValidationErrors({});
    try {
      const result = await generatePrompt({ name, generatePromptRequest: payload }).unwrap();
      if (request === sequence.current && currentKey.current === requestKey) setOutput({ key: requestKey, text: result.generated_prompt });
    } catch (err) {
      if (request !== sequence.current || currentKey.current !== requestKey) return;
      const { message, validationErrors: fieldErrors } = parsePromptError(err);
      setValidationErrors(fieldErrors);
      setFailure({ key: requestKey, message });
    } finally {
      if (request === sequence.current) setIsGenerating(false);
    }
  }, [prompt, name, requiredFieldsEmpty, key, payload, generatePrompt]);

  useEffect(() => { setValidationErrors({}); setOutput(undefined); setFailure(undefined); setIsGenerating(false); }, [key]);
  useEffect(() => {
    if (!prompt || requiredFieldsEmpty || (!isTms && Object.keys(parameterValues).length === 0)) return;
    const timer = setTimeout(() => { void handleGenerate(); }, 1000);
    return () => clearTimeout(timer);
  }, [key, prompt, requiredFieldsEmpty, isTms, parameterValues, handleGenerate]);

  return { prompt, isFetching, error, parameterValues, validationErrors, generatedPrompt, isGenerating, generateError, requiredFieldsEmpty, handleParameterChange, handleGenerate, isTms, project, activeProjects, projectsLoading, projectsError, refetchProjects, setSelectedProjectId };
};
