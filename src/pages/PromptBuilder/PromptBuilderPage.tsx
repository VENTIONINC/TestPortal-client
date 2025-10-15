import { VStack } from '@chakra-ui/react';

import { AppHeader } from '@/components/AppHeader';
import { PromptBuilder } from '@/components/prompts';

export function PromptBuilderPage() {
  return (
    <VStack gap={4} align="stretch" mb={4} overflowX="auto" w="100%">
      <AppHeader />
      <PromptBuilder />
    </VStack>
  );
}