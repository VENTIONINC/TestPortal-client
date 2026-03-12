import { Button, Grid, Flex, Heading, Spacer, Spinner, Text, VStack } from '@chakra-ui/react';
import { useParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import { LuRefreshCcw } from 'react-icons/lu';

import { useGetApiV2PromptsByNameQuery, usePostApiV2PromptsByNameGenerateMutation } from '@/redux/apis/generatedApi';
import { Wrap } from '@/components/ui';

import { ParameterForm } from './ParameterForm';
import { PromptPreview } from './PromptPreview';
// import { getCategoryIcon, getCategoryColor } from './promptUtils';

export const PromptBuilder = () => {
  const { name } = useParams<{ name: string }>();
  // const navigate = useNavigate();
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

  const handleParameterChange = (name: string, value: string) => {
    setParameterValues((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateParameters = useCallback(() => {
    if (!prompt) return false;

    const errors: Record<string, string> = {};
    let isValid = true;

    Object.entries(prompt.parameters).forEach(([name, parameter]) => {
      if (parameter.required && !parameterValues[name]?.toString().trim()) {
        errors[name] = `${name.replace(/_/g, ' ')} is required`;
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

  // Auto-generate when parameters change (after a short delay)
  useEffect(() => {
    if (!prompt) return;

    const hasRequiredFields = Object.entries(prompt.parameters).some(([, param]) => param.required);
    const requiredFieldsEmpty =
      hasRequiredFields &&
      Object.entries(prompt.parameters).some(([name, param]) => param.required && !parameterValues[name]);

    if (!requiredFieldsEmpty && Object.keys(parameterValues).length > 0) {
      const timeoutId = setTimeout(() => {
        handleGenerate();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [parameterValues, prompt, handleGenerate]);

  if (isFetching) {
    return (
      <VStack justify="center" align="center" minHeight="400px">
        <Spinner size="lg" />
        <Text color="text.muted">Loading prompt configuration...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack justify="center" align="center" minHeight="400px" gap={4}>
        <Text color="status.error.text" fontSize="lg">
          Failed to load prompt configuration
        </Text>
      </VStack>
    );
  }

  if (!prompt) {
    return (
      <VStack justify="center" align="center" minHeight="400px" gap={4}>
        <Text fontSize="lg" color="text.main">
          Prompt not found
        </Text>
      </VStack>
    );
  }

  const hasRequiredFields = Object.entries(prompt.parameters).some(([, param]) => param.required);
  const requiredFieldsEmpty =
    hasRequiredFields &&
    Object.entries(prompt.parameters).some(([name, param]) => param.required && !parameterValues[name]);

  return (
    <VStack align="stretch" gap={6} px={4} py={6}>
      {/* Main Content */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8} alignItems="start">
        {/* Parameter Form */}
        <Wrap>
          <VStack align="stretch" gap={4} w="100%">
            <Heading size="md" color="text.main">
              <Flex>
                Configure Parameters
                <Spacer />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || requiredFieldsEmpty}
                  loading={isGenerating}
                  variant="primary"
                  size="sm"
                  alignSelf="center"
                  w="fit-content"
                >
                  <LuRefreshCcw />
                  {isGenerating ? 'Generating...' : 'Generate Prompt'}
                </Button>
              </Flex>
            </Heading>
            <ParameterForm
              prompt={prompt}
              values={parameterValues}
              onChange={handleParameterChange}
              requiredFieldsEmpty={requiredFieldsEmpty}
              errors={validationErrors}
            />
          </VStack>
        </Wrap>
        {/* Prompt Preview */}
        <Wrap>
          <VStack align="stretch" gap={4} w="100%">
            <PromptPreview
              prompt={generatedPrompt}
              isGenerating={isGenerating}
              error={generateError ? 'Failed to generate prompt. Please try again.' : undefined}
            />
          </VStack>
        </Wrap>
      </Grid>
    </VStack>
  );
};
