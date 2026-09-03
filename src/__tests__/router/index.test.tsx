// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { isValidElement, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { ProjectGuard, ProtectedRoute } from '@/components';
import { TestScenariosPage } from '@/pages';
import { router } from '@/router';
import { PATHS } from '@/types/paths';

describe('Test Scenarios route', () => {
  it('registers the catalog page behind authentication and project guards', () => {
    const route = router.routes.find((candidate) => candidate.path === PATHS.TEST_SCENARIOS) as
      | { element?: ReactElement; path?: string }
      | undefined;

    expect(route).toBeDefined();
    expect(isValidElement(route?.element)).toBe(true);

    const protectedElement = route?.element as ReactElement<{ children: ReactElement }>;
    expect(protectedElement.type).toBe(ProtectedRoute);
    expect(isValidElement(protectedElement.props.children)).toBe(true);

    const projectGuardElement = protectedElement.props.children as ReactElement<{ children: ReactElement }>;
    expect(projectGuardElement.type).toBe(ProjectGuard);
    expect(projectGuardElement.props.children.type).toBe(TestScenariosPage);
  });
});
