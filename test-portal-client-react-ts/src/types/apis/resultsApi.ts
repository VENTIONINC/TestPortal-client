import { Result } from "@/types";

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
