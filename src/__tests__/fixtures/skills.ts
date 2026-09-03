// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { SkillMetadata } from '@/redux/apis/generatedApi';

export const skillsFixture: SkillMetadata[] = [
  {
    id: 'skill-system-testing',
    name: 'testing-guide',
    title: 'Testing Guide',
    description: 'System testing guidance.',
    category: 'engineering',
    source: 'system',
    readOnly: true,
    downloadUrl: '/api/v2/skills/skill-system-testing/archive',
  },
  {
    id: 'skill-custom-renamed',
    name: 'testing-guide',
    title: 'Renamed Testing Guide',
    description: 'A custom skill with the same display name.',
    category: 'engineering',
    source: 'custom',
    readOnly: false,
    downloadUrl: '/api/v2/skills/skill-custom-renamed/archive',
  },
];
