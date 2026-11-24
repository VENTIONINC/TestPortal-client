// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ManualTestRunEnvironmentProperty } from '@/redux/apis/generatedApi';

export const normalizeEnvironment = (items: ManualTestRunEnvironmentProperty[]) =>
  items
    .filter(
      (item, index) =>
        item.name.trim() &&
        item.value.trim() &&
        items.findIndex((row) => row.name.trim().toLowerCase() === item.name.trim().toLowerCase()) === index,
    )
    .map((item) => ({ name: item.name.trim(), value: item.value.trim() }));
