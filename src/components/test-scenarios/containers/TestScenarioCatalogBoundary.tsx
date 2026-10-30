// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useSelectedProject } from '@/hooks/useSelectedProject';

import { TestScenarioCatalogContainer } from './TestScenarioCatalogContainer';

export const TestScenarioCatalog = ({ organizationTab }: { organizationTab?: 'scenarios' | 'suites' } = {}) => {
  const { selectedProjectId } = useSelectedProject();

  if (!selectedProjectId) {
    return null;
  }

  return (
    <TestScenarioCatalogContainer
      key={selectedProjectId}
      projectId={selectedProjectId}
      organizationTab={organizationTab}
    />
  );
};

export const TestScenarioCatalogBoundary = TestScenarioCatalog;
