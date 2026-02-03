import { VStack } from '@chakra-ui/react';
import { useParams } from 'react-router';

import { PromptBuilder } from '@/components/prompts';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
import { configHeaderPageTitles } from '@/configs/pageTitleConfig';

export function PromptBuilderPage() {
  const { name } = useParams<{ name: string }>();
  const pageHeader = configHeaderPageTitles[name as keyof typeof configHeaderPageTitles] || 'Prompts';

  return (
    <VStack gap={4} align="stretch" mb={4} overflowX="auto" w="100%">
      <MainTemplate pageHeader={pageHeader} isIncludeBreadcrumb={true}>
        <PromptBuilder />
      </MainTemplate>
    </VStack>
  );
}
