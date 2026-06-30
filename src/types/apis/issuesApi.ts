// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Issue } from '@/types';

export interface GetIssuesResponse {
  issues: Issue[];
  page: number;
  total: number;
  totalPages: number;
}
