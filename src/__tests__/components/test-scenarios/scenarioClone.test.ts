// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';

import { scenarioCloneDraft } from '@/components/test-scenarios/scenarioClone';
import type { TestScenario } from '@/redux/apis/generatedApi';

describe('scenario clone', () => {
  it('copies editable content without server-owned identifiers and avoids repeated prefixes', () => {
    const source = { id: 'source', projectId: 'p', scenarioKey: 'P-1', revision: 5, title: 'Copy of Login', details: 'Details', preconditions: 'Ready', testData: 'Data', priority: 'high', relatedIssueUrl: 'https://example.com', folderId: 'f', suites: [{ id: 's', name: 'Suite' }], steps: [{ id: 'step-server', position: 0, action: 'Open', expectedResult: 'Done' }] } as TestScenario;
    const draft = scenarioCloneDraft(source);
    expect(draft.values).toEqual({ title: 'Copy of Login', details: 'Details', preconditions: 'Ready', testData: 'Data', priority: 'high', relatedIssueUrl: 'https://example.com' });
    expect(draft.steps).toEqual([{ key: 'clone-step-0', action: 'Open', expectedResult: 'Done' }]);
    expect(draft.folderId).toBe('f');
    expect(draft.suites).toEqual([{ id: 's', name: 'Suite' }]);
    expect(source.steps[0].id).toBe('step-server');
    expect(scenarioCloneDraft({ ...source, title: 'Login' }).values.title).toBe('Copy of Login');
  });
});
