import { Grid, Heading, Spinner, Text, VStack } from '@chakra-ui/react';

import { useGetApiV2PromptsQuery } from '@/redux/apis/generatedApi';

import { PromptCard } from './PromptCard';

export const PromptGallery = () => {
  const { data, isFetching, error } = useGetApiV2PromptsQuery();

  return (
    <VStack align="stretch" gap={6} px={4} py={6}>
      <VStack align="start" gap={2}>
        <Heading textStyle="3xl">MCP Assistant Prompts</Heading>
        <Text color="gray.500">
          Select an assistant prompt to configure parameters and generate prompts for your agentic IDE
        </Text>
      </VStack>

      {isFetching && (
        <VStack py={8}>
          <Spinner size="lg" />
          <Text>Loading prompts...</Text>
        </VStack>
      )}

      {error && (
        <VStack py={8}>
          <Text color="red.500">Failed to load prompts. Please try again.</Text>
        </VStack>
      )}

      {data?.prompts && (
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
            xl: 'repeat(4, 1fr)',
          }}
          gap={6}
        >
          {data.prompts.map((prompt) => (
            <PromptCard key={prompt.name} prompt={prompt} />
          ))}
        </Grid>
      )}

      {data?.prompts?.length === 0 && (
        <VStack py={8}>
          <Text>No prompts available.</Text>
        </VStack>
      )}
    </VStack>
  );
};