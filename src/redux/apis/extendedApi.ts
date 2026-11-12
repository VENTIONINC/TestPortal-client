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
  type GetApiV2TestScenariosByScenarioIdSpecLinksApiArg,
  type ManualTestRunRead,
  type PostApiV2ManualTestRunsApiArg,
  type PostApiV2ManualTestRunsApiResponse,
  type PostApiV2ManualTestRunsByRunIdCompleteApiArg,
  type PostApiV2ManualTestRunsByRunIdCompleteApiResponse,
  type PostApiV2ManualTestRunsByRunIdReopenApiArg,
  type PostApiV2ManualTestRunsByRunIdReopenApiResponse,
  type PostApiV2ManualTestRunsByRunIdScenariosBulkApiArg,
  type PostApiV2ManualTestRunsByRunIdScenariosBulkApiResponse,
  type PutApiV2ManualTestRunsByRunIdScenariosAndScenarioIdResultApiArg,
  type PutApiV2ManualTestRunsByRunIdScenariosAndScenarioIdResultApiResponse,
  type PutApiV2ManualTestRunsByRunIdScenariosOrderApiArg,
  type PutApiV2ManualTestRunsByRunIdScenariosOrderApiResponse,
  type PatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdAssigneeApiArg,
  type PatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdAssigneeApiResponse,
  type DeleteApiV2TestScenariosByScenarioIdApiArg,
  type DeleteApiV2TestScenariosByScenarioIdSpecLinksAndSpecIdApiArg,
  type PostApiV2TestScenariosByScenarioIdSpecLinksApiArg,
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

export const manualTestRunProjectDetailsTag = (projectId: string) =>
  manualTestRunTag(`project-details:${projectId}`);

export const manualRunEnvironmentProfilesTag = (projectId: string) => ({
  type: 'Manual Run Environment Profiles',
  id: projectId,
} as const);

export const resultSpecCoverageTag = (projectId: string) => ({ type: 'ResultSpecCoverage', id: projectId } as const);
export const scenarioCatalogTag = (projectId: string) => ({ type: 'ScenarioCatalog', id: projectId } as const);
export const scenarioSpecLinkTag = (projectId: string, scenarioId: string) => ({
  type: 'ScenarioSpecLink',
  id: `${projectId}:${scenarioId}`,
} as const);

const getRunScopeTags = (run: Pick<ManualTestRunRead, 'projectId' | 'id'>) => [
  manualTestRunDetailTag(run.projectId, run.id),
  manualTestRunProjectDetailsTag(run.projectId),
  manualTestRunProjectHistoryTag(run.projectId),
];

const getRunArgTags = (projectId: string, runId: string) => [manualTestRunDetailTag(projectId, runId)];

