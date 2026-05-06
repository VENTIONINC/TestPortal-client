import { BulkReviewRequest, BulkReviewResponse, GetResultsRequest, GetResultsResponse } from '@/types/apis';

import {
  generatedApi,
  type PostApiV2ReportsPdfExportApiArg,
  type PostApiV2ReportsPdfExportApiResponse,
} from './generatedApi';
import { TAGS } from './tags';

export const extendedApi = generatedApi
  .enhanceEndpoints({
    endpoints: {
      postApiV2Assumptions: {
        invalidatesTags: [TAGS.Assumption, TAGS.Issues, TAGS.Result],
      },
      deleteApiV2ExecutionsByExecutionId: {
        invalidatesTags: [TAGS.Result],
      },
      patchApiV2AssumptionsByAssumptionId: {
        invalidatesTags: [TAGS.Assumption, TAGS.Issues, TAGS.Result],
      },
      postApiV2ResultErrorsAnalyze: {
        invalidatesTags: [TAGS.Result],
      },
    },
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getResults: build.query<GetResultsResponse, GetResultsRequest>({
        query: (params) => {
          const allowedParams = {
            from: params.from,
            to: params.to,
            page: 1,
            projectId: params.projectId,
          };

          const filteredParams = Object.fromEntries(
            Object.entries(allowedParams)
              .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
              .filter(([, value]) => value !== '' && value !== null && value !== undefined),
          );

          return {
            url: '/api/v2/results',
            params: filteredParams,
            method: 'GET',
          };
        },
        providesTags: [TAGS.Result],
      }),
      getAnalysisExport: build.query<string, { projectId: string; dateFrom: string; dateTo: string }>({
        query: (params) => ({
          url: '/api/v2/analysis-export',
          params,
          method: 'GET',
          responseHandler: 'text',
        }),
      }),
      exportDashboardPdf: build.mutation<PostApiV2ReportsPdfExportApiResponse, PostApiV2ReportsPdfExportApiArg>({
        query: ({ pdfExportRequest }) => ({
          url: '/api/v2/reports/pdf-export',
          method: 'POST',
          body: pdfExportRequest,
          responseHandler: (response) => response.blob(),
        }),
        invalidatesTags: ['Reports', 'Exports'],
      }),
      bulkReview: build.mutation<BulkReviewResponse, BulkReviewRequest>({
        query: ({ errorIds }) => ({
          url: '/api/v2/result-errors/bulk-review',
          method: 'PATCH',
          body: { errorIds },
        }),
        invalidatesTags: [TAGS.Result],
      }),
    }),
    overrideExisting: false,
  });

export const {
  usePostApiV2AssumptionsMutation: useCreateAssumptionMutation,
  usePatchApiV2AssumptionsByAssumptionIdMutation: useConfirmAssumptionMutation,
  useGetApiV2IssuesWithStatsQuery: useGetIssuesWithStatsQuery,

  // Custom hooks (from extendedApi)
  useGetResultsQuery,
  useLazyGetAnalysisExportQuery,
  useExportDashboardPdfMutation,
  useBulkReviewMutation,
} = extendedApi;
