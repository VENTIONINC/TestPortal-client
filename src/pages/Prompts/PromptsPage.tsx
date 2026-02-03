import { VStack } from '@chakra-ui/react';

import { PromptGallery } from '@/components/prompts';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';

export function PromptsPage() {
  return (
    <VStack gap={4} align="stretch" mb={4} overflowX="auto" w="100%">
      <MainTemplate pageHeader="Prompts">
        <PromptGallery />
      </MainTemplate>
    </VStack>
  );
}
