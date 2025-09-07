import { Result, ResultErrorAssumption } from '@/types';

export interface GetResultsRequest {
  from?: string;
  to?: string;
  status?: string;
  page?: number;
}

export interface GetResultsResponse {
  page: number;
  results: Result[];
  total: number;
  totalPages: number;
}

export interface BulkReviewRequest {
  errorIds: number[];
}

export interface BulkReviewResponse {
  successful: Array<{
    id: number;
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
    resultId: number;
    result: {
      id: number;
      createdAt: string;
      updatedAt: string;
      reportPortalLink: string;
      retry: number;
      status: string;
      duration: number;
      startTime: string;
      specId: number;
      executionId: number;
    };
    assumptions: ResultErrorAssumption[];
  }>;
  failed: Array<unknown>;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}
