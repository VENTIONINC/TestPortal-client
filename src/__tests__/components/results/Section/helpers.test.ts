// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { serializeExecution } from '@/components/results/components/Section/helpers';
import { ResultExecution } from '@/types';

const execution: ResultExecution = {
  id: 'execution-1',
  createdAt: '2026-08-10T12:00:00.000Z',
  updatedAt: '2026-08-10T12:00:00.000Z',
  environment: 'staging',
  type: 'nightly',
  name: 'STAGING_1.60.0',
  provider: 'Playwright',
  version: '1.60.0',
  startedAt: '2026-08-10T12:00:00.000Z',
};

const user = {
  reportPortalEnabled: false,
  monitoringPortalEnabled: false,
};

describe('serializeExecution', () => {
  it('appends a provider version when one is present', () => {
    expect(serializeExecution(execution, user as never).provider).toBe('Playwright 1.60.0');
  });

  it.each(['', '   ', undefined])('keeps only the provider when version is %j', (version) => {
    const executionWithoutVersion = { ...execution, version } as ResultExecution;

    expect(serializeExecution(executionWithoutVersion, user as never).provider).toBe('Playwright');
  });
});
