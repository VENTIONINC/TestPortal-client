// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { expect, it } from 'vitest';

import { normalizeEnvironment } from '@/components/manual-test-runs/components/ManualRunDetailsDialog';

it('trims environment properties and retains only the first value for duplicate names', () => {
  expect(normalizeEnvironment([
    { name: ' Browser ', value: ' Chrome ' },
    { name: 'browser', value: 'Firefox' },
    { name: 'Build', value: '' },
    { name: ' OS ', value: ' macOS ' },
  ])).toEqual([{ name: 'Browser', value: 'Chrome' }, { name: 'OS', value: 'macOS' }]);
});
