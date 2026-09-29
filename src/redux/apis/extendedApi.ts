// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { FetchBaseQueryMeta } from '@reduxjs/toolkit/query';

import { BulkReviewRequest, BulkReviewResponse, GetResultsRequest, GetResultsResponse } from '@/types/apis';
import { getDownloadFilename } from '@/utils/download';

import {
  generatedApi,
  type GetApiV2ManualTestRunsByRunIdApiArg,
  type GetApiV2ManualTestRunsByRunIdApiResponse,
  type GetApiV2ManualTestRunsApiArg,
  type GetApiV2TestScenariosByScenarioIdManualRunsApiArg,
  type ManualTestRunRead,
  type PatchApiV2ManualTestRunsByRunIdApiArg,
  type PatchApiV2ManualTestRunsByRunIdApiResponse,
  type PatchApiV2ManualTestRunsByRunIdStepsAndStepIdApiArg,
  type PatchApiV2ManualTestRunsByRunIdStepsAndStepIdApiResponse,
  type PostApiV2ManualTestRunsByRunIdCompleteApiArg,
  type PostApiV2ManualTestRunsByRunIdCompleteApiResponse,
  type PostApiV2TestScenariosByScenarioIdManualRunsApiArg,
  type PostApiV2SkillsApiResponse,
  type PostApiV2ReportsPdfExportApiArg,
  type PostApiV2ReportsPdfExportApiResponse,
  type PutApiV2SkillsByIdApiResponse,
} from './generatedApi';
import { TAGS } from './tags';

export const manualTestRunTag = (id: string) => ({ type: TAGS.ManualTestRun, id } as const);

export const manualTestRunDetailTag = (projectId: string, runId: string) =>
  manualTestRunTag(`detail:${projectId}:${runId}`);

export const manualTestRunProjectHistoryTag = (projectId: string) =>
  manualTestRunTag(`project-history:${projectId}`);

export const manualTestRunScenarioHistoryTag = (projectId: string, scenarioId: string) =>
  manualTestRunTag(`scenario-history:${projectId}:${scenarioId}`);

const getRunScopeTags = (run: Pick<ManualTestRunRead, 'projectId' | 'id' | 'sourceTestScenarioId'>) => [
  manualTestRunDetailTag(run.projectId, run.id),
  manualTestRunProjectHistoryTag(run.projectId),
  manualTestRunScenarioHistoryTag(run.projectId, run.sourceTestScenarioId),
];

const getRunArgTags = (projectId: string, runId: string) => [manualTestRunDetailTag(projectId, runId)];

const getMutationErrorTags = (projectId: string, runId: string) => [
  ...getRunArgTags(projectId, runId),
  manualTestRunProjectHistoryTag(projectId),
];

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
        invalidatesTags: [TAGS.Assumption, TAGS.Issues, TAGS.Result, TAGS.ResultError],
      },
      postApiV2Issues: {
        invalidatesTags: [TAGS.Issues, TAGS.Result, TAGS.ResultError],
      },
      patchApiV2IssuesByIssueId: {
        invalidatesTags: [TAGS.Issues, TAGS.Result, TAGS.ResultError],
      },
      postApiV2ResultErrorsByResultErrorIdIssue: {
        extraOptions: { maxRetries: 0 },
        invalidatesTags: [TAGS.Assumption, TAGS.Issues, TAGS.Result, TAGS.ResultError, TAGS.Project],
      },
      patchApiV2ResultErrorsByResultErrorIdIssue: {
        invalidatesTags: [TAGS.Assumption, TAGS.Issues, TAGS.Result, TAGS.ResultError, TAGS.Project],
      },
      deleteApiV2ExecutionsByExecutionId: {
        invalidatesTags: [TAGS.Result],
      },
      patchApiV2AssumptionsByAssumptionId: {
        invalidatesTags: [TAGS.Assumption, TAGS.Issues, TAGS.Result, TAGS.ResultError],
      },
      deleteApiV2AssumptionsByAssumptionId: {
        invalidatesTags: [TAGS.Assumption, TAGS.Issues, TAGS.Result, TAGS.ResultError],
      },
      patchApiV2ResultErrorsByResultErrorIdAssignIssue: {
        invalidatesTags: [TAGS.Assumption, TAGS.Issues, TAGS.Result, TAGS.ResultError],
      },
      getApiV2ResultErrorsByResultErrorIdModalContext: {
        providesTags: [TAGS.ResultError, TAGS.Result, TAGS.Issues],
      },
      patchApiV2ResultErrorsByResultErrorIdReview: {
        invalidatesTags: [TAGS.Assumption, TAGS.Issues, TAGS.Result, TAGS.ResultError],
      },
      postApiV2ResultErrorsAnalyze: {
        invalidatesTags: [TAGS.Result],
      },
      patchApiV2ResultsByResultIdAnalysis: {
        invalidatesTags: [TAGS.Result],
      },
      patchApiV2ResultsByResultIdAnalysisFeedback: {
        invalidatesTags: [TAGS.Result, TAGS.Issues, TAGS.Project],
      },
      postApiV2UploadCtrfReport: {
        invalidatesTags: ['Reports', TAGS.Result],
      },
      postApiV2UploadCtrfReportApiKey: {
        invalidatesTags: ['Reports', TAGS.Result, 'Upload'],
      },
      postApiV2TestScenariosByScenarioIdManualRuns: {
        extraOptions: { maxRetries: 0 },
        invalidatesTags: (_result, _error, arg: PostApiV2TestScenariosByScenarioIdManualRunsApiArg) => [
          manualTestRunProjectHistoryTag(arg.projectId),
          manualTestRunScenarioHistoryTag(arg.projectId, arg.scenarioId),
        ],
      },
      getApiV2TestScenariosByScenarioIdManualRuns: {
        providesTags: (_result, _error, arg: GetApiV2TestScenariosByScenarioIdManualRunsApiArg) => [
          manualTestRunScenarioHistoryTag(arg.projectId, arg.scenarioId),
        ],
      },
      getApiV2ManualTestRuns: {
        providesTags: (_result, _error, arg: GetApiV2ManualTestRunsApiArg) => [
          manualTestRunProjectHistoryTag(arg.projectId),
        ],
      },
      getApiV2ManualTestRunsByRunId: {
        providesTags: (result: GetApiV2ManualTestRunsByRunIdApiResponse | undefined, _error, arg: GetApiV2ManualTestRunsByRunIdApiArg) =>
          result ? getRunScopeTags(result) : getRunArgTags(arg.projectId, arg.runId),
      },
      patchApiV2ManualTestRunsByRunId: {
        extraOptions: { maxRetries: 0 },
        invalidatesTags: (
          result: PatchApiV2ManualTestRunsByRunIdApiResponse | undefined,
          _error,
          arg: PatchApiV2ManualTestRunsByRunIdApiArg,
        ) => (result ? getRunScopeTags(result) : getMutationErrorTags(arg.projectId, arg.runId)),
      },
      patchApiV2ManualTestRunsByRunIdStepsAndStepId: {
        extraOptions: { maxRetries: 0 },
        invalidatesTags: (
          result: PatchApiV2ManualTestRunsByRunIdStepsAndStepIdApiResponse | undefined,
          _error,
          arg: PatchApiV2ManualTestRunsByRunIdStepsAndStepIdApiArg,
        ) => (result ? getRunScopeTags(result) : getMutationErrorTags(arg.projectId, arg.runId)),
      },
      postApiV2ManualTestRunsByRunIdComplete: {
        extraOptions: { maxRetries: 0 },
        invalidatesTags: (
          result: PostApiV2ManualTestRunsByRunIdCompleteApiResponse | undefined,
          _error,
          arg: PostApiV2ManualTestRunsByRunIdCompleteApiArg,
        ) => (result ? getRunScopeTags(result) : getMutationErrorTags(arg.projectId, arg.runId)),
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
  useGetApiV2ResultErrorsByResultErrorIdModalContextQuery: useResultErrorModalContextQuery,
  usePostApiV2ResultErrorsByResultErrorIdIssueMutation,
  usePatchApiV2ResultErrorsByResultErrorIdIssueMutation,
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
  usePostApiV2TestScenariosByScenarioIdManualRunsMutation,
  useGetApiV2TestScenariosByScenarioIdManualRunsQuery,
  useLazyGetApiV2TestScenariosByScenarioIdManualRunsQuery,
  useGetApiV2ManualTestRunsQuery,
  useLazyGetApiV2ManualTestRunsQuery,
  useGetApiV2ManualTestRunsByRunIdQuery,
  useLazyGetApiV2ManualTestRunsByRunIdQuery,
  usePatchApiV2ManualTestRunsByRunIdMutation,
  usePatchApiV2ManualTestRunsByRunIdStepsAndStepIdMutation,
  usePostApiV2ManualTestRunsByRunIdCompleteMutation,
} = extendedApi;
