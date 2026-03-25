import { Grid, Heading, Spinner, Text, VStack } from '@chakra-ui/react';

import { Wrap } from '@/components/ui';

import { usePromptGallery } from './hooks';
import { PromptCard } from './components';

export const PromptGallery = () => {
  const { data, isFetching, error } = usePromptGallery();

  return (
    <Wrap my={4} mx={6} p={4}>
      <VStack align="stretch" gap={4} w="100%">
        <VStack align="start" gap={2}>
          <Heading fontSize="lg">MCP Assistant Prompts</Heading>
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
