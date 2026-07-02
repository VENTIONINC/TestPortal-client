import { baseApi as api } from './baseApi';
export const addTagTypes = [
  'System',
  'Issues',
  'Results',
  'Specs',
  'Assumptions',
  'Result Errors',
  'Executions',
  'Reports',
  'Upload',
  'Users',
  'MCP',
  'Authentication',
  'Error Formatter',
  'Prompts',
  'Projects',
  'CTRF',
  'Upload API Keys',
  'Exports',
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiV2Status: build.query<GetApiV2StatusApiResponse, GetApiV2StatusApiArg>({
        query: () => ({ url: `/api/v2/status` }),
        providesTags: ['System'],
      }),
      getApiV2Issues: build.query<GetApiV2IssuesApiResponse, GetApiV2IssuesApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/issues`,
          params: {
            projectId: queryArg.projectId,
            category: queryArg.category,
            name: queryArg.name,
            page: queryArg.page,
            limit: queryArg.limit,
          },
        }),
        providesTags: ['Issues'],
      }),
      postApiV2Issues: build.mutation<PostApiV2IssuesApiResponse, PostApiV2IssuesApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/issues`,
          method: 'POST',
          body: queryArg.createIssueRequest,
        }),
        invalidatesTags: ['Issues'],
      }),
      getApiV2IssuesByIssueId: build.query<GetApiV2IssuesByIssueIdApiResponse, GetApiV2IssuesByIssueIdApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/issues/${queryArg.issueId}`,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        providesTags: ['Issues'],
      }),
      patchApiV2IssuesByIssueId: build.mutation<PatchApiV2IssuesByIssueIdApiResponse, PatchApiV2IssuesByIssueIdApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/issues/${queryArg.issueId}`,
          method: 'PATCH',
          body: queryArg.updateIssueRequest,
        }),
        invalidatesTags: ['Issues'],
      }),
      deleteApiV2IssuesByIssueId: build.mutation<
        DeleteApiV2IssuesByIssueIdApiResponse,
        DeleteApiV2IssuesByIssueIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/issues/${queryArg.issueId}`,
          method: 'DELETE',
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ['Issues', 'Results'],
      }),
      getApiV2IssuesWithStats: build.query<GetApiV2IssuesWithStatsApiResponse, GetApiV2IssuesWithStatsApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/issues/with-stats`,
          params: {
            projectId: queryArg.projectId,
            category: queryArg.category,
            name: queryArg.name,
            page: queryArg.page,
            limit: queryArg.limit,
            statFrom: queryArg.statFrom,
            statTo: queryArg.statTo,
          },
        }),
        providesTags: ['Issues'],
      }),
      getApiV2Results: build.query<GetApiV2ResultsApiResponse, GetApiV2ResultsApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/results`,
          params: {
            projectId: queryArg.projectId,
            tag: queryArg.tag,
            specId: queryArg.specId,
            specFile: queryArg.specFile,
            specName: queryArg.specName,
            environment: queryArg.environment,
            type: queryArg['type'],
            status: queryArg.status,
            reviewStatus: queryArg.reviewStatus,
            errorMessage: queryArg.errorMessage,
            issueName: queryArg.issueName,
            from: queryArg['from'],
            to: queryArg.to,
            page: queryArg.page,
            limit: queryArg.limit,
          },
        }),
        providesTags: ['Results'],
      }),
      getApiV2ResultsByResultId: build.query<GetApiV2ResultsByResultIdApiResponse, GetApiV2ResultsByResultIdApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/results/${queryArg.resultId}`,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        providesTags: ['Results'],
      }),
      deleteApiV2ResultsByResultId: build.mutation<
        DeleteApiV2ResultsByResultIdApiResponse,
        DeleteApiV2ResultsByResultIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/results/${queryArg.resultId}`,
          method: 'DELETE',
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ['Results'],
      }),
      getApiV2ResultsStats: build.query<GetApiV2ResultsStatsApiResponse, GetApiV2ResultsStatsApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/results-stats`,
          params: {
            projectId: queryArg.projectId,
            dates: queryArg.dates,
          },
        }),
        providesTags: ['Results'],
      }),
      patchApiV2ResultsByResultIdAnalysis: build.mutation<
        PatchApiV2ResultsByResultIdAnalysisApiResponse,
        PatchApiV2ResultsByResultIdAnalysisApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/results/${queryArg.resultId}/analysis`,
          method: 'PATCH',
          body: queryArg.updateResultAnalysisRequest,
        }),
        invalidatesTags: ['Results'],
      }),
      patchApiV2ResultsByResultIdAnalysisFeedback: build.mutation<
        PatchApiV2ResultsByResultIdAnalysisFeedbackApiResponse,
        PatchApiV2ResultsByResultIdAnalysisFeedbackApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/results/${queryArg.resultId}/analysis-feedback`,
          method: 'PATCH',
          body: queryArg.updateResultAnalysisFeedbackRequest,
        }),
        invalidatesTags: ['Results'],
      }),
      getApiV2SpecsBySpecId: build.query<GetApiV2SpecsBySpecIdApiResponse, GetApiV2SpecsBySpecIdApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/specs/${queryArg.specId}`,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        providesTags: ['Specs'],
      }),
      deleteApiV2SpecsBySpecId: build.mutation<DeleteApiV2SpecsBySpecIdApiResponse, DeleteApiV2SpecsBySpecIdApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/specs/${queryArg.specId}`,
          method: 'DELETE',
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ['Specs'],
      }),
      postApiV2Assumptions: build.mutation<PostApiV2AssumptionsApiResponse, PostApiV2AssumptionsApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/assumptions`,
          method: 'POST',
          body: queryArg.createAssumptionRequest,
        }),
        invalidatesTags: ['Assumptions'],
      }),
      patchApiV2AssumptionsByAssumptionId: build.mutation<
        PatchApiV2AssumptionsByAssumptionIdApiResponse,
        PatchApiV2AssumptionsByAssumptionIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/assumptions/${queryArg.assumptionId}`,
          method: 'PATCH',
          body: queryArg.updateAssumptionRequest,
        }),
        invalidatesTags: ['Assumptions'],
      }),
      getApiV2AssumptionsByAssumptionId: build.query<
        GetApiV2AssumptionsByAssumptionIdApiResponse,
        GetApiV2AssumptionsByAssumptionIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/assumptions/${queryArg.assumptionId}`,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        providesTags: ['Assumptions'],
      }),
      deleteApiV2AssumptionsByAssumptionId: build.mutation<
        DeleteApiV2AssumptionsByAssumptionIdApiResponse,
        DeleteApiV2AssumptionsByAssumptionIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/assumptions/${queryArg.assumptionId}`,
          method: 'DELETE',
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ['Assumptions'],
      }),
      patchApiV2ResultErrorsByResultErrorIdAssignIssue: build.mutation<
        PatchApiV2ResultErrorsByResultErrorIdAssignIssueApiResponse,
        PatchApiV2ResultErrorsByResultErrorIdAssignIssueApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/result-errors/${queryArg.resultErrorId}/assign-issue`,
          method: 'PATCH',
          body: queryArg.assignIssueRequest,
        }),
        invalidatesTags: ['Result Errors'],
      }),
      patchApiV2ResultErrorsByResultErrorIdReview: build.mutation<
        PatchApiV2ResultErrorsByResultErrorIdReviewApiResponse,
        PatchApiV2ResultErrorsByResultErrorIdReviewApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/result-errors/${queryArg.resultErrorId}/review`,
          method: 'PATCH',
        }),
        invalidatesTags: ['Result Errors'],
      }),
      patchApiV2ResultErrorsBulkReview: build.mutation<
        PatchApiV2ResultErrorsBulkReviewApiResponse,
        PatchApiV2ResultErrorsBulkReviewApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/result-errors/bulk-review`,
          method: 'PATCH',
          body: queryArg.bulkReviewRequest,
        }),
        invalidatesTags: ['Result Errors'],
      }),
      postApiV2ResultErrorsAnalyze: build.mutation<
        PostApiV2ResultErrorsAnalyzeApiResponse,
        PostApiV2ResultErrorsAnalyzeApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/result-errors/analyze`,
          method: 'POST',
          body: queryArg.analyzeResultErrorsRequest,
        }),
        invalidatesTags: ['Result Errors'],
      }),
      getApiV2ResultErrorsByResultErrorId: build.query<
        GetApiV2ResultErrorsByResultErrorIdApiResponse,
        GetApiV2ResultErrorsByResultErrorIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/result-errors/${queryArg.resultErrorId}`,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        providesTags: ['Result Errors'],
      }),
      getApiV2ExecutionsByExecutionId: build.query<
        GetApiV2ExecutionsByExecutionIdApiResponse,
        GetApiV2ExecutionsByExecutionIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/executions/${queryArg.executionId}`,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        providesTags: ['Executions'],
      }),
      deleteApiV2ExecutionsByExecutionId: build.mutation<
        DeleteApiV2ExecutionsByExecutionIdApiResponse,
        DeleteApiV2ExecutionsByExecutionIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/executions/${queryArg.executionId}`,
          method: 'DELETE',
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ['Executions'],
      }),
      postApiV2UploadJsonReport: build.mutation<PostApiV2UploadJsonReportApiResponse, PostApiV2UploadJsonReportApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/upload-json-report`,
          method: 'POST',
          body: queryArg.body,
        }),
        invalidatesTags: ['Reports', 'Results'],
      }),
      postApiV2UploadJsonReportApiKey: build.mutation<
        PostApiV2UploadJsonReportApiKeyApiResponse,
        PostApiV2UploadJsonReportApiKeyApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/upload-json-report-api-key`,
          method: 'POST',
          body: queryArg.body,
        }),
        invalidatesTags: ['Reports', 'Results', 'Upload'],
      }),
      getApiV2UsersByUserId: build.query<GetApiV2UsersByUserIdApiResponse, GetApiV2UsersByUserIdApiArg>({
        query: (queryArg) => ({ url: `/api/v2/users/${queryArg.userId}` }),
        providesTags: ['Users'],
      }),
      patchApiV2UsersByUserId: build.mutation<PatchApiV2UsersByUserIdApiResponse, PatchApiV2UsersByUserIdApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/users/${queryArg.userId}`,
          method: 'PATCH',
          body: queryArg.userUpdateRequest,
        }),
        invalidatesTags: ['Users'],
      }),
      patchApiV2UsersByUserIdIntegrations: build.mutation<
        PatchApiV2UsersByUserIdIntegrationsApiResponse,
        PatchApiV2UsersByUserIdIntegrationsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/users/${queryArg.userId}/integrations`,
          method: 'PATCH',
          body: queryArg.userIntegrationsUpdateRequest,
        }),
        invalidatesTags: ['Users'],
      }),
      postApiV2UsersByUserIdMcpToken: build.mutation<
        PostApiV2UsersByUserIdMcpTokenApiResponse,
        PostApiV2UsersByUserIdMcpTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/users/${queryArg.userId}/mcp-token`,
          method: 'POST',
        }),
        invalidatesTags: ['MCP'],
      }),
      deleteApiV2UsersByUserIdMcpToken: build.mutation<
        DeleteApiV2UsersByUserIdMcpTokenApiResponse,
        DeleteApiV2UsersByUserIdMcpTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/users/${queryArg.userId}/mcp-token`,
          method: 'DELETE',
        }),
        invalidatesTags: ['MCP'],
      }),
      postApiV2UsersSignup: build.mutation<PostApiV2UsersSignupApiResponse, PostApiV2UsersSignupApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/users/signup`,
          method: 'POST',
          body: queryArg.userSignupRequest,
        }),
        invalidatesTags: ['Authentication'],
      }),
      postApiV2UsersLogin: build.mutation<PostApiV2UsersLoginApiResponse, PostApiV2UsersLoginApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/users/login`,
          method: 'POST',
          body: queryArg.userLoginRequest,
        }),
        invalidatesTags: ['Authentication'],
      }),
      postApiV2UsersRefreshToken: build.mutation<
        PostApiV2UsersRefreshTokenApiResponse,
        PostApiV2UsersRefreshTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/users/refresh-token`,
          method: 'POST',
          body: queryArg.refreshTokenRequest,
        }),
        invalidatesTags: ['Authentication'],
      }),
      postApiV2ErrorFormatter: build.mutation<PostApiV2ErrorFormatterApiResponse, PostApiV2ErrorFormatterApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/error-formatter`,
          method: 'POST',
          body: queryArg.errorFormatterRequest,
        }),
        invalidatesTags: ['Error Formatter'],
      }),
      postApiV2ErrorFormatterResult: build.mutation<
        PostApiV2ErrorFormatterResultApiResponse,
        PostApiV2ErrorFormatterResultApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/error-formatter/result`,
          method: 'POST',
          body: queryArg.errorSuggestionRequest,
        }),
        invalidatesTags: ['Error Formatter'],
      }),
      getApiV2Prompts: build.query<GetApiV2PromptsApiResponse, GetApiV2PromptsApiArg>({
        query: () => ({ url: `/api/v2/prompts` }),
        providesTags: ['Prompts'],
      }),
      getApiV2PromptsByName: build.query<GetApiV2PromptsByNameApiResponse, GetApiV2PromptsByNameApiArg>({
        query: (queryArg) => ({ url: `/api/v2/prompts/${queryArg.name}` }),
        providesTags: ['Prompts'],
      }),
      postApiV2PromptsByNameGenerate: build.mutation<
        PostApiV2PromptsByNameGenerateApiResponse,
        PostApiV2PromptsByNameGenerateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/prompts/${queryArg.name}/generate`,
          method: 'POST',
          body: queryArg.generatePromptRequest,
        }),
        invalidatesTags: ['Prompts'],
      }),
      getApiV2Projects: build.query<GetApiV2ProjectsApiResponse, GetApiV2ProjectsApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/projects`,
          params: {
            ownerId: queryArg.ownerId,
            isActive: queryArg.isActive,
            name: queryArg.name,
          },
        }),
        providesTags: ['Projects'],
      }),
      postApiV2Projects: build.mutation<PostApiV2ProjectsApiResponse, PostApiV2ProjectsApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/projects`,
          method: 'POST',
          body: queryArg.createProjectRequest,
        }),
        invalidatesTags: ['Projects'],
      }),
      getApiV2ProjectsById: build.query<GetApiV2ProjectsByIdApiResponse, GetApiV2ProjectsByIdApiArg>({
        query: (queryArg) => ({ url: `/api/v2/projects/${queryArg.id}` }),
        providesTags: ['Projects'],
      }),
      putApiV2ProjectsById: build.mutation<PutApiV2ProjectsByIdApiResponse, PutApiV2ProjectsByIdApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/projects/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateProjectRequest,
        }),
        invalidatesTags: ['Projects'],
      }),
      deleteApiV2ProjectsById: build.mutation<DeleteApiV2ProjectsByIdApiResponse, DeleteApiV2ProjectsByIdApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/projects/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Projects'],
      }),
      getApiV2ProjectsByProjectIdDashboard: build.query<
        GetApiV2ProjectsByProjectIdDashboardApiResponse,
        GetApiV2ProjectsByProjectIdDashboardApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/projects/${queryArg.projectId}/dashboard`,
          params: {
            environment: queryArg.environment,
            period: queryArg.period,
            type: queryArg['type'],
            granularity: queryArg.granularity,
          },
        }),
        providesTags: ['Projects'],
      }),
      postApiV2UploadCtrfReport: build.mutation<PostApiV2UploadCtrfReportApiResponse, PostApiV2UploadCtrfReportApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/upload-ctrf-report`,
          method: 'POST',
          body: queryArg.body,
        }),
        invalidatesTags: ['CTRF'],
      }),
      postApiV2UploadCtrfReportApiKey: build.mutation<
        PostApiV2UploadCtrfReportApiKeyApiResponse,
        PostApiV2UploadCtrfReportApiKeyApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/upload-ctrf-report-api-key`,
          method: 'POST',
          body: queryArg.body,
        }),
        invalidatesTags: ['CTRF'],
      }),
      postApiV2UploadGenerateKey: build.mutation<
        PostApiV2UploadGenerateKeyApiResponse,
        PostApiV2UploadGenerateKeyApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/upload/generate-key`,
          method: 'POST',
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ['Upload API Keys'],
      }),
      getApiV2UploadKeys: build.query<GetApiV2UploadKeysApiResponse, GetApiV2UploadKeysApiArg>({
        query: () => ({ url: `/api/v2/upload/keys` }),
        providesTags: ['Upload API Keys'],
      }),
      deleteApiV2UploadKeysById: build.mutation<DeleteApiV2UploadKeysByIdApiResponse, DeleteApiV2UploadKeysByIdApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/upload/keys/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Upload API Keys'],
      }),
      getApiV2AnalysisExport: build.query<GetApiV2AnalysisExportApiResponse, GetApiV2AnalysisExportApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/analysis-export`,
          params: {
            projectId: queryArg.projectId,
            dateFrom: queryArg.dateFrom,
            dateTo: queryArg.dateTo,
          },
        }),
        providesTags: ['Exports'],
      }),
      postApiV2ReportsPdfExport: build.mutation<PostApiV2ReportsPdfExportApiResponse, PostApiV2ReportsPdfExportApiArg>({
        query: (queryArg) => ({
          url: `/api/v2/reports/pdf-export`,
          method: 'POST',
          body: queryArg.pdfExportRequest,
        }),
        invalidatesTags: ['Reports', 'Exports'],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as generatedApi };
export type GetApiV2StatusApiResponse = /** status 200 Server status */ StatusResponse;
export type GetApiV2StatusApiArg = void;
export type GetApiV2IssuesApiResponse = /** status 200 List of issues */ Issue[];
export type GetApiV2IssuesApiArg = {
  /** Project ID to filter issues */
  projectId: string;
  category?: string;
  name?: string;
  page?: number;
  limit?: number;
};
export type PostApiV2IssuesApiResponse = /** status 201 Issue created successfully */ Issue;
export type PostApiV2IssuesApiArg = {
  createIssueRequest: CreateIssueRequest;
};
export type GetApiV2IssuesByIssueIdApiResponse = /** status 200 Issue details */ Issue;
export type GetApiV2IssuesByIssueIdApiArg = {
  issueId: string;
  /** Project ID to verify ownership of the issue */
  projectId: string;
};
export type PatchApiV2IssuesByIssueIdApiResponse = /** status 200 Issue updated successfully */ Issue;
export type PatchApiV2IssuesByIssueIdApiArg = {
  issueId: string;
  updateIssueRequest: UpdateIssueRequest;
};
export type DeleteApiV2IssuesByIssueIdApiResponse =
  /** status 200 Issue and all associated assumptions deleted successfully */ {
    message: string;
    issue: Issue;
  };
export type DeleteApiV2IssuesByIssueIdApiArg = {
  issueId: string;
  /** Project ID to verify ownership of the issue */
  projectId: string;
};
export type GetApiV2IssuesWithStatsApiResponse = /** status 200 List of issues with statistics */ {
  issues: {
    id: string;
    name: string;
    category?: string;
    description?: string;
    portal?: string;
    service?: string;
    ticket?: string;
    projectId: string;
    createdById?: string;
    updatedById?: string;
    createdAt: string;
    updatedAt: string;
    statistics: {
      occurrenceCount: number;
      firstOccurrence: string | null;
      lastOccurrence: string | null;
      impactedTestsCount: number;
      timeDistribution: {
        date: string;
        count: number;
      }[];
    };
  }[];
  total: number;
  page: number;
  totalPages: number;
};
export type GetApiV2IssuesWithStatsApiArg = {
  /** Project ID to filter issues with statistics */
  projectId: string;
  category?: 'Bug' | 'Script' | 'Infra' | 'Performance' | 'Other';
  name?: string;
  page?: number;
  limit?: number;
  /** Start date for statistics in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ) */
  statFrom?: string;
  /** End date for statistics in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ) */
  statTo?: string;
};
export type GetApiV2ResultsApiResponse = /** status 200 List of results */ ResultsListResponse;
export type GetApiV2ResultsApiArg = {
  projectId: string;
  tag?: string;
  specId?: string;
  specFile?: string;
  specName?: string;
  environment?: string;
  type?: string;
  status?: string;
  reviewStatus?: string;
  errorMessage?: string;
  issueName?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};
export type GetApiV2ResultsByResultIdApiResponse = /** status 200 Result details */ Result;
export type GetApiV2ResultsByResultIdApiArg = {
  resultId: string;
  /** Project ID to verify ownership of the result */
  projectId: string;
};
export type DeleteApiV2ResultsByResultIdApiResponse = unknown;
export type DeleteApiV2ResultsByResultIdApiArg = {
  resultId: string;
  /** Project ID to verify ownership of the result */
  projectId: string;
};
export type GetApiV2ResultsStatsApiResponse = /** status 200 Results statistics */ ResultsStats;
export type GetApiV2ResultsStatsApiArg = {
  projectId: string;
  /** Array of dates in YYYY-MM-DD format to filter results. If not provided, returns stats for all results. */
  dates?: string[];
};
export type PatchApiV2ResultsByResultIdAnalysisApiResponse =
  /** status 200 Result analysis updated successfully */ Result;
export type PatchApiV2ResultsByResultIdAnalysisApiArg = {
  resultId: string;
  updateResultAnalysisRequest: UpdateResultAnalysisRequest;
};
export type PatchApiV2ResultsByResultIdAnalysisFeedbackApiResponse =
  /** status 200 Result analysis feedback updated successfully */ Result;
export type PatchApiV2ResultsByResultIdAnalysisFeedbackApiArg = {
  resultId: string;
  updateResultAnalysisFeedbackRequest: UpdateResultAnalysisFeedbackRequest;
};
export type GetApiV2SpecsBySpecIdApiResponse = /** status 200 Spec details */ Spec;
export type GetApiV2SpecsBySpecIdApiArg = {
  specId: string;
  /** Project ID to verify ownership of the spec */
  projectId: string;
};
export type DeleteApiV2SpecsBySpecIdApiResponse = unknown;
export type DeleteApiV2SpecsBySpecIdApiArg = {
  specId: string;
  /** Project ID to verify ownership of the spec */
  projectId: string;
};
export type PostApiV2AssumptionsApiResponse = /** status 201 Successfully created assumption */ Assumption;
export type PostApiV2AssumptionsApiArg = {
  createAssumptionRequest: CreateAssumptionRequest;
};
export type PatchApiV2AssumptionsByAssumptionIdApiResponse =
  /** status 200 Successfully updated assumption */ Assumption;
export type PatchApiV2AssumptionsByAssumptionIdApiArg = {
  assumptionId: string;
  updateAssumptionRequest: UpdateAssumptionRequest;
};
export type GetApiV2AssumptionsByAssumptionIdApiResponse =
  /** status 200 Successfully retrieved assumption */ Assumption;
export type GetApiV2AssumptionsByAssumptionIdApiArg = {
  assumptionId: string;
  /** Project ID to verify ownership of the assumption */
  projectId: string;
};
export type DeleteApiV2AssumptionsByAssumptionIdApiResponse = unknown;
export type DeleteApiV2AssumptionsByAssumptionIdApiArg = {
  assumptionId: string;
  /** Project ID to verify ownership of the assumption */
  projectId: string;
};
export type PatchApiV2ResultErrorsByResultErrorIdAssignIssueApiResponse =
  /** status 200 Issue assigned successfully */ SuccessResponse;
export type PatchApiV2ResultErrorsByResultErrorIdAssignIssueApiArg = {
  resultErrorId: string;
  assignIssueRequest: AssignIssueRequest;
};
export type PatchApiV2ResultErrorsByResultErrorIdReviewApiResponse =
  /** status 200 Result error reviewed successfully */ SuccessResponse;
export type PatchApiV2ResultErrorsByResultErrorIdReviewApiArg = {
  resultErrorId: string;
};
export type PatchApiV2ResultErrorsBulkReviewApiResponse =
  /** status 200 Bulk review completed successfully */ SuccessResponse;
export type PatchApiV2ResultErrorsBulkReviewApiArg = {
  bulkReviewRequest: BulkReviewRequest;
};
export type PostApiV2ResultErrorsAnalyzeApiResponse =
  /** status 200 Analysis completed successfully */ AnalyzeResultErrorsResponse;
export type PostApiV2ResultErrorsAnalyzeApiArg = {
  analyzeResultErrorsRequest: AnalyzeResultErrorsRequest;
};
export type GetApiV2ResultErrorsByResultErrorIdApiResponse = /** status 200 Result error retrieved successfully */ {
  data: ResultError;
};
export type GetApiV2ResultErrorsByResultErrorIdApiArg = {
  resultErrorId: string;
  /** Project ID to verify ownership of the result error */
  projectId: string;
};
export type GetApiV2ExecutionsByExecutionIdApiResponse =
  /** status 200 Execution details retrieved successfully */ Execution;
export type GetApiV2ExecutionsByExecutionIdApiArg = {
  executionId: string;
  /** Project ID to verify ownership of the execution */
  projectId: string;
};
export type DeleteApiV2ExecutionsByExecutionIdApiResponse = unknown;
export type DeleteApiV2ExecutionsByExecutionIdApiArg = {
  executionId: string;
  /** Project ID to verify ownership of the execution */
  projectId: string;
};
export type PostApiV2UploadJsonReportApiResponse =
  /** status 201 File report processed successfully */ JsonReportResponse;
export type PostApiV2UploadJsonReportApiArg = {
  body: {
    /** Project ID to associate the report with */
    projectId: string;
    /** JSON test report file to upload */
    report: Blob;
  };
};
export type PostApiV2UploadJsonReportApiKeyApiResponse =
  /** status 201 File report processed successfully with optional AI analysis */ JsonReportResponseWithAnalysis;
export type PostApiV2UploadJsonReportApiKeyApiArg = {
  body: {
    /** JSON test report file to upload (CTRF format) */
    report: Blob;
  };
};
export type GetApiV2UsersByUserIdApiResponse = /** status 200 User details */ User;
export type GetApiV2UsersByUserIdApiArg = {
  userId: string;
};
export type PatchApiV2UsersByUserIdApiResponse = /** status 200 User updated successfully */ User;
export type PatchApiV2UsersByUserIdApiArg = {
  userId: string;
  userUpdateRequest: UserUpdateRequest;
};
export type PatchApiV2UsersByUserIdIntegrationsApiResponse =
  /** status 200 User integrations updated successfully */ User;
export type PatchApiV2UsersByUserIdIntegrationsApiArg = {
  userId: string;
  userIntegrationsUpdateRequest: UserIntegrationsUpdateRequest;
};
export type PostApiV2UsersByUserIdMcpTokenApiResponse =
  /** status 201 MCP token generated successfully */ McpTokenResponse;
export type PostApiV2UsersByUserIdMcpTokenApiArg = {
  userId: string;
};
export type DeleteApiV2UsersByUserIdMcpTokenApiResponse =
  /** status 200 MCP token revoked successfully */ SuccessResponse;
export type DeleteApiV2UsersByUserIdMcpTokenApiArg = {
  userId: string;
};
export type PostApiV2UsersSignupApiResponse = /** status 201 User created successfully */ User;
export type PostApiV2UsersSignupApiArg = {
  userSignupRequest: UserSignupRequest;
};
export type PostApiV2UsersLoginApiResponse =
  /** status 200 Login successful - returns user data, access token, and refresh token */ UserLoginResponse;
export type PostApiV2UsersLoginApiArg = {
  userLoginRequest: UserLoginRequest;
};
export type PostApiV2UsersRefreshTokenApiResponse =
  /** status 200 Token refresh successful - returns new access and refresh tokens */ UserLoginResponse;
export type PostApiV2UsersRefreshTokenApiArg = {
  refreshTokenRequest: RefreshTokenRequest;
};
export type PostApiV2ErrorFormatterApiResponse = /** status 200 Error formatted successfully */ ErrorFormatterResponse;
export type PostApiV2ErrorFormatterApiArg = {
  errorFormatterRequest: ErrorFormatterRequest;
};
export type PostApiV2ErrorFormatterResultApiResponse =
  /** status 200 Suggestion generated successfully */ ErrorSuggestionResponse;
export type PostApiV2ErrorFormatterResultApiArg = {
  errorSuggestionRequest: ErrorSuggestionRequest;
};
export type GetApiV2PromptsApiResponse = /** status 200 List of available prompts */ PromptsListResponse;
export type GetApiV2PromptsApiArg = void;
export type GetApiV2PromptsByNameApiResponse = /** status 200 Prompt configuration */ PromptConfig;
export type GetApiV2PromptsByNameApiArg = {
  name:
    | 'developer-code-assistant'
    | 'test-portal-assistant'
    | 'issue-analysis-assistant'
    | 'environment-performance-assistant'
    | 'software-documentation-assistant';
};
export type PostApiV2PromptsByNameGenerateApiResponse = /** status 200 Generated prompt */ GeneratePromptResponse;
export type PostApiV2PromptsByNameGenerateApiArg = {
  name:
    | 'developer-code-assistant'
    | 'test-portal-assistant'
    | 'issue-analysis-assistant'
    | 'environment-performance-assistant'
    | 'software-documentation-assistant';
  generatePromptRequest: GeneratePromptRequest;
};
export type GetApiV2ProjectsApiResponse = /** status 200 List of projects */ Project[];
export type GetApiV2ProjectsApiArg = {
  ownerId?: string;
  isActive?: boolean;
  name?: string;
};
export type PostApiV2ProjectsApiResponse = /** status 201 Project created successfully */ Project;
export type PostApiV2ProjectsApiArg = {
  createProjectRequest: CreateProjectRequest;
};
export type GetApiV2ProjectsByIdApiResponse = /** status 200 Project details */ Project;
export type GetApiV2ProjectsByIdApiArg = {
  id: string;
};
export type PutApiV2ProjectsByIdApiResponse = /** status 200 Project updated successfully */ Project;
export type PutApiV2ProjectsByIdApiArg = {
  id: string;
  updateProjectRequest: UpdateProjectRequest;
};
export type DeleteApiV2ProjectsByIdApiResponse = unknown;
export type DeleteApiV2ProjectsByIdApiArg = {
  id: string;
};
export type GetApiV2ProjectsByProjectIdDashboardApiResponse =
  /** status 200 Dashboard data retrieved successfully */ DashboardResponse;
export type GetApiV2ProjectsByProjectIdDashboardApiArg = {
  /** The unique identifier of the project */
  projectId: string;
  /** Target environment to filter results */
  environment: string;
  /** Number of days to include in history (default 30) */
  period?: string;
  /** Filter by execution type */
  type?: string;
  /** Aggregation level for history data (daily, weekly, monthly). Defaults to daily for short periods, weekly for long periods. */
  granularity?: 'daily' | 'weekly' | 'monthly';
};
export type PostApiV2UploadCtrfReportApiResponse =
  /** status 200 CTRF report file processed successfully */ CtrfReportResponse;
export type PostApiV2UploadCtrfReportApiArg = {
  body: {
    /** CTRF report JSON file to upload */
    report?: Blob;
    /** Project ID to associate the report with */
    projectId: string;
  };
};
export type PostApiV2UploadCtrfReportApiKeyApiResponse =
  /** status 200 CTRF report file processed successfully */ CtrfReportResponse;
export type PostApiV2UploadCtrfReportApiKeyApiArg = {
  body: {
    /** CTRF report JSON file to upload */
    report?: Blob;
  };
};
export type PostApiV2UploadGenerateKeyApiResponse =
  /** status 200 API key generated successfully. The plain text key is returned - save it securely as it will not be shown again. */ GenerateApiKeyResponse;
export type PostApiV2UploadGenerateKeyApiArg = {
  /** The UUID of the project to generate an API key for */
  projectId: string;
};
export type GetApiV2UploadKeysApiResponse =
  /** status 200 List of API keys for the authenticated user */ ListApiKeysResponse;
export type GetApiV2UploadKeysApiArg = void;
export type DeleteApiV2UploadKeysByIdApiResponse = /** status 200 API key revoked successfully */ RevokeApiKeyResponse;
export type DeleteApiV2UploadKeysByIdApiArg = {
  /** The UUID of the API key to revoke */
  id: string;
};
export type GetApiV2AnalysisExportApiResponse = /** status 200 JSONL export file */ string;
export type GetApiV2AnalysisExportApiArg = {
  projectId: string;
  /** Start date/time (ISO) */
  dateFrom: string;
  /** End date/time (ISO) */
  dateTo: string;
};
export type PostApiV2ReportsPdfExportApiResponse =
  /** status 200 PDF export stream. When includeAiInsights is true, the PDF may include an AI Insights section embedded in the document. */ Blob;
export type PostApiV2ReportsPdfExportApiArg = {
  pdfExportRequest: PdfExportRequest;
};
export type StatusResponse = {
  status: string;
  version: string;
};
export type ErrorResponse = {
  error: string;
};
export type Issue = {
  id: string;
  name: string;
  category?: string;
  description?: string;
  portal?: string;
  service?: string;
  ticket?: string;
  projectId: string;
  createdById?: string;
  updatedById?: string;
  createdAt: string;
  updatedAt: string;
};
export type CreateIssueRequest = {
  name: string;
  category?: string;
  description?: string;
  portal?: string;
  service?: string;
  ticket?: string;
  /** The UUID of the project this issue belongs to */
  projectId: string;
};
export type UpdateIssueRequest = {
  name?: string;
  category?: string;
  description?: string;
  portal?: string;
  service?: string;
  ticket?: string;
};
export type Result = {
  id: string;
  tag?: string;
  specId?: string;
  specFile?: string;
  specName?: string;
  environment?: string;
  type?: string;
  status?: string;
  reportPortalLink?: string;
  retry?: number;
  duration?: number;
  startTime?: string;
  /** Test analysis status */
  analysisStatus?: 'passed' | 'failed';
  /** Failure category from AI analysis */
  analysisCategory?: 'bug' | 'infra' | 'performance' | 'script' | 'other';
  /** Confidence level of analysis (1-5 scale) */
  analysisConfidence?: number;
  /** Explanation for the categorization decision */
  analysisConclusion?: string;
  /** Quality rating of error messages (1-5 scale, only for failed tests) */
  analysisErrorQuality?: number | null;
  /** Explanation for the error quality rating */
  analysisErrorQualityConclusion?: string | null;
  createdAt: string;
  updatedAt: string;
};
export type ResultsListResponse = {
  results: Result[];
  total: number;
  page: number;
  totalPages: number;
};
export type ResultsStats = {
  byStatus: {
    passed: number;
    failed: number;
    skipped: number;
    timedOut: number;
  };
  byStatusTotal: number;
  entityCounts: {
    specs: number;
    results: number;
    executions: number;
    issues: number;
    errors: number;
    assumptions: number;
  };
  topErrors: {
    title: string;
    count: number;
  }[];
  topIssues: {
    title: string;
    count: number;
    /** Failure category (bug, infra, script, performance, other) */
    category: string;
  }[];
};
export type UpdateResultAnalysisRequest = {
  /** Test analysis status */
  analysisStatus?: 'passed' | 'failed';
  /** Failure category from AI analysis */
  analysisCategory?: 'bug' | 'infra' | 'performance' | 'script' | 'other';
  /** Confidence level of analysis (1-5 scale) */
  analysisConfidence?: number;
  /** Explanation for the categorization decision */
  analysisConclusion?: string;
};
export type UpdateResultAnalysisFeedbackRequest = {
  /** Manual reviewer category */
  analysisFeedbackCategory?: 'bug' | 'infra' | 'performance' | 'script' | 'other';
  /** Manual reviewer confidence (1-5 scale) */
  analysisFeedbackConfidence?: number;
  /** Manual reviewer conclusion */
  analysisFeedbackConclusion?: string;
};
export type Spec = {
  id: string;
  title: string;
  custom_id?: string;
  file?: string;
  tags?: string[];
  annotations?: string[];
  createdAt: string;
  updatedAt: string;
};
export type Assumption = {
  id: string;
  issueId: string;
  resultErrorId: string;
  madeBy?: string;
  isConfirmed?: boolean;
  description?: string;
  hypothesis?: string;
  evidence?: string;
  createdAt: string;
  updatedAt: string;
};
export type CreateAssumptionRequest = {
  issueId: string;
  resultErrorId: string;
  madeBy?: string;
  isConfirmed?: boolean;
  description?: string;
  hypothesis?: string;
  evidence?: string;
  score?: number;
};
export type UpdateAssumptionRequest = {
  madeBy?: string;
  isConfirmed?: boolean;
  description?: string;
  hypothesis?: string;
  evidence?: string;
};
export type SuccessResponse = {
  message: string;
};
export type AssignIssueRequest = {
  issueId: string;
};
export type BulkReviewRequest = {
  errorIds: string[];
};
export type AnalyzeResultErrorsResponse = {
  analyzedResults: number;
  updatedResultIds: string[];
  skippedErrorIds: string[];
  totalErrors: number;
};
export type AnalyzeResultErrorsRequest = {
  projectId: string;
  errorIds: string[];
};
export type ResultError = {
  id: string;
  resultId: string;
  errorMessage: string;
  stackTrace?: string;
  assertionInfo?: string;
  createdAt: string;
  updatedAt: string;
};
export type Execution = {
  id: string;
  runId: string;
  env?: string;
  version?: string;
  provider: string;
  startTime: string;
  endTime?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};
export type JsonReportResponse = {
  success: boolean;
  executionId: string;
  specsProcessed: number;
};
export type JsonReportResponseWithAnalysis = {
  success: boolean;
  executionId: string;
  specsProcessed: number;
  /** Optional AI analysis results for test failures */
  analysis?: any[];
};
export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  mcpToken?: string;
  reportPortalUrl?: string | null;
  reportPortalEnabled: boolean;
  monitoringPortalUrl?: string | null;
  monitoringPortalEnabled: boolean;
  analyzeEnabled: boolean;
};
export type UserUpdateRequest = {
  name?: string;
  email?: string;
  password?: string;
};
export type UserIntegrationsUpdateRequest = {
  reportPortalUrl?: string | null;
  reportPortalEnabled?: boolean;
  monitoringPortalUrl?: string | null;
  monitoringPortalEnabled?: boolean;
  analyzeEnabled?: boolean;
};
export type McpTokenResponse = {
  token: string;
  expiresAt: string;
  message: string;
};
export type UserSignupRequest = {
  name: string;
  email: string;
  password: string;
};
export type UserLoginResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};
export type UserLoginRequest = {
  email: string;
  password: string;
};
export type RefreshTokenRequest = {
  refreshToken: string;
};
export type ErrorFormatterResponse = {
  original: {
    name: string;
    description: string;
    category: string;
  };
  formatted: {
    name: string;
    description: string;
  };
};
export type ErrorFormatterRequest = {
  name: string;
  description: string;
  category: string;
};
export type ErrorSuggestionResponse = {
  category: string;
  description: string;
};
export type ErrorSuggestionRequest = {
  resultId: string;
  projectId: string;
};
export type PromptParameter = {
  type: string;
  required: boolean;
  description: string;
  example?: string;
};
export type PromptConfig = {
  name: string;
  title: string;
  description: string;
  category: 'development' | 'reporting' | 'analysis' | 'performance' | 'documentation';
  parameters: {
    [key: string]: PromptParameter;
  };
};
export type PromptsListResponse = {
  prompts: PromptConfig[];
};
export type GeneratePromptResponse = {
  name: string;
  parameters: {
    [key: string]: any;
  };
  generated_prompt: string;
};
export type GeneratePromptRequest = {
  [key: string]: any;
};
export type ProjectCategoryWeights = {
  bug: number;
  infra: number;
  other: number;
  performance: number;
  script: number;
};
export type Project = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  categoryWeights?: ProjectCategoryWeights;
  _count?: {
    executions: number;
    specs: number;
    issues: number;
  };
};
export type CreateProjectRequest = {
  name: string;
  description?: string;
};
export type UpdateProjectRequest = {
  name?: string;
  description?: string;
  isActive?: boolean;
};
export type DashboardIssueMetrics = {
  bug: number;
  environment: number;
  script: number;
  performance: number;
  other: number;
};
export type DailyExecutionMetrics = {
  /** Total number of tests */
  total: number;
  /** Number of passed tests */
  passed: number;
  /** Number of failed tests */
  failed: number;
  /** Number of skipped tests */
  skipped: number;
  /** Total duration in milliseconds */
  duration: number;
  issues: DashboardIssueMetrics;
};
export type ExecutionSummary = {
  id: string;
  /** Name of the execution */
  name: string;
  /** Overall execution status */
  status: 'passed' | 'failed' | 'skipped' | 'running';
  /** ISO 8601 timestamp when execution started */
  startedAt: string;
  /** Total duration in milliseconds */
  duration: number;
  /** Execution type (e.g., Nightly, Release, OnDemand) */
  type: string;
  /** Environment where execution ran */
  environment: string;
  /** Test metrics for the execution */
  metrics?: {
    /** Total number of tests */
    total: number;
    /** Number of passed tests */
    passed: number;
    /** Number of failed tests */
    failed: number;
  };
};
export type DashboardResponse = {
  summary: {
    /** Total number of test runs in the period */
    totalRuns: number;
    /** Total number of failed test results in the period */
    failures: number;
    /** Pass rate percentage (0-100) */
    passRate: number;
    /** Pass rate trend indicator (percentage change) */
    passRateTrend?: number;
  };
  history: {
    /** Date in YYYY-MM-DD format */
    date: string;
    metrics: DailyExecutionMetrics;
  }[];
  recentExecutions: ExecutionSummary[];
};
export type CtrfReportResponse = {
  success: boolean;
  message: string;
  /** Execution ID for the processed report */
  executionId: string;
  data: {
    /** Number of test specs processed */
    specsProcessed: number;
    /** Database execution ID */
    executionId: string;
  };
};
export type GenerateApiKeyResponse = {
  success: boolean;
  message: string;
  data: {
    id: string;
    projectId: string;
    /** Plain text API key - only shown once at generation */
    apiKey: string;
    createdAt: string;
  };
};
export type DetailedErrorResponse = {
  error: string;
  details?: string;
};
export type UploadApiKey = {
  id: string;
  projectId: string;
  projectName: string;
  /** Hashed API key value */
  apiKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
export type ListApiKeysResponse = {
  success: boolean;
  data: UploadApiKey[];
};
export type RevokeApiKeyResponse = {
  success: boolean;
  message: string;
};
export type PdfExportInvalidParamsResponse = {
  error: 'INVALID_PARAMS';
  details: any[];
};
export type PdfExportPeriodTooLargeResponse = {
  error: 'PERIOD_TOO_LARGE';
  message: 'Export period cannot exceed 365 days';
};
export type PdfExportNotFoundResponse = {
  error: 'NOT_FOUND';
};
export type PdfExportServerErrorResponse = {
  /** Internal export failure code: DATA_FETCH_FAILED | CHART_RENDER_FAILED | PDF_BUILD_FAILED */
  error: 'DATA_FETCH_FAILED' | 'CHART_RENDER_FAILED' | 'PDF_BUILD_FAILED';
};
export type PdfExportTimeoutResponse = {
  /** PDF export exceeded server timeout window */
  error: 'EXPORT_TIMEOUT';
};
export type PdfExportRequest = {
  /** Project UUID or project name */
  project: string;
  /** Execution environment filter */
  environment: string;
  /** Execution type filter, use 'all' to include all types */
  executionType: string;
  /** Accepts YYYY-MM-DD or ISO datetime; backend normalizes to YYYY-MM-DD */
  periodStart: string;
  /** Accepts YYYY-MM-DD or ISO datetime; backend normalizes to YYYY-MM-DD */
  periodEnd: string;
  /** Time-bucket aggregation level: daily = by day, weekly = ISO week, monthly = year-month */
  granularity: 'daily' | 'weekly' | 'monthly';
  /** When true, the export includes an AI-generated insights section in the PDF. Defaults to false when omitted. */
  includeAiInsights?: boolean;
};
export const {
  useGetApiV2StatusQuery,
  useGetApiV2IssuesQuery,
  usePostApiV2IssuesMutation,
  useGetApiV2IssuesByIssueIdQuery,
  usePatchApiV2IssuesByIssueIdMutation,
  useDeleteApiV2IssuesByIssueIdMutation,
  useGetApiV2IssuesWithStatsQuery,
  useGetApiV2ResultsQuery,
  useGetApiV2ResultsByResultIdQuery,
  useDeleteApiV2ResultsByResultIdMutation,
  useGetApiV2ResultsStatsQuery,
  usePatchApiV2ResultsByResultIdAnalysisMutation,
  usePatchApiV2ResultsByResultIdAnalysisFeedbackMutation,
  useGetApiV2SpecsBySpecIdQuery,
  useDeleteApiV2SpecsBySpecIdMutation,
  usePostApiV2AssumptionsMutation,
  usePatchApiV2AssumptionsByAssumptionIdMutation,
  useGetApiV2AssumptionsByAssumptionIdQuery,
  useDeleteApiV2AssumptionsByAssumptionIdMutation,
  usePatchApiV2ResultErrorsByResultErrorIdAssignIssueMutation,
  usePatchApiV2ResultErrorsByResultErrorIdReviewMutation,
  usePatchApiV2ResultErrorsBulkReviewMutation,
  usePostApiV2ResultErrorsAnalyzeMutation,
  useGetApiV2ResultErrorsByResultErrorIdQuery,
  useGetApiV2ExecutionsByExecutionIdQuery,
  useDeleteApiV2ExecutionsByExecutionIdMutation,
  usePostApiV2UploadJsonReportMutation,
  usePostApiV2UploadJsonReportApiKeyMutation,
  useGetApiV2UsersByUserIdQuery,
  usePatchApiV2UsersByUserIdMutation,
  usePatchApiV2UsersByUserIdIntegrationsMutation,
  usePostApiV2UsersByUserIdMcpTokenMutation,
  useDeleteApiV2UsersByUserIdMcpTokenMutation,
  usePostApiV2UsersSignupMutation,
  usePostApiV2UsersLoginMutation,
  usePostApiV2UsersRefreshTokenMutation,
  usePostApiV2ErrorFormatterMutation,
  usePostApiV2ErrorFormatterResultMutation,
  useGetApiV2PromptsQuery,
  useGetApiV2PromptsByNameQuery,
  usePostApiV2PromptsByNameGenerateMutation,
  useGetApiV2ProjectsQuery,
  usePostApiV2ProjectsMutation,
  useGetApiV2ProjectsByIdQuery,
  usePutApiV2ProjectsByIdMutation,
  useDeleteApiV2ProjectsByIdMutation,
  useGetApiV2ProjectsByProjectIdDashboardQuery,
  usePostApiV2UploadCtrfReportMutation,
  usePostApiV2UploadCtrfReportApiKeyMutation,
  usePostApiV2UploadGenerateKeyMutation,
  useGetApiV2UploadKeysQuery,
  useDeleteApiV2UploadKeysByIdMutation,
  useGetApiV2AnalysisExportQuery,
  usePostApiV2ReportsPdfExportMutation,
} = injectedRtkApi;
