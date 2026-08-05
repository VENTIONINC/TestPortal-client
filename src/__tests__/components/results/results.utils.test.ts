// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { buildResultsGroups, toBaseResult } from '@/components/results/utils';
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
});

describe('toBaseResult', () => {
  it('normalizes a case-insensitive feedback category', () => {
    const result = makeResult('feedback', 'spec', '2026-07-02', ResultStatus.Failed);
    Object.assign(result, { analysisCategory: 'bug', analysisFeedbackCategory: ' Environment ' });

    expect(toBaseResult(result).analysisCategory).toBe('infra');
  });

  it('does not fall back to the AI category for malformed feedback', () => {
    const result = makeResult('malformed', 'spec', '2026-07-02', ResultStatus.Failed);
    Object.assign(result, { analysisCategory: 'bug', analysisFeedbackCategory: '' });

    expect(toBaseResult(result).analysisCategory).toBeUndefined();
  });
});
