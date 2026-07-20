// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { FetchBaseQueryMeta } from '@reduxjs/toolkit/query';

import { BulkReviewRequest, BulkReviewResponse, GetResultsRequest, GetResultsResponse } from '@/types/apis';
import { getDownloadFilename } from '@/utils/download';

import {
  generatedApi,
  type PostApiV2ReportsPdfExportApiArg,
  type PostApiV2ReportsPdfExportApiResponse,
} from './generatedApi';
import { TAGS } from './tags';

export interface SkillMarkdownDownloadResult {
  fileName: string;
  content: string;
}

export interface SkillArchiveDownloadResult {
  fileName: string;
  blob: Blob;
}

export const getSkillMarkdownDownloadPath = (id: string) => `/api/v2/skills/${encodeURIComponent(id)}/download`;

export const getSkillArchiveDownloadPath = (id: string) => `/api/v2/skills/${encodeURIComponent(id)}/archive`;

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
      postApiV2UploadCtrfReport: {
        invalidatesTags: ['Reports', TAGS.Result],
      },
      postApiV2UploadCtrfReportApiKey: {
        invalidatesTags: ['Reports', TAGS.Result, 'Upload'],
      },
    },
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getResults: build.query<GetResultsResponse, GetResultsRequest>({
        query: (params) => {
          const filteredParams = Object.fromEntries(
            Object.entries(params)
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
      downloadSkillMarkdown: build.query<SkillMarkdownDownloadResult, { id: string; name: string }>({
        query: ({ id }) => ({
          url: getSkillMarkdownDownloadPath(id),
          method: 'GET',
          responseHandler: 'text',
        }),
        transformResponse: (content: string, meta: FetchBaseQueryMeta | undefined, arg) => ({
          content,
          fileName: getDownloadFilename(meta?.response?.headers, `${arg.name}-SKILL.md`),
        }),
        providesTags: ['Skills'],
      }),
      downloadSkillArchive: build.query<SkillArchiveDownloadResult, { id: string; name: string }>({
        query: ({ id }) => ({
          url: getSkillArchiveDownloadPath(id),
          method: 'GET',
          responseHandler: (response) => response.blob(),
        }),
        transformResponse: (blob: Blob, meta: FetchBaseQueryMeta | undefined, arg) => ({
          blob,
          fileName: getDownloadFilename(meta?.response?.headers, `${arg.name}.zip`),
        }),
        providesTags: ['Skills'],
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
  useLazyDownloadSkillArchiveQuery,
  useLazyDownloadSkillMarkdownQuery,
  usePostApiV2UploadCtrfReportMutation,
} = extendedApi;
