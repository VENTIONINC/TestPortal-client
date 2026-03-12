import { FilterConfigSection } from '@/types/filter';

import { getStatusOptions } from './helpers';
import { REVIEW_STATUS_OPTIONS } from './constants';

export const filterConfig: FilterConfigSection[] = [
  {
    title: 'Result Filters',
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
    title: 'Issue Filters',
    fields: [
      {
        label: 'Issue name:',
        name: 'issueName',
        type: 'input',
      },
    ],
  },
  {
    title: 'Spec Filters',
    fields: [
      {
        label: 'Tag:',
        name: 'tag',
        type: 'input',
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
    title: 'Execution Filters',
    fields: [
      {
        label: 'Environment:',
        name: 'environment',
        type: 'input',
      },
      {
        label: 'Type:',
        name: 'type',
        type: 'input',
      },
    ],
  },
];
