import { GetResultsRequest, GetResultsResponse } from '@/types/apis';

import { baseApi } from './baseApi';

export const resultsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getResults: build.query<GetResultsResponse, GetResultsRequest>({
      query: ({ from, to, status, page }) => {
        const queryParams = new URLSearchParams();

        if (from) queryParams.append('from', from);
        if (to) queryParams.append('to', to);
        if (status) queryParams.append('status', status);
        if (page) queryParams.append('page', page.toString());

        return {
          url: `/results?${queryParams.toString()}`,
          method: 'GET',
        };
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetResultsQuery } = resultsApi;
