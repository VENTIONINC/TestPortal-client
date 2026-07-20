// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { SkillDetail } from '@/components/skills';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';

export function SkillDetailsPage() {
  return (
    <MainTemplate pageHeader="Skill details" isIncludeBreadcrumb={true}>
      <SkillDetail />
    </MainTemplate>
  );
}
