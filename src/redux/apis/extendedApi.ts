import { BulkReviewRequest, BulkReviewResponse, GetResultsRequest, GetResultsResponse } from '@/types/apis';

import { generatedApi } from './generatedApi';
import { TAGS } from './tags';

export const extendedApi = generatedApi.injectEndpoints({
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
      providesTags: [TAGS.Result],
    }),
    bulkReview: build.mutation<BulkReviewResponse, BulkReviewRequest>({
      query: ({ errorIds }) => ({
        url: '/result-errors/bulk-review',
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
