import { IssueFilters } from '@/types';
import { GetIssuesResponse } from '@/types/apis';

import { baseApi } from './baseApi';

export const issuesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getIssues: build.query<GetIssuesResponse, Partial<IssueFilters>>({
      query: (filters) => {
        const queryParams = new URLSearchParams();

        if (filters.projectId) queryParams.append('projectId', filters.projectId);
        if (filters.tag) queryParams.append('tag', filters.tag);
        if (filters.specId) queryParams.append('specId', filters.specId);
        if (filters.specFile) queryParams.append('specFile', filters.specFile);
        if (filters.specName) queryParams.append('specName', filters.specName);
        if (filters.environment) queryParams.append('environment', filters.environment);
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.name) queryParams.append('name', filters.name);
        if (filters.statFrom) queryParams.append('from', filters.statFrom);
        if (filters.statTo) queryParams.append('to', filters.statTo);
        if (filters.page) queryParams.append('page', filters.page.toString());
        queryParams.append('limit', '10');

        return {
          url: `/api/v2/issues?${queryParams.toString()}`,
          method: 'GET',
        };
      },
    }),
  }),
  overrideExisting: true,
});

export const { useLazyGetIssuesQuery } = issuesApi;
