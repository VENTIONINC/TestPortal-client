import { useState, useCallback, useEffect, useMemo } from 'react';

import { useGetApiV2PromptsByNameQuery, usePostApiV2PromptsByNameGenerateMutation } from '@/redux/apis/generatedApi';

export const usePromptBuilder = (name: string) => {
  const [parameterValues, setParameterValues] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  const {
    data: prompt,
    isFetching,
    error,
  } = useGetApiV2PromptsByNameQuery({
    name: name as
      | 'developer-code-assistant'
      | 'test-portal-assistant'
      | 'issue-analysis-assistant'
      | 'environment-performance-assistant',
  });

  const [generatePrompt, { isLoading: isGenerating, error: generateError }] =
    usePostApiV2PromptsByNameGenerateMutation();

  const handleParameterChange = useCallback((paramName: string, value: string) => {
    setParameterValues((prev) => ({ ...prev, [paramName]: value }));

    setValidationErrors((prev) => {
      if (prev[paramName]) {
        const newErrors = { ...prev };
        delete newErrors[paramName];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const validateParameters = useCallback(() => {
    if (!prompt) return false;

    const errors: Record<string, string> = {};
    let isValid = true;

    Object.entries(prompt.parameters).forEach(([paramName, parameter]) => {
      if (parameter.required && !parameterValues[paramName]?.toString().trim()) {
        errors[paramName] = `${paramName.replace(/_/g, ' ')} is required`;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  }, [prompt, parameterValues]);

  const handleGenerate = useCallback(async () => {
    if (!prompt || !validateParameters()) return;

    try {
      const result = await generatePrompt({
        name: name as
          | 'developer-code-assistant'
          | 'test-portal-assistant'
          | 'issue-analysis-assistant'
          | 'environment-performance-assistant',
        generatePromptRequest: parameterValues,
      }).unwrap();

      setGeneratedPrompt(result.generated_prompt);
    } catch {
      // Error will be handled by the mutation error state
    }
  }, [prompt, parameterValues, generatePrompt, name, validateParameters]);

  const requiredFieldsEmpty = useMemo(() => {
    if (!prompt) return false;
    const hasRequiredFields = Object.entries(prompt.parameters).some(([, param]) => param.required);
    return hasRequiredFields && Object.entries(prompt.parameters).some(([paramName, param]) => param.required && !parameterValues[paramName]);
  }, [prompt, parameterValues]);

  // Auto-generate when parameters change (after a short delay)
  useEffect(() => {
    if (!prompt) return;

    if (!requiredFieldsEmpty && Object.keys(parameterValues).length > 0) {
      const timeoutId = setTimeout(() => {
        handleGenerate();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [parameterValues, prompt, requiredFieldsEmpty, handleGenerate]);

  return {
    prompt,
    isFetching,
    error,
    parameterValues,
    validationErrors,
    generatedPrompt,
    isGenerating,
    generateError,
    requiredFieldsEmpty,
    handleParameterChange,
    handleGenerate,
  };
};
