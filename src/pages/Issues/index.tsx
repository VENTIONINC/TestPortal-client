// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { IssuesList } from '@/components/issues';
import { MainTemplate } from '@/components/ui/components/Templates/MainTemplate';
import { FilterProvider } from '@/contexts/FilterContext';

const IssuesPageContent = () => (
  <MainTemplate pageHeader="Issues">
    <IssuesList />
  </MainTemplate>
);

export const IssuesPage = () => (
  <FilterProvider storageKey="issues">
    <IssuesPageContent />
  </FilterProvider>
);
