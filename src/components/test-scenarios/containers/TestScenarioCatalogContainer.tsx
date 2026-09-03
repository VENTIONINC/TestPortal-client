// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { TestScenarioCatalogView } from '../components/TestScenarioCatalogView';
import { useTestScenarioCatalog } from '../hooks/useTestScenarioCatalog';

export interface TestScenarioCatalogContainerProps {
  projectId: string;
}

export const TestScenarioCatalogContainer = ({ projectId }: TestScenarioCatalogContainerProps) => {
  const catalog = useTestScenarioCatalog(projectId);

  return <TestScenarioCatalogView {...catalog} />;
};

