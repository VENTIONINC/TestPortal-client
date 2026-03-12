import { Grid, Heading, Spinner, Text, VStack } from '@chakra-ui/react';

import { useGetApiV2PromptsQuery } from '@/redux/apis/generatedApi';
import { Wrap } from '@/components/ui';

import { PromptCard } from './PromptCard';

export const PromptGallery = () => {
  const { data, isFetching, error } = useGetApiV2PromptsQuery();

  return (
    <Wrap>
      <VStack align="stretch" gap={6} w="100%">
        <VStack align="start" gap={2}>
          <Heading>MCP Assistant Prompts</Heading>
          <Text color="text.secondary">
            Select an assistant prompt to configure parameters and generate prompts for your agentic IDE
          </Text>
        </VStack>

        {isFetching && (
          <VStack py={8}>
            <Spinner size="lg" />
            <Text color="text.muted">Loading prompts...</Text>
          </VStack>
        )}

        {error && (
          <VStack py={8}>
            <Text color="status.error.text">Failed to load prompts. Please try again.</Text>
          </VStack>
        )}

        {data?.prompts && (
          <Grid templateColumns="repeat(auto-fit, minmax(376px, 1fr))" gap={6} justifyContent="center">
            {data.prompts.map((prompt) => (
              <PromptCard key={prompt.name} prompt={prompt} />
            ))}
          </Grid>
        )}

        {data?.prompts?.length === 0 && (
          <VStack py={8}>
            <Text color="text.muted">No prompts available.</Text>
          </VStack>
        )}
      </VStack>
    </Wrap>
  );
};
