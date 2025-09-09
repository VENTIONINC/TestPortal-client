import { Issue } from '@/types';

export interface GetIssuesResponse {
  issues: Issue[];
  page: number;
  total: number;
  totalPages: number;
}
