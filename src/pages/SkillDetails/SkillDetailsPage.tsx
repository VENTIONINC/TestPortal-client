// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useParams } from 'react-router';

import { SkillDetail } from '@/components/skills';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
import { formatSlugLabel } from '@/utils';

export function SkillDetailsPage() {
  const { name } = useParams<{ name: string }>();
  const pageHeader = name ? formatSlugLabel(name) : 'Skills';

  return (
    <MainTemplate pageHeader={pageHeader} isIncludeBreadcrumb={true}>
      <SkillDetail />
    </MainTemplate>
  );
}
