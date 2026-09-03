// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { FilterConfigSection } from '@/types/filter';

export const filterConfig: FilterConfigSection[] = [
  {
    fields: [
      {
        label: 'Execution',
        name: 'type',
        type: 'select',
        options: [{ label: 'All', value: 'all' }],
      },
      {
        label: 'Period',
        name: 'period',
        type: 'select',
        options: [
          {
            label: 'Last 24 hours',
            value: '1',
          },
          {
            label: '1 week',
            value: '7',
          },
          {
            label: '1 month',
            value: '30',
          },
          {
            label: '3 months',
            value: '90',
          },
          {
            label: '6 months',
            value: '180',
          },
        ],
      },
    ],
  },
];
