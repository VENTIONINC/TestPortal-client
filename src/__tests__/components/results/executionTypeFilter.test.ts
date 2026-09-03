// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { filterConfig } from '@/components/results/configs/filterConfig';
import { initialFilters } from '@/redux/slices/results';

describe('Results execution type filter', () => {
  it('starts at All and uses an enabled select control', () => {
    const executionSection = filterConfig.find(({ title }) => title === 'Execution');
    const typeField = executionSection?.fields.find(({ name }) => name === 'type');

    expect(initialFilters.type).toBe('all');
    expect(typeField).toMatchObject({ type: 'select' });
    expect(typeField?.disabled).not.toBe(true);
  });
});
