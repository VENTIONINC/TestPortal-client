import { Button, Grid, Flex, Heading, Spacer, Spinner, Text, VStack } from '@chakra-ui/react';
import { useParams } from 'react-router';
import { LuRefreshCcw } from 'react-icons/lu';

import { Wrap } from '@/components/ui';

import { ParameterForm, PromptPreview } from './components';
import { usePromptBuilder } from './hooks';

export const PromptBuilder = () => {
  const { name } = useParams<{ name: string }>();

  const {
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
  } = usePromptBuilder(name as string);

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

  return (
    <VStack align="stretch" gap={6} px={4} py={6}>
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8} alignItems="start">
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
