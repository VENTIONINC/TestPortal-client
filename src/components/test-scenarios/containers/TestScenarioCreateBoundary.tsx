// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useSelectedProject } from '@/hooks/useSelectedProject';

import { TestScenarioCreateContainer } from './TestScenarioCreateContainer';

export const TestScenarioCreateBoundary = () => {
  const { selectedProjectId } = useSelectedProject();

  if (!selectedProjectId) return null;

  return <TestScenarioCreateContainer key={selectedProjectId} projectId={selectedProjectId} />;
};
