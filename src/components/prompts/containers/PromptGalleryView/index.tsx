// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo } from 'react';
import { Grid, Heading, Text, VStack } from '@chakra-ui/react';

import { Wrap, Skeleton } from '@/components/ui';

import { usePromptGallery } from '../../hooks';
import { PromptCard } from '../../components';

export const PromptGalleryView = memo(() => {
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

        {isFetching && !data?.prompts && (
          <Grid templateColumns="repeat(auto-fit, minmax(376px, 1fr))" gap={6} justifyContent="center" py={4}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} minH="176px" borderRadius="xl" loading={true} />
            ))}
          </Grid>
        )}

        {error && (
          <VStack py={8}>
            <Text color="status.error.text">Failed to load prompts. Please try again.</Text>
          </VStack>
        )}

        {data?.prompts && (
          <Grid templateColumns="repeat(auto-fit, minmax(376px, 1fr))" gap={6} justifyContent="center">
            {data.prompts.map((prompt) => (
              <Skeleton key={prompt.name} loading={isFetching} minH="176px" borderRadius="xl">
                <PromptCard prompt={prompt} />
              </Skeleton>
            ))}
          </Grid>
        )}

        {data?.prompts?.length === 0 && !isFetching && (
          <VStack py={8}>
            <Text color="text.muted">No prompts available.</Text>
          </VStack>
        )}
      </VStack>
    </Wrap>
  );
});
