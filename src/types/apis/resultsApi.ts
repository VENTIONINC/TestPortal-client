// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Result, ResultErrorAssumption } from '@/types';

export interface GetResultsRequest {
  from?: string;
  to?: string;
  status?: string;
  page?: number;
  projectId: string;
  tag?: string;
  specId?: string;
  specFile?: string;
  specName?: string;
  environment?: string;
  type?: string;
  reviewStatus?: string;
  errorMessage?: string;
  issueName?: string;
}

export interface GetResultsResponse {
  page: number;
  results: Result[];
  total: number;
  totalPages: number;
}

export interface BulkReviewRequest {
  errorIds: string[];
}

export interface BulkReviewResponse {
  successful: Array<{
    id: string;
    createdAt: string;
    updatedAt: string;
    type: string;
    message: string;
    callLog: string;
    callStack: string;
    testAssertion: string;
    expectedPattern: string;
    receivedString: string;
    location: string;
    resultId: string;
    result: {
      id: string;
      createdAt: string;
      updatedAt: string;
      reportPortalLink: string;
      retry: number;
      status: string;
      duration: number;
      startTime: string;
      specId: string;
      executionId: string;
    };
    assumptions: ResultErrorAssumption[];
  }>;
  failed: Array<unknown>;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}
