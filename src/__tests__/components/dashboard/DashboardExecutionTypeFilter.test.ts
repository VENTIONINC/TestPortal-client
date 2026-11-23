// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { filterConfig } from '@/components/dashboard/configs/filter';

describe('Dashboard execution type filter', () => {
  it('uses an enabled type select with All as its static fallback', () => {
    const typeField = filterConfig[0]?.fields.find(({ name }) => name === 'type');

    expect(typeField).toMatchObject({
      label: 'Execution',
      type: 'select',
      options: [{ label: 'All', value: 'all' }],
    });
    expect(typeField?.disabled).not.toBe(true);
  });

  it('offers Today by default and Yesterday as calendar-day options', () => {
    const periodField = filterConfig[0]?.fields.find(({ name }) => name === 'period');

    expect(periodField).toMatchObject({ label: 'Period', type: 'select' });
    expect(periodField?.options?.slice(0, 3)).toEqual([
      { label: 'Today', value: '1' },
      { label: 'Yesterday', value: 'yesterday' },
      { label: '1 week', value: '7' },
    ]);
  });
});
