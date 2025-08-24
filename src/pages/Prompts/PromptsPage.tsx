import { VStack } from '@chakra-ui/react';

import { AppHeader } from '@/components/AppHeader';
import { PromptGallery } from '@/components/prompts';

export function PromptsPage() {
  return (
    <VStack gap={4} align="stretch" mb={4} overflowX="auto" w="100%">
      <AppHeader />
      <PromptGallery />
    </VStack>
  );
}