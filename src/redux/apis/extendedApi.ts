// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { FetchBaseQueryMeta } from '@reduxjs/toolkit/query';

import { BulkReviewRequest, BulkReviewResponse, GetResultsRequest, GetResultsResponse } from '@/types/apis';
import { getDownloadFilename } from '@/utils/download';

import {
  generatedApi,
  type PostApiV2SkillsApiResponse,
  type PostApiV2ReportsPdfExportApiArg,
  type PostApiV2ReportsPdfExportApiResponse,
  type PutApiV2SkillsByIdApiResponse,
} from './generatedApi';
import { TAGS } from './tags';

export interface SkillArchiveDownloadResult {
  fileName: string;
  blob: Blob;
}

export interface SkillPackageMutationInput {
  package: File;
  title: string;
  category: string;
}

export interface ReplaceSkillPackageMutationInput extends SkillPackageMutationInput {
  id: string;
}

const createSkillPackageFormData = ({
  package: skillPackage,
  title,
  category,
}: SkillPackageMutationInput) => {
  const formData = new FormData();

  formData.append('package', skillPackage, skillPackage.name);
  formData.append('title', title.trim());
  formData.append('category', category.trim());

  return formData;
};

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
      createCustomSkill: build.mutation<PostApiV2SkillsApiResponse, SkillPackageMutationInput>({
        query: (input) => ({
          url: '/api/v2/skills',
          method: 'POST',
          body: createSkillPackageFormData(input),
        }),
        invalidatesTags: ['Skills'],
      }),
      replaceCustomSkill: build.mutation<PutApiV2SkillsByIdApiResponse, ReplaceSkillPackageMutationInput>({
        query: ({ id, ...input }) => ({
          url: `/api/v2/skills/${encodeURIComponent(id)}`,
          method: 'PUT',
          body: createSkillPackageFormData(input),
        }),
        invalidatesTags: ['Skills'],
      }),
      downloadSkillArchive: build.query<SkillArchiveDownloadResult, { downloadUrl: string; name: string }>({
        query: ({ downloadUrl }) => ({
          url: downloadUrl,
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
  useCreateCustomSkillMutation,
  useReplaceCustomSkillMutation,
  useDeleteApiV2SkillsByIdMutation: useDeleteCustomSkillMutation,
  useLazyDownloadSkillArchiveQuery,
  usePostApiV2UploadCtrfReportMutation,
} = extendedApi;
