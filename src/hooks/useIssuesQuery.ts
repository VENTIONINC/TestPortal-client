import { useQuery } from '@tanstack/react-query';

import { Issue, IssueFilters } from '@/types';

interface ApiIssuesResponse {
  issues: Issue[];
  page: number;
  total: number;
  totalPages: number;
}

export const useIssuesQuery = (filters: IssueFilters) => {
  return useQuery<ApiIssuesResponse, Error>({
    queryKey: ['issues', filters],
    queryFn: () => fetchIssues(filters),
  });
};

const fetchIssues = async (filters: IssueFilters): Promise<ApiIssuesResponse> => {
  const queryParams = new URLSearchParams();

  if (filters.tag) queryParams.append('tag', filters.tag);
  if (filters.specId) queryParams.append('specId', filters.specId.toString());
  if (filters.specFile) queryParams.append('specFile', filters.specFile);
  if (filters.specName) queryParams.append('specName', filters.specName);
  if (filters.environment) queryParams.append('environment', filters.environment);
  if (filters.type) queryParams.append('type', filters.type);
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.name) queryParams.append('name', filters.name);
  if (filters.fromDate) queryParams.append('from', filters.fromDate);
  if (filters.toDate) queryParams.append('to', filters.toDate);
  if (filters.page) queryParams.append('page', filters.page.toString());
  queryParams.append('limit', '10');

  const response = await fetch(`http://localhost:3001/api/issues?${queryParams.toString()}`);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (parseError) {
      console.error('Failed to parse error response json:', parseError);
      errorData = {
        message: 'Failed to parse error response json from server.',
      };
    }
    throw new Error(`Unable to load issues: ${response.status} ${JSON.stringify(errorData, null, 2)}`);
  }

  return await response.json();
};
