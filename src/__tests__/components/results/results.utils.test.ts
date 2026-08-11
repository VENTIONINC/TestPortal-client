// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { buildResultsGroups, mergeAvailableAndActiveTags } from '@/components/results/utils';
import { Result, ResultStatus, ResultsFilters } from '@/types';

const filters: ResultsFilters = {
  tags: [],
  specId: '',
  specFile: '',
  specName: '',
  environment: '',
  type: '',
  status: 'failed',
  reviewStatus: '',
  errorMessage: '',
  issueName: '',
  from: '2026-07-01',
  to: '2026-07-07',
  page: 1,
};

const makeResult = (id: string, specKey: string, date: string, status: ResultStatus): Result => ({
  id,
  createdAt: `${date}T10:00:00.000Z`,
  updatedAt: `${date}T10:00:00.000Z`,
  reportPortalLink: '',
  retry: 0,
  status,
  duration: 100,
  startTime: `${date}T10:00:00.000Z`,
  specId: `spec-${specKey}`,
  executionId: `execution-${id}`,
  errors: [],
  spec: {
    id: `spec-${specKey}`,
    createdAt: `${date}T10:00:00.000Z`,
    updatedAt: `${date}T10:00:00.000Z`,
    key: specKey,
    file: `${specKey}.ts`,
    title: specKey,
    tags: [],
    annotations: [],
  },
  execution: {
    id: `execution-${id}`,
    createdAt: `${date}T10:00:00.000Z`,
    updatedAt: `${date}T10:00:00.000Z`,
    type: 'e2e',
    name: id,
    environment: 'staging',
    provider: 'playwright',
    version: '1',
    startedAt: `${date}T10:00:00.000Z`,
  },
});

describe('buildResultsGroups', () => {
  it('keeps cards filtered while retaining raw dates for visible cards', () => {
    const filtered = [makeResult('filtered', 'visible-spec', '2026-07-02', ResultStatus.Failed)];
    const raw = [
      ...filtered,
      makeResult('raw-visible', 'visible-spec', '2026-07-01', ResultStatus.Passed),
      makeResult('raw-only', 'raw-only-spec', '2026-07-01', ResultStatus.Passed),
    ];

    const grouped = buildResultsGroups(filtered, raw, ['2026-07-02'], filters);

    expect([...grouped.results.keys()]).toEqual(['visible-spec']);
    expect(grouped.unfilteredResultsMap.get('visible-spec')?.executions).toHaveLength(2);
    expect(grouped.unfilteredResultsMap.has('raw-only-spec')).toBe(true);
    expect(grouped.activeDaysResultsIds).toEqual(['filtered']);
  });

  it('keeps results from every execution type when All is selected', () => {
    const nightly = makeResult('nightly', 'nightly-spec', '2026-07-02', ResultStatus.Failed);
    nightly.execution.type = 'Nightly';
    const release = makeResult('release', 'release-spec', '2026-07-02', ResultStatus.Failed);
    release.execution.type = 'Release';

    const grouped = buildResultsGroups(
      [nightly, release],
      [nightly, release],
      ['2026-07-02'],
      { ...filters, type: 'all' },
    );

    expect([...grouped.results.keys()]).toEqual(['nightly-spec', 'release-spec']);
    expect(grouped.activeDaysResultsIds).toEqual(['nightly', 'release']);
  });
});

describe('mergeAvailableAndActiveTags', () => {
  it('keeps active tags first and appends remaining available tags without duplicates', () => {
    expect(mergeAvailableAndActiveTags(['L1', 'L2', 'L3'], ['legacy', 'L2'])).toEqual([
      'legacy',
      'L2',
      'L1',
      'L3',
    ]);
  });
});
