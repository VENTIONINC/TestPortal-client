import { useParams } from 'react-router';

import { PromptBuilder } from '@/components/prompts';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
import { configHeaderPageTitles } from '@/configs/pageTitleConfig';

export function PromptBuilderPage() {
  const { name } = useParams<{ name: string }>();
  const pageHeader = configHeaderPageTitles[name as keyof typeof configHeaderPageTitles] || 'Prompts';

  return (
    <MainTemplate pageHeader={pageHeader} isIncludeBreadcrumb={true}>
      <PromptBuilder />
    </MainTemplate>
  );
}
