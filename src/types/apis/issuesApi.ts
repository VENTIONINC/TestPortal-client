// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Issue } from '@/types';

export interface GetIssuesResponse {
  issues: Issue[];
  page: number;
  total: number;
  totalPages: number;
}
