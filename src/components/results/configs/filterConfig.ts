// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { FilterConfigSection } from '@/types/filter';

import { getStatusOptions } from './helpers';
import { REVIEW_STATUS_OPTIONS } from './constants';

export const filterConfig: FilterConfigSection[] = [
  {
    title: 'Result',
    fields: [
      {
        label: 'Status:',
        name: 'status',
        type: 'select',
        options: getStatusOptions(),
      },

      {
        label: 'Review status:',
        name: 'reviewStatus',
        type: 'select',
        options: REVIEW_STATUS_OPTIONS,
      },
      {
        label: 'Error message',
        name: 'errorMessage',
        type: 'input',
      },
      {
        type: 'dateRange',
        label: 'Period:',
        fields: [
          {
            label: 'From',
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
  {
    title: 'Issue',
    fields: [
      {
        label: 'Issue name:',
        name: 'issueName',
        type: 'input',
      },
    ],
  },
  {
    title: 'Spec',
    fields: [
      {
        label: 'Tags:',
        name: 'tags',
        type: 'multiSelect',
      },
      {
        label: 'Spec ID:',
        name: 'specId',
        type: 'input',
      },
      {
        label: 'Spec file:',
        name: 'specFile',
        type: 'input',
      },
      {
        label: 'Spec name:',
        name: 'specName',
        type: 'input',
      },
    ],
  },
  {
    title: 'Execution',
    fields: [
      {
        label: 'Type:',
        name: 'type',
        disabled: true,
        type: 'input',
      },
    ],
  },
];
