// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { FilterConfigSection } from '@/types/filter';

export const filterConfig = [
  {
    title: 'Spec filters',
    fields: [
      {
        label: 'Tags:',
        name: 'tag',
        type: 'input',
      },
      {
        label: 'Spec ID:',
        name: 'specId',
        type: 'input',
      },
      {
        label: 'Spec File:',
        name: 'specFile',
        type: 'input',
      },
      {
        label: 'Spec Name:',
        name: 'specName',
        type: 'input',
      },
    ],
  },
  {
    title: 'Execution filters',
    fields: [
      {
        label: 'Environment:',
        name: 'environment',
        disabled: true,
        type: 'input',
      },
      {
        label: 'Type:',
        name: 'type',
        type: 'select',
        options: [{ value: 'all', label: 'All' }],
      },
    ],
  },
  {
    title: 'Issue filters',
    fields: [
      {
        label: 'Name:',
        name: 'name',
        type: 'input',
      },
    ],
  },
  {
    title: 'Statistics filters',
    fields: [
      {
        label: 'Date range:',
        name: 'dateRange',
        type: 'dateRange',
        fields: [
          {
            label: 'From:',
            name: 'from',
            type: 'date',
          },
          {
            label: 'To:',
            name: 'to',
            type: 'date',
          },
        ],
      },
    ],
  },
] satisfies FilterConfigSection[];
