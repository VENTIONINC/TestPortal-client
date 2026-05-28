// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { FilterConfigSection } from '@/types/filter';

export const filterConfig: FilterConfigSection[] = [
  {
    fields: [
      {
        label: 'Execution',
        name: 'execution',
        type: 'select',
        disabled: true,
        options: [
          {
            label: 'Nightly',
            value: 'nightly',
          },
          {
            label: 'Last 7 days',
            value: 'last_7_days',
          },
          {
            label: 'Last 30 days',
            value: 'last_30_days',
          },
        ],
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
