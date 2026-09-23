import { describe, expect, it } from 'vitest';

import { filterConfig } from '@/components/results/configs/filterConfig';

describe('Results Issue filters', () => {
  it('places the assumption select before issue name with the supported options', () => {
    const issueSection = filterConfig.find((section) => section.title === 'Issue');

    expect(issueSection?.fields).toEqual([
      {
        label: 'Assumption:',
        name: 'assumption',
        type: 'select',
        options: [
          { value: 'any', label: 'Any' },
          { value: 'all', label: 'All' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'not-confirmed', label: 'Not confirmed' },
        ],
      },
      {
        label: 'Issue name:',
        name: 'issueName',
        type: 'input',
      },
    ]);
  });
});
