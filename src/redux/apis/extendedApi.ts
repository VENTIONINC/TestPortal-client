import { BulkReviewRequest, BulkReviewResponse, GetResultsRequest, GetResultsResponse } from '@/types/apis';

import { generatedApi } from './generatedApi';
import { TAGS } from './tags';

export const extendedApi = generatedApi.injectEndpoints({
  endpoints: (build) => ({
    getResults: build.query<GetResultsResponse, GetResultsRequest>({
      query: (params) => {
        const filteredParams = Object.fromEntries(
          Object.entries(params)
            .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
            .filter(([, value]) => value !== '' && value !== null && value !== undefined),
        );

        return {
          url: '/api/v1/results',
          params: filteredParams,
          method: 'GET',
        };
      },
      providesTags: [TAGS.Result],
    }),
    bulkReview: build.mutation<BulkReviewResponse, BulkReviewRequest>({
      query: ({ errorIds }) => ({
        url: '/api/v1/result-errors/bulk-review',
        method: 'PATCH',
        body: { errorIds },
      }),
      invalidatesTags: [TAGS.Result],
    }),
  }),
  overrideExisting: false,
});

export const {
  usePostApiV1AssumptionsMutation: useCreateAssumptionMutation,
  usePatchApiV1AssumptionsByAssumptionIdMutation: useConfirmAssumptionMutation,
  useGetApiV1IssuesWithStatsQuery: useGetIssuesWithStatsQuery,

  // Custom hooks (from extendedApi)
  useGetResultsQuery,
  useBulkReviewMutation,
} = extendedApi;
