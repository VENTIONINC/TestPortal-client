import { Badge, Button, Grid, Heading, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import { LuArrowLeft } from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import { useGetApiV2PromptsByNameQuery, usePostApiV2PromptsByNameGenerateMutation } from '@/redux/apis/generatedApi';
import { useSurfaceColors } from '@/theme/useSurfaceColors';

import { ParameterForm } from './ParameterForm';
import { PromptPreview } from './PromptPreview';
import { getCategoryIcon, getCategoryColor } from './promptUtils';

export const PromptBuilder = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [parameterValues, setParameterValues] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const { text } = useSurfaceColors();

  const { data: prompt, isFetching, error } = useGetApiV2PromptsByNameQuery({ 
    name: name as 'developer-code-assistant' | 'test-portal-assistant' | 'issue-analysis-assistant' | 'environment-performance-assistant'
  });

  const [generatePrompt, { 
    isLoading: isGenerating, 
    error: generateError 
  }] = usePostApiV2PromptsByNameGenerateMutation();

  const handleParameterChange = (name: string, value: string) => {
    setParameterValues(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
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
        name: name as 'developer-code-assistant' | 'test-portal-assistant' | 'issue-analysis-assistant' | 'environment-performance-assistant',
        generatePromptRequest: parameterValues
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
    const requiredFieldsEmpty = hasRequiredFields && 
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
        <Text color={text.muted}>Loading prompt configuration...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack justify="center" align="center" minHeight="400px" gap={4}>
        <Text color="red.500" fontSize="lg">
          Failed to load prompt configuration
        </Text>
        <Button onClick={() => navigate('/prompts')}>
          <LuArrowLeft />
          Back to Prompts
        </Button>
      </VStack>
    );
  }

  if (!prompt) {
    return (
      <VStack justify="center" align="center" minHeight="400px" gap={4}>
        <Text fontSize="lg" color={text.primary}>Prompt not found</Text>
        <Button onClick={() => navigate('/prompts')}>
          <LuArrowLeft />
          Back to Prompts
        </Button>
      </VStack>
    );
  }

  const { icon: CategoryIcon, color: iconColor } = getCategoryIcon(prompt.category);
  const badgeColor = getCategoryColor(prompt.category);

  return (
    <VStack align="stretch" gap={6} px={4} py={6}>
      {/* Header */}
      <VStack align="start" gap={4}>
        <Button 
          onClick={() => navigate('/prompts')} 
          variant="ghost" 
          alignSelf="start"
        >
          <LuArrowLeft />
          Back to Prompts
        </Button>

        <HStack align="start" gap={4}>
          <CategoryIcon size={24} color={iconColor} />
          <VStack align="start" gap={2}>
            <HStack>
              <Heading size="lg" color={text.primary}>{prompt.title}</Heading>
              <Badge colorPalette={badgeColor} variant="subtle">
                {prompt.category}
              </Badge>
            </HStack>
            <Text color={text.muted} maxWidth="600px">
              {prompt.description}
            </Text>
          </VStack>
        </HStack>
      </VStack>

      {/* Main Content */}
      <Grid
        templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
        gap={8}
        alignItems="start"
      >
        {/* Parameter Form */}
        <VStack align="stretch" gap={4}>
          <Heading size="md" color={text.primary}>Configure Parameters</Heading>
          <ParameterForm
            prompt={prompt}
            values={parameterValues}
            onChange={handleParameterChange}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            errors={validationErrors}
          />
        </VStack>

        {/* Prompt Preview */}
        <VStack align="stretch" gap={4}>
          <PromptPreview
            prompt={generatedPrompt}
            isGenerating={isGenerating}
            error={generateError ? 'Failed to generate prompt. Please try again.' : undefined}
          />
        </VStack>
      </Grid>
    </VStack>
  );
};