import { Issue, IssueFilters } from '@/types';
import { GetIssuesResponse } from '@/types/apis';

import { baseApi } from './baseApi';

export const issuesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getIssues: build.query<GetIssuesResponse, Partial<IssueFilters>>({
      query: (filters) => {
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

        return {
          url: `/api/v1/issues?${queryParams.toString()}`,
          method: 'GET',
        };
      },
    }),
    createIssue: build.mutation<Issue, Issue>({
      query: (body) => ({
        url: '/api/v1/issues',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: true,
});

export const { useGetIssuesQuery, useLazyGetIssuesQuery, useCreateIssueMutation } = issuesApi;
