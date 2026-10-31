// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';

import { useProjectsActions } from '@/redux/slices/projects';
import { useSelectedProject } from '@/hooks/useSelectedProject';

import { TestScenarioCatalogContainer } from './TestScenarioCatalogContainer';

export const TestScenarioCatalog = ({ organizationTab }: { organizationTab?: 'scenarios' | 'suites' } = {}) => {
  const { selectedProjectId } = useSelectedProject();
  const [searchParams] = useSearchParams();
  const { setSelectedProjectId } = useProjectsActions();
  const requestedProject = searchParams.get('projectId');
  const restoredProject = useRef<string | null>(null);
  useEffect(() => {
    if (!requestedProject || restoredProject.current === requestedProject) return;
    restoredProject.current = requestedProject;
    if (requestedProject !== selectedProjectId) setSelectedProjectId(requestedProject);
  }, [requestedProject, selectedProjectId, setSelectedProjectId]);

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
