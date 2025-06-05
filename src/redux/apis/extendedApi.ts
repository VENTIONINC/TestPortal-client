import { BulkReviewRequest, BulkReviewResponse, GetResultsRequest, GetResultsResponse } from '@/types/apis';

import { generatedApi } from './generatedApi';
import { TAGS } from './tags';

export const extendedApi = generatedApi.injectEndpoints({
  endpoints: (build) => ({
    getResults: build.query<GetResultsResponse, GetResultsRequest>({
      query: (params) => {
        const filteredParams = Object.fromEntries(
          Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
        );

        return {
          url: '/api/results',
          params: filteredParams,
          method: 'GET',
        };
      },
      providesTags: [TAGS.Result],
    }),
    bulkReview: build.mutation<BulkReviewResponse, BulkReviewRequest>({
      query: ({ errorIds }) => ({
        url: '/api/result-errors/bulk-review',
        method: 'PATCH',
        body: { errorIds },
      }),
      invalidatesTags: [TAGS.Result],
    }),
  }),
  overrideExisting: false,
});

export const {
  usePostApiAssumptionsMutation: useCreateAssumptionMutation,
  usePatchApiAssumptionsByAssumptionIdMutation: useConfirmAssumptionMutation,
  usePostApiIssuesMutation: useCreateIssueMutation,

  // Custom hooks (from extendedApi)
  useGetResultsQuery,
  useBulkReviewMutation,
} = extendedApi;
