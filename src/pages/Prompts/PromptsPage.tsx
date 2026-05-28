// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { PromptGallery } from '@/components/prompts';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';

export function PromptsPage() {
  return (
    <MainTemplate pageHeader="Prompts">
      <PromptGallery />
    </MainTemplate>
  );
}
