// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { SkillsCatalog } from '@/components/skills';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';

export function SkillsPage() {
  return (
    <MainTemplate pageHeader="Skills">
      <SkillsCatalog />
    </MainTemplate>
  );
}
