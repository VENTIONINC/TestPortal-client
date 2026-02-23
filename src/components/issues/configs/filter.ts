import { IssueCategory } from '@/types';
import { ISSUE_CATEGORY_LABELS } from '@/utils';
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
        type: 'input',
      },
      {
        label: 'Type:',
        name: 'type',
        type: 'input',
      },
    ],
  },
  {
    title: 'Issue filters',
    fields: [
      {
        label: 'Category:',
        name: 'category',
        type: 'select',
        options: [
          { value: 'all', label: 'All' },
          ...Object.values(IssueCategory).map((category) => ({
            value: category,
            label: ISSUE_CATEGORY_LABELS[category],
          })),
        ],
      },
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