const getMutationErrorTags = (projectId: string, runId: string) => [
  ...getRunArgTags(projectId, runId),
  manualTestRunProjectHistoryTag(projectId),
  manualTestRunProjectDetailsTag(projectId),
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
    addTagTypes: ['Results', 'ResultSpecCoverage', 'ScenarioCatalog', 'ScenarioSpecLink', 'ScenarioFolders', 'ScenarioSuites', 'Manual Run Environment Profiles'],
    endpoints: {
      getApiV2TestScenarioFolders: {
        providesTags: (_result, _error, arg) => [{ type: 'ScenarioFolders', id: arg.projectId }],
      },
      getApiV2TestSuites: {
        providesTags: (_result, _error, arg) => [{ type: 'ScenarioSuites', id: arg.projectId }],
      },
      getApiV2TestScenarios: {
        providesTags: (_result, _error, arg) => [TAGS.TestScenario, scenarioCatalogTag(arg.projectId)],
      },
      getApiV2TestScenariosAuthors: {
        providesTags: (_result, _error, arg) => [TAGS.TestScenario, scenarioCatalogTag(arg.projectId)],
      },
      getApiV2TestScenariosPriorityCounts: {
        providesTags: (_result, _error, arg) => [TAGS.TestScenario, scenarioCatalogTag(arg.projectId)],
      },
      postApiV2TestScenarios: {
        invalidatesTags: (result, _error, arg) => result ? [TAGS.TestScenario, scenarioCatalogTag(arg.createTestScenarioRequest.projectId), { type: 'ScenarioFolders', id: arg.createTestScenarioRequest.projectId }, { type: 'ScenarioSuites', id: arg.createTestScenarioRequest.projectId }] : [],
      },
      patchApiV2TestScenariosByScenarioId: {
        invalidatesTags: (result, _error, arg) => result ? [TAGS.TestScenario, 'Results', scenarioCatalogTag(arg.projectId), { type: 'ScenarioFolders', id: arg.projectId }, { type: 'ScenarioSuites', id: arg.projectId }] : [],
      },
      postApiV2TestScenarioFolders: {
        invalidatesTags: (result, _error, arg) => result ? [{ type: 'ScenarioFolders', id: arg.body.projectId }] : [],
      },
      patchApiV2TestScenarioFoldersByFolderId: {
        invalidatesTags: (result, _error, arg) => result ? [{ type: 'ScenarioFolders', id: arg.projectId }, scenarioCatalogTag(arg.projectId)] : [],
      },
      deleteApiV2TestScenarioFoldersByFolderId: {
        invalidatesTags: (result, _error, arg) => result ? [{ type: 'ScenarioFolders', id: arg.projectId }, scenarioCatalogTag(arg.projectId)] : [],
      },
      postApiV2TestScenarioFoldersRestoration: {
        invalidatesTags: (result, _error, arg) => result ? [{ type: 'ScenarioFolders', id: arg.body.projectId }, scenarioCatalogTag(arg.body.projectId)] : [],
      },
      postApiV2TestScenariosFolderRestoration: {
        invalidatesTags: (result, _error, arg) => result ? [{ type: 'ScenarioFolders', id: arg.body.projectId }, scenarioCatalogTag(arg.body.projectId)] : [],
      },
      postApiV2TestSuites: {
        invalidatesTags: (result, _error, arg) => result ? [{ type: 'ScenarioSuites', id: arg.body.projectId }] : [],
      },
      patchApiV2TestSuitesBySuiteId: {
        invalidatesTags: (result, _error, arg) => result ? [{ type: 'ScenarioSuites', id: arg.projectId }] : [],
      },
      deleteApiV2TestSuitesBySuiteId: {
        invalidatesTags: (result, _error, arg) => result ? [{ type: 'ScenarioSuites', id: arg.projectId }, scenarioCatalogTag(arg.projectId)] : [],
      },
      postApiV2TestSuitesBySuiteIdMembers: {
        invalidatesTags: (result, _error, arg) => result ? [{ type: 'ScenarioSuites', id: arg.body.projectId }, scenarioCatalogTag(arg.body.projectId)] : [],
      },
      deleteApiV2TestSuitesBySuiteIdMembers: {
        invalidatesTags: (result, _error, arg) => result ? [{ type: 'ScenarioSuites', id: arg.body.projectId }, scenarioCatalogTag(arg.body.projectId)] : [],
      },
      postApiV2TestSuitesBySuiteIdMembershipChanges: {
        invalidatesTags: (result, _error, arg) => result ? [{ type: 'ScenarioSuites', id: arg.body.projectId }, scenarioCatalogTag(arg.body.projectId)] : [],
      },
      postApiV2TestSuitesBySuiteIdMembershipRestoration: {
        invalidatesTags: (result, _error, arg) => result ? [{ type: 'ScenarioSuites', id: arg.body.projectId }, scenarioCatalogTag(arg.body.projectId)] : [],
      },
      postApiV2TestSuitesMoves: {
        invalidatesTags: (result, _error, arg) => result ? [{ type: 'ScenarioSuites', id: arg.body.projectId }, scenarioCatalogTag(arg.body.projectId)] : [],
      },
      postApiV2TestSuitesMoveRestoration: {
        invalidatesTags: (result, _error, arg) => result ? [{ type: 'ScenarioSuites', id: arg.body.projectId }, scenarioCatalogTag(arg.body.projectId)] : [],
      },
      putApiV2TestSuitesBySuiteIdMembersOrder: {
        invalidatesTags: (result, _error, arg) => result ? [{ type: 'ScenarioSuites', id: arg.body.projectId }] : [],
      },
      patchApiV2TestScenariosBulkFolder: {
        invalidatesTags: (result, _error, arg) => result ? [{ type: 'ScenarioFolders', id: arg.body.projectId }, scenarioCatalogTag(arg.body.projectId), { type: 'ScenarioSuites', id: arg.body.projectId }] : [],
      },
      postApiV2TestScenariosByScenarioIdSpecLinks: {
        extraOptions: { maxRetries: 0 },
        invalidatesTags: (_result, _error, arg: PostApiV2TestScenariosByScenarioIdSpecLinksApiArg) => [
          resultSpecCoverageTag(arg.projectId),
          scenarioSpecLinkTag(arg.projectId, arg.scenarioId),
        ],
      },
      deleteApiV2TestScenariosByScenarioIdSpecLinksAndSpecId: {
        extraOptions: { maxRetries: 0 },
        invalidatesTags: (_result, _error, arg: DeleteApiV2TestScenariosByScenarioIdSpecLinksAndSpecIdApiArg) => [
          resultSpecCoverageTag(arg.projectId),
          scenarioSpecLinkTag(arg.projectId, arg.scenarioId),
        ],
      },
      getApiV2TestScenariosByScenarioIdSpecLinks: {
        providesTags: (_result, _error, arg: GetApiV2TestScenariosByScenarioIdSpecLinksApiArg) => [
          scenarioSpecLinkTag(arg.projectId, arg.scenarioId),
        ],
      },
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
      deleteApiV2TestScenariosByScenarioId: {
        invalidatesTags: (_result, _error, arg: DeleteApiV2TestScenariosByScenarioIdApiArg) => [
          TAGS.TestScenario,
          scenarioCatalogTag(arg.projectId),
          { type: 'ScenarioFolders', id: arg.projectId },
          { type: 'ScenarioSuites', id: arg.projectId },
        ],
      },
      postApiV2ManualTestRuns: {
        extraOptions: { maxRetries: 0 },
        invalidatesTags: (_result: PostApiV2ManualTestRunsApiResponse | undefined, _error, arg: PostApiV2ManualTestRunsApiArg) => [
          manualTestRunProjectHistoryTag(arg.projectId),
          manualTestRunProjectDetailsTag(arg.projectId),
        ],
      },
      getApiV2ManualTestRuns: {
        providesTags: (_result, _error, arg: GetApiV2ManualTestRunsApiArg) => [
          manualTestRunProjectHistoryTag(arg.projectId),
        ],
      },
      getApiV2ProjectsByProjectIdManualRunEnvironmentProfiles: {
        providesTags: (_result, _error, arg) => [manualRunEnvironmentProfilesTag(arg.projectId)],
      },
      postApiV2ProjectsByProjectIdManualRunEnvironmentProfiles: {
        invalidatesTags: (result, _error, arg) => result ? [manualRunEnvironmentProfilesTag(arg.projectId)] : [],
      },
      patchApiV2ProjectsByProjectIdManualRunEnvironmentProfilesAndProfileId: {
        invalidatesTags: (result, _error, arg) => result ? [manualRunEnvironmentProfilesTag(arg.projectId)] : [],
      },
      deleteApiV2ProjectsByProjectIdManualRunEnvironmentProfilesAndProfileId: {
        invalidatesTags: (_result, error, arg) => error ? [] : [manualRunEnvironmentProfilesTag(arg.projectId)],
      },
      getApiV2ManualTestRunsByRunId: {
        providesTags: (result: GetApiV2ManualTestRunsByRunIdApiResponse | undefined, _error, arg: GetApiV2ManualTestRunsByRunIdApiArg) =>
          result ? getRunScopeTags(result) : getRunArgTags(arg.projectId, arg.runId),
      },
      putApiV2ManualTestRunsByRunIdScenariosOrder: {
        extraOptions: { maxRetries: 0 },
        invalidatesTags: (result: PutApiV2ManualTestRunsByRunIdScenariosOrderApiResponse | undefined, _error, arg: PutApiV2ManualTestRunsByRunIdScenariosOrderApiArg) =>
          result ? getRunScopeTags(result) : getMutationErrorTags(arg.projectId, arg.runId),
      },
      getApiV2Users: {
        providesTags: ['Users'],
      },
      postApiV2ManualTestRunsByRunIdScenariosBulk: {
        extraOptions: { maxRetries: 0 },
        invalidatesTags: (result: PostApiV2ManualTestRunsByRunIdScenariosBulkApiResponse | undefined, _error, arg: PostApiV2ManualTestRunsByRunIdScenariosBulkApiArg) =>
          result ? getRunScopeTags(result) : getMutationErrorTags(arg.projectId, arg.runId),
      },
      putApiV2ManualTestRunsByRunIdScenariosAndScenarioIdResult: {
        extraOptions: { maxRetries: 0 },
        invalidatesTags: (result: PutApiV2ManualTestRunsByRunIdScenariosAndScenarioIdResultApiResponse | undefined, _error, arg: PutApiV2ManualTestRunsByRunIdScenariosAndScenarioIdResultApiArg) =>
          result ? getRunScopeTags(result) : getMutationErrorTags(arg.projectId, arg.runId),
      },
      patchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdAssignee: {
        extraOptions: { maxRetries: 0 },
        invalidatesTags: (result: PatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdAssigneeApiResponse | undefined, _error, arg: PatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdAssigneeApiArg) =>
          result ? getRunScopeTags(result) : getMutationErrorTags(arg.projectId, arg.runId),
      },
      postApiV2ManualTestRunsByRunIdComplete: {
        extraOptions: { maxRetries: 0 },
        invalidatesTags: (
          result: PostApiV2ManualTestRunsByRunIdCompleteApiResponse | undefined,
          _error,
          arg: PostApiV2ManualTestRunsByRunIdCompleteApiArg,
        ) => (result ? getRunScopeTags(result) : getMutationErrorTags(arg.projectId, arg.runId)),
      },
      postApiV2ManualTestRunsByRunIdReopen: {
        extraOptions: { maxRetries: 0 },
        invalidatesTags: (result: PostApiV2ManualTestRunsByRunIdReopenApiResponse | undefined, _error, arg: PostApiV2ManualTestRunsByRunIdReopenApiArg) =>
          result ? getRunScopeTags(result) : getMutationErrorTags(arg.projectId, arg.runId),
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
  useGetApiV2UsersQuery,
  useLazyGetApiV2UsersQuery,
  usePatchApiV2TestScenariosByScenarioIdMutation,
  usePostApiV2TestScenariosByScenarioIdSpecLinksMutation,
  useDeleteApiV2TestScenariosByScenarioIdSpecLinksAndSpecIdMutation,
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
  useDeleteApiV2TestScenariosByScenarioIdMutation,
  useGetApiV2TestScenarioFoldersQuery,
  usePostApiV2TestScenarioFoldersMutation,
  usePatchApiV2TestScenarioFoldersByFolderIdMutation,
  useDeleteApiV2TestScenarioFoldersByFolderIdMutation,
  usePostApiV2TestScenarioFoldersRestorationMutation,
  usePostApiV2TestScenariosFolderRestorationMutation,
  useGetApiV2TestSuitesQuery,
  usePostApiV2TestSuitesMutation,
  useGetApiV2TestSuitesBySuiteIdQuery,
  usePatchApiV2TestSuitesBySuiteIdMutation,
  useDeleteApiV2TestSuitesBySuiteIdMutation,
  usePostApiV2TestSuitesBySuiteIdMembersMutation,
  useDeleteApiV2TestSuitesBySuiteIdMembersMutation,
  usePostApiV2TestSuitesBySuiteIdMembershipChangesMutation,
  usePostApiV2TestSuitesBySuiteIdMembershipRestorationMutation,
  usePostApiV2TestSuitesMovesMutation,
  usePostApiV2TestSuitesMoveRestorationMutation,
  usePutApiV2TestSuitesBySuiteIdMembersOrderMutation,
  useGetApiV2TestScenariosPriorityCountsQuery,
  usePatchApiV2TestScenariosBulkFolderMutation,
  usePostApiV2ManualTestRunsMutation,
  useGetApiV2ManualTestRunsQuery,
  useLazyGetApiV2ManualTestRunsQuery,
  useGetApiV2ManualTestRunsByRunIdQuery,
  useLazyGetApiV2ManualTestRunsByRunIdQuery,
  usePutApiV2ManualTestRunsByRunIdScenariosOrderMutation,
  usePostApiV2ManualTestRunsByRunIdScenariosBulkMutation,
  usePutApiV2ManualTestRunsByRunIdScenariosAndScenarioIdResultMutation,
  usePatchApiV2ManualTestRunsByRunIdScenariosAndScenarioIdAssigneeMutation,
  usePostApiV2ManualTestRunsByRunIdCompleteMutation,
  usePostApiV2ManualTestRunsByRunIdReopenMutation,
  useGetApiV2ProjectsByProjectIdManualRunEnvironmentProfilesQuery,
  usePostApiV2ProjectsByProjectIdManualRunEnvironmentProfilesMutation,
  usePatchApiV2ProjectsByProjectIdManualRunEnvironmentProfilesAndProfileIdMutation,
  useDeleteApiV2ProjectsByProjectIdManualRunEnvironmentProfilesAndProfileIdMutation,
} = extendedApi;
