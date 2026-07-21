// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { skillPackageSchema } from '@/schemas';

describe('skillPackageSchema', () => {
  it('trims metadata and accepts exactly one ZIP file value', () => {
    const packageFile = new File(['package'], 'custom-skill.zip', { type: 'application/zip' });

    expect(
      skillPackageSchema.parse({ title: '  Custom skill  ', category: '  Engineering  ', package: packageFile }),
    ).toEqual({ title: 'Custom skill', category: 'Engineering', package: packageFile });
  });

  it.each([
    { title: '', category: 'Engineering', package: new File(['package'], 'custom-skill.zip') },
    { title: 'Custom skill', category: '   ', package: new File(['package'], 'custom-skill.zip') },
    { title: 'Custom skill', category: 'Engineering', package: undefined },
    { title: 'Custom skill', category: 'Engineering', package: new File(['package'], 'custom-skill.txt') },
  ])('rejects missing metadata or an invalid ZIP selection', (values) => {
    expect(skillPackageSchema.safeParse(values).success).toBe(false);
  });
});
