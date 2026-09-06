import { baseApi as api } from "./baseApi";
export const addTagTypes = [
  "System",
  "Issues",
  "Results",
  "Specs",
  "Assumptions",
  "Result Errors",
  "Executions",
  "Reports",
  "Upload",
  "Users",
  "MCP",
  "Admin Users",
  "Authentication",
  "Error Formatter",
  "Prompts",
  "Skills",
  "Projects",
  "CTRF",
  "Upload API Keys",
  "Exports",
  "Test Scenarios",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiV2Status: build.query<
        GetApiV2StatusApiResponse,
        GetApiV2StatusApiArg
      >({
        query: () => ({ url: `/api/v2/status` }),
        providesTags: ["System"],
      }),
      getApiV2Issues: build.query<
        GetApiV2IssuesApiResponse,
        GetApiV2IssuesApiArg
      >({
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
        providesTags: ["Issues"],
      }),
      postApiV2Issues: build.mutation<
        PostApiV2IssuesApiResponse,
        PostApiV2IssuesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/issues`,
          method: "POST",
          body: queryArg.createIssueRequest,
        }),
        invalidatesTags: ["Issues"],
      }),
      getApiV2IssuesWithStats: build.query<
        GetApiV2IssuesWithStatsApiResponse,
        GetApiV2IssuesWithStatsApiArg
      >({
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
            type: queryArg["type"],
          },
        }),
        providesTags: ["Issues"],
      }),
      getApiV2IssuesByIssueId: build.query<
        GetApiV2IssuesByIssueIdApiResponse,
        GetApiV2IssuesByIssueIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/issues/${queryArg.issueId}`,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        providesTags: ["Issues"],
      }),
      patchApiV2IssuesByIssueId: build.mutation<
        PatchApiV2IssuesByIssueIdApiResponse,
        PatchApiV2IssuesByIssueIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/issues/${queryArg.issueId}`,
          method: "PATCH",
          body: queryArg.updateIssueRequest,
        }),
        invalidatesTags: ["Issues"],
      }),
      deleteApiV2IssuesByIssueId: build.mutation<
        DeleteApiV2IssuesByIssueIdApiResponse,
        DeleteApiV2IssuesByIssueIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/issues/${queryArg.issueId}`,
          method: "DELETE",
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ["Issues", "Results"],
      }),
      getApiV2Results: build.query<
        GetApiV2ResultsApiResponse,
        GetApiV2ResultsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/results`,
          params: {
            projectId: queryArg.projectId,
            tag: queryArg.tag,
            specId: queryArg.specId,
            specFile: queryArg.specFile,
            specName: queryArg.specName,
            environment: queryArg.environment,
            type: queryArg["type"],
            status: queryArg.status,
            reviewStatus: queryArg.reviewStatus,
            errorMessage: queryArg.errorMessage,
            issueName: queryArg.issueName,
            from: queryArg["from"],
            to: queryArg.to,
            dates: queryArg.dates,
            page: queryArg.page,
            limit: queryArg.limit,
          },
        }),
        providesTags: ["Results"],
      }),
      getApiV2ResultsByResultId: build.query<
        GetApiV2ResultsByResultIdApiResponse,
        GetApiV2ResultsByResultIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/results/${queryArg.resultId}`,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        providesTags: ["Results"],
      }),
      deleteApiV2ResultsByResultId: build.mutation<
        DeleteApiV2ResultsByResultIdApiResponse,
        DeleteApiV2ResultsByResultIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/results/${queryArg.resultId}`,
          method: "DELETE",
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ["Results"],
      }),
      getApiV2ResultsStats: build.query<
        GetApiV2ResultsStatsApiResponse,
        GetApiV2ResultsStatsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/results-stats`,
          params: {
            projectId: queryArg.projectId,
            dates: queryArg.dates,
          },
        }),
        providesTags: ["Results"],
      }),
      patchApiV2ResultsByResultIdAnalysis: build.mutation<
        PatchApiV2ResultsByResultIdAnalysisApiResponse,
        PatchApiV2ResultsByResultIdAnalysisApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/results/${queryArg.resultId}/analysis`,
          method: "PATCH",
          body: queryArg.updateResultAnalysisRequest,
        }),
        invalidatesTags: ["Results"],
      }),
      patchApiV2ResultsByResultIdAnalysisFeedback: build.mutation<
        PatchApiV2ResultsByResultIdAnalysisFeedbackApiResponse,
        PatchApiV2ResultsByResultIdAnalysisFeedbackApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/results/${queryArg.resultId}/analysis-feedback`,
          method: "PATCH",
          body: queryArg.updateResultAnalysisFeedbackRequest,
        }),
        invalidatesTags: ["Results"],
      }),
      getApiV2SpecsBySpecId: build.query<
        GetApiV2SpecsBySpecIdApiResponse,
        GetApiV2SpecsBySpecIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/specs/${queryArg.specId}`,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        providesTags: ["Specs"],
      }),
      deleteApiV2SpecsBySpecId: build.mutation<
        DeleteApiV2SpecsBySpecIdApiResponse,
        DeleteApiV2SpecsBySpecIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/specs/${queryArg.specId}`,
          method: "DELETE",
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ["Specs"],
      }),
      postApiV2Assumptions: build.mutation<
        PostApiV2AssumptionsApiResponse,
        PostApiV2AssumptionsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/assumptions`,
          method: "POST",
          body: queryArg.createAssumptionRequest,
        }),
        invalidatesTags: ["Assumptions"],
      }),
      patchApiV2AssumptionsByAssumptionId: build.mutation<
        PatchApiV2AssumptionsByAssumptionIdApiResponse,
        PatchApiV2AssumptionsByAssumptionIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/assumptions/${queryArg.assumptionId}`,
          method: "PATCH",
          body: queryArg.updateAssumptionRequest,
        }),
        invalidatesTags: ["Assumptions"],
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
        providesTags: ["Assumptions"],
      }),
      deleteApiV2AssumptionsByAssumptionId: build.mutation<
        DeleteApiV2AssumptionsByAssumptionIdApiResponse,
        DeleteApiV2AssumptionsByAssumptionIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/assumptions/${queryArg.assumptionId}`,
          method: "DELETE",
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ["Assumptions"],
      }),
      postApiV2ResultErrorsByResultErrorIdIssue: build.mutation<
        PostApiV2ResultErrorsByResultErrorIdIssueApiResponse,
        PostApiV2ResultErrorsByResultErrorIdIssueApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/result-errors/${queryArg.resultErrorId}/issue`,
          method: "POST",
          body: queryArg.resultErrorIssueCreateRequest,
        }),
        invalidatesTags: ["Result Errors"],
      }),
      patchApiV2ResultErrorsByResultErrorIdIssue: build.mutation<
        PatchApiV2ResultErrorsByResultErrorIdIssueApiResponse,
        PatchApiV2ResultErrorsByResultErrorIdIssueApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/result-errors/${queryArg.resultErrorId}/issue`,
          method: "PATCH",
          body: queryArg.resultErrorIssueUpdateRequest,
        }),
        invalidatesTags: ["Result Errors"],
      }),
      getApiV2ResultErrorsByResultErrorIdModalContext: build.query<
        GetApiV2ResultErrorsByResultErrorIdModalContextApiResponse,
        GetApiV2ResultErrorsByResultErrorIdModalContextApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/result-errors/${queryArg.resultErrorId}/modal-context`,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        providesTags: ["Result Errors"],
      }),
      patchApiV2ResultErrorsByResultErrorIdAssignIssue: build.mutation<
        PatchApiV2ResultErrorsByResultErrorIdAssignIssueApiResponse,
        PatchApiV2ResultErrorsByResultErrorIdAssignIssueApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/result-errors/${queryArg.resultErrorId}/assign-issue`,
          method: "PATCH",
          body: queryArg.assignIssueRequest,
        }),
        invalidatesTags: ["Result Errors"],
      }),
      patchApiV2ResultErrorsByResultErrorIdReview: build.mutation<
        PatchApiV2ResultErrorsByResultErrorIdReviewApiResponse,
        PatchApiV2ResultErrorsByResultErrorIdReviewApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/result-errors/${queryArg.resultErrorId}/review`,
          method: "PATCH",
        }),
        invalidatesTags: ["Result Errors"],
      }),
      patchApiV2ResultErrorsBulkReview: build.mutation<
        PatchApiV2ResultErrorsBulkReviewApiResponse,
        PatchApiV2ResultErrorsBulkReviewApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/result-errors/bulk-review`,
          method: "PATCH",
          body: queryArg.bulkReviewRequest,
        }),
        invalidatesTags: ["Result Errors"],
      }),
      postApiV2ResultErrorsAnalyze: build.mutation<
        PostApiV2ResultErrorsAnalyzeApiResponse,
        PostApiV2ResultErrorsAnalyzeApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/result-errors/analyze`,
          method: "POST",
          body: queryArg.analyzeResultErrorsRequest,
        }),
        invalidatesTags: ["Result Errors"],
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
        providesTags: ["Result Errors"],
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
        providesTags: ["Executions"],
      }),
      deleteApiV2ExecutionsByExecutionId: build.mutation<
        DeleteApiV2ExecutionsByExecutionIdApiResponse,
        DeleteApiV2ExecutionsByExecutionIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/executions/${queryArg.executionId}`,
          method: "DELETE",
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ["Executions"],
      }),
      postApiV2UploadJsonReport: build.mutation<
        PostApiV2UploadJsonReportApiResponse,
        PostApiV2UploadJsonReportApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/upload-json-report`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Reports", "Results"],
      }),
      postApiV2UploadJsonReportApiKey: build.mutation<
        PostApiV2UploadJsonReportApiKeyApiResponse,
        PostApiV2UploadJsonReportApiKeyApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/upload-json-report-api-key`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Reports", "Results", "Upload"],
      }),
      getApiV2UsersByUserId: build.query<
        GetApiV2UsersByUserIdApiResponse,
        GetApiV2UsersByUserIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v2/users/${queryArg.userId}` }),
        providesTags: ["Users"],
      }),
      patchApiV2UsersByUserId: build.mutation<
        PatchApiV2UsersByUserIdApiResponse,
        PatchApiV2UsersByUserIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/users/${queryArg.userId}`,
          method: "PATCH",
          body: queryArg.userUpdateRequest,
        }),
        invalidatesTags: ["Users"],
      }),
      patchApiV2UsersByUserIdIntegrations: build.mutation<
        PatchApiV2UsersByUserIdIntegrationsApiResponse,
        PatchApiV2UsersByUserIdIntegrationsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/users/${queryArg.userId}/integrations`,
          method: "PATCH",
          body: queryArg.userIntegrationsUpdateRequest,
        }),
        invalidatesTags: ["Users"],
      }),
      postApiV2UsersByUserIdMcpToken: build.mutation<
        PostApiV2UsersByUserIdMcpTokenApiResponse,
        PostApiV2UsersByUserIdMcpTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/users/${queryArg.userId}/mcp-token`,
          method: "POST",
        }),
        invalidatesTags: ["MCP"],
      }),
      deleteApiV2UsersByUserIdMcpToken: build.mutation<
        DeleteApiV2UsersByUserIdMcpTokenApiResponse,
        DeleteApiV2UsersByUserIdMcpTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/users/${queryArg.userId}/mcp-token`,
          method: "DELETE",
        }),
        invalidatesTags: ["MCP"],
      }),
      getApiV2AdminUsers: build.query<
        GetApiV2AdminUsersApiResponse,
        GetApiV2AdminUsersApiArg
      >({
        query: () => ({ url: `/api/v2/admin/users` }),
        providesTags: ["Admin Users"],
      }),
      postApiV2AdminUsersByUserIdApprove: build.mutation<
        PostApiV2AdminUsersByUserIdApproveApiResponse,
        PostApiV2AdminUsersByUserIdApproveApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/admin/users/${queryArg.userId}/approve`,
          method: "POST",
        }),
        invalidatesTags: ["Admin Users"],
      }),
      postApiV2AdminUsersByUserIdSuspend: build.mutation<
        PostApiV2AdminUsersByUserIdSuspendApiResponse,
        PostApiV2AdminUsersByUserIdSuspendApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/admin/users/${queryArg.userId}/suspend`,
          method: "POST",
        }),
        invalidatesTags: ["Admin Users"],
      }),
      postApiV2AdminUsersByUserIdRestore: build.mutation<
        PostApiV2AdminUsersByUserIdRestoreApiResponse,
        PostApiV2AdminUsersByUserIdRestoreApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/admin/users/${queryArg.userId}/restore`,
          method: "POST",
        }),
        invalidatesTags: ["Admin Users"],
      }),
      patchApiV2AdminUsersByUserIdRole: build.mutation<
        PatchApiV2AdminUsersByUserIdRoleApiResponse,
        PatchApiV2AdminUsersByUserIdRoleApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/admin/users/${queryArg.userId}/role`,
          method: "PATCH",
          body: queryArg.adminUserRoleUpdateRequest,
        }),
        invalidatesTags: ["Admin Users"],
      }),
      getApiV2AuthConfig: build.query<
        GetApiV2AuthConfigApiResponse,
        GetApiV2AuthConfigApiArg
      >({
        query: () => ({ url: `/api/v2/auth/config` }),
        providesTags: ["Authentication"],
      }),
      postApiV2AuthSignup: build.mutation<
        PostApiV2AuthSignupApiResponse,
        PostApiV2AuthSignupApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/auth/signup`,
          method: "POST",
          body: queryArg.userSignupRequest,
        }),
        invalidatesTags: ["Authentication"],
      }),
      postApiV2AuthLogin: build.mutation<
        PostApiV2AuthLoginApiResponse,
        PostApiV2AuthLoginApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/auth/login`,
          method: "POST",
          body: queryArg.userLoginRequest,
        }),
        invalidatesTags: ["Authentication"],
      }),
      postApiV2AuthRefreshToken: build.mutation<
        PostApiV2AuthRefreshTokenApiResponse,
        PostApiV2AuthRefreshTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/auth/refresh-token`,
          method: "POST",
          body: queryArg.refreshTokenRequest,
        }),
        invalidatesTags: ["Authentication"],
      }),
      postApiV2AuthLogout: build.mutation<
        PostApiV2AuthLogoutApiResponse,
        PostApiV2AuthLogoutApiArg
      >({
        query: () => ({ url: `/api/v2/auth/logout`, method: "POST" }),
        invalidatesTags: ["Authentication"],
      }),
      postApiV2ErrorFormatter: build.mutation<
        PostApiV2ErrorFormatterApiResponse,
        PostApiV2ErrorFormatterApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/error-formatter`,
          method: "POST",
          body: queryArg.errorFormatterRequest,
        }),
        invalidatesTags: ["Error Formatter"],
      }),
      postApiV2ErrorFormatterResult: build.mutation<
        PostApiV2ErrorFormatterResultApiResponse,
        PostApiV2ErrorFormatterResultApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/error-formatter/result`,
          method: "POST",
          body: queryArg.errorSuggestionRequest,
        }),
        invalidatesTags: ["Error Formatter"],
      }),
      getApiV2Prompts: build.query<
        GetApiV2PromptsApiResponse,
        GetApiV2PromptsApiArg
      >({
        query: () => ({ url: `/api/v2/prompts` }),
        providesTags: ["Prompts"],
      }),
      getApiV2PromptsByName: build.query<
        GetApiV2PromptsByNameApiResponse,
        GetApiV2PromptsByNameApiArg
      >({
        query: (queryArg) => ({ url: `/api/v2/prompts/${queryArg.name}` }),
        providesTags: ["Prompts"],
      }),
      postApiV2PromptsByNameGenerate: build.mutation<
        PostApiV2PromptsByNameGenerateApiResponse,
        PostApiV2PromptsByNameGenerateApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/prompts/${queryArg.name}/generate`,
          method: "POST",
          body: queryArg.generatePromptRequest,
        }),
        invalidatesTags: ["Prompts"],
      }),
      postApiV2Skills: build.mutation<
        PostApiV2SkillsApiResponse,
        PostApiV2SkillsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/skills`,
          method: "POST",
          body: queryArg.skillPackageUpload,
        }),
        invalidatesTags: ["Skills"],
      }),
      getApiV2Skills: build.query<
        GetApiV2SkillsApiResponse,
        GetApiV2SkillsApiArg
      >({
        query: () => ({ url: `/api/v2/skills` }),
        providesTags: ["Skills"],
      }),
      putApiV2SkillsById: build.mutation<
        PutApiV2SkillsByIdApiResponse,
        PutApiV2SkillsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/skills/${queryArg.id}`,
          method: "PUT",
          body: queryArg.skillPackageUpload,
        }),
        invalidatesTags: ["Skills"],
      }),
      deleteApiV2SkillsById: build.mutation<
        DeleteApiV2SkillsByIdApiResponse,
        DeleteApiV2SkillsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/skills/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Skills"],
      }),
      getApiV2SkillsById: build.query<
        GetApiV2SkillsByIdApiResponse,
        GetApiV2SkillsByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v2/skills/${queryArg.id}` }),
        providesTags: ["Skills"],
      }),
      getApiV2SkillsByIdArchive: build.query<
        GetApiV2SkillsByIdArchiveApiResponse,
        GetApiV2SkillsByIdArchiveApiArg
      >({
        query: (queryArg) => ({ url: `/api/v2/skills/${queryArg.id}/archive` }),
        providesTags: ["Skills"],
      }),
      getApiV2Projects: build.query<
        GetApiV2ProjectsApiResponse,
        GetApiV2ProjectsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/projects`,
          params: {
            ownerId: queryArg.ownerId,
            isActive: queryArg.isActive,
            name: queryArg.name,
          },
        }),
        providesTags: ["Projects"],
      }),
      postApiV2Projects: build.mutation<
        PostApiV2ProjectsApiResponse,
        PostApiV2ProjectsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/projects`,
          method: "POST",
          body: queryArg.createProjectRequest,
        }),
        invalidatesTags: ["Projects"],
      }),
      getApiV2ProjectsByIdExecutionTypes: build.query<
        GetApiV2ProjectsByIdExecutionTypesApiResponse,
        GetApiV2ProjectsByIdExecutionTypesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/projects/${queryArg.id}/execution-types`,
        }),
        providesTags: ["Projects"],
      }),
      getApiV2ProjectsById: build.query<
        GetApiV2ProjectsByIdApiResponse,
        GetApiV2ProjectsByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v2/projects/${queryArg.id}` }),
        providesTags: ["Projects"],
      }),
      putApiV2ProjectsById: build.mutation<
        PutApiV2ProjectsByIdApiResponse,
        PutApiV2ProjectsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/projects/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateProjectRequest,
        }),
        invalidatesTags: ["Projects"],
      }),
      deleteApiV2ProjectsById: build.mutation<
        DeleteApiV2ProjectsByIdApiResponse,
        DeleteApiV2ProjectsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/projects/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Projects"],
      }),
      getApiV2ProjectsByProjectIdDashboard: build.query<
        GetApiV2ProjectsByProjectIdDashboardApiResponse,
        GetApiV2ProjectsByProjectIdDashboardApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/projects/${queryArg.projectId}/dashboard`,
          params: {
            period: queryArg.period,
            type: queryArg["type"],
            granularity: queryArg.granularity,
          },
        }),
        providesTags: ["Projects"],
      }),
      postApiV2UploadCtrfReport: build.mutation<
        PostApiV2UploadCtrfReportApiResponse,
        PostApiV2UploadCtrfReportApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/upload-ctrf-report`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["CTRF"],
      }),
      postApiV2UploadCtrfReportApiKey: build.mutation<
        PostApiV2UploadCtrfReportApiKeyApiResponse,
        PostApiV2UploadCtrfReportApiKeyApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/upload-ctrf-report-api-key`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["CTRF"],
      }),
      postApiV2UploadGenerateKey: build.mutation<
        PostApiV2UploadGenerateKeyApiResponse,
        PostApiV2UploadGenerateKeyApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/upload/generate-key`,
          method: "POST",
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ["Upload API Keys"],
      }),
      getApiV2UploadKeys: build.query<
        GetApiV2UploadKeysApiResponse,
        GetApiV2UploadKeysApiArg
      >({
        query: () => ({ url: `/api/v2/upload/keys` }),
        providesTags: ["Upload API Keys"],
      }),
      deleteApiV2UploadKeysById: build.mutation<
        DeleteApiV2UploadKeysByIdApiResponse,
        DeleteApiV2UploadKeysByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/upload/keys/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Upload API Keys"],
      }),
      getApiV2AnalysisExport: build.query<
        GetApiV2AnalysisExportApiResponse,
        GetApiV2AnalysisExportApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/analysis-export`,
          params: {
            projectId: queryArg.projectId,
            dateFrom: queryArg.dateFrom,
            dateTo: queryArg.dateTo,
          },
        }),
        providesTags: ["Exports"],
      }),
      postApiV2ReportsPdfExport: build.mutation<
        PostApiV2ReportsPdfExportApiResponse,
        PostApiV2ReportsPdfExportApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/reports/pdf-export`,
          method: "POST",
          body: queryArg.pdfExportRequest,
        }),
        invalidatesTags: ["Reports", "Exports"],
      }),
      postApiV2TestScenariosByScenarioIdSpecLinks: build.mutation<
        PostApiV2TestScenariosByScenarioIdSpecLinksApiResponse,
        PostApiV2TestScenariosByScenarioIdSpecLinksApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenarios/${queryArg.scenarioId}/spec-links`,
          method: "POST",
          body: queryArg.testScenarioSpecLinkBody,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ["Test Scenarios"],
      }),
      getApiV2TestScenariosByScenarioIdSpecLinks: build.query<
        GetApiV2TestScenariosByScenarioIdSpecLinksApiResponse,
        GetApiV2TestScenariosByScenarioIdSpecLinksApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenarios/${queryArg.scenarioId}/spec-links`,
          params: {
            projectId: queryArg.projectId,
            page: queryArg.page,
            limit: queryArg.limit,
          },
        }),
        providesTags: ["Test Scenarios"],
      }),
      patchApiV2TestScenariosByScenarioId: build.mutation<
        PatchApiV2TestScenariosByScenarioIdApiResponse,
        PatchApiV2TestScenariosByScenarioIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenarios/${queryArg.scenarioId}`,
          method: "PATCH",
          body: queryArg.updateTestScenarioRequest,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ["Test Scenarios"],
      }),
      getApiV2TestScenariosByScenarioId: build.query<
        GetApiV2TestScenariosByScenarioIdApiResponse,
        GetApiV2TestScenariosByScenarioIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenarios/${queryArg.scenarioId}`,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        providesTags: ["Test Scenarios"],
      }),
      deleteApiV2TestScenariosByScenarioId: build.mutation<
        DeleteApiV2TestScenariosByScenarioIdApiResponse,
        DeleteApiV2TestScenariosByScenarioIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenarios/${queryArg.scenarioId}`,
          method: "DELETE",
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ["Test Scenarios"],
      }),
      deleteApiV2TestScenariosByScenarioIdSpecLinksAndSpecId: build.mutation<
        DeleteApiV2TestScenariosByScenarioIdSpecLinksAndSpecIdApiResponse,
        DeleteApiV2TestScenariosByScenarioIdSpecLinksAndSpecIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenarios/${queryArg.scenarioId}/spec-links/${queryArg.specId}`,
          method: "DELETE",
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ["Test Scenarios"],
      }),
      getApiV2TestScenariosByScenarioIdResults: build.query<
        GetApiV2TestScenariosByScenarioIdResultsApiResponse,
        GetApiV2TestScenariosByScenarioIdResultsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenarios/${queryArg.scenarioId}/results`,
          params: {
            projectId: queryArg.projectId,
            page: queryArg.page,
            limit: queryArg.limit,
          },
        }),
        providesTags: ["Test Scenarios"],
      }),
      getApiV2TestScenariosByScenarioIdIssues: build.query<
        GetApiV2TestScenariosByScenarioIdIssuesApiResponse,
        GetApiV2TestScenariosByScenarioIdIssuesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenarios/${queryArg.scenarioId}/issues`,
          params: {
            projectId: queryArg.projectId,
            page: queryArg.page,
            limit: queryArg.limit,
          },
        }),
        providesTags: ["Test Scenarios"],
      }),
      postApiV2TestScenarios: build.mutation<
        PostApiV2TestScenariosApiResponse,
        PostApiV2TestScenariosApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenarios`,
          method: "POST",
          body: queryArg.createTestScenarioRequest,
        }),
        invalidatesTags: ["Test Scenarios"],
      }),
      getApiV2TestScenarios: build.query<
        GetApiV2TestScenariosApiResponse,
        GetApiV2TestScenariosApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenarios`,
          params: {
            projectId: queryArg.projectId,
            page: queryArg.page,
            limit: queryArg.limit,
          },
        }),
        providesTags: ["Test Scenarios"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as generatedApi };
export type GetApiV2StatusApiResponse =
  /** status 200 Server status */ StatusResponse;
export type GetApiV2StatusApiArg = void;
export type GetApiV2IssuesApiResponse =
  /** status 200 Paginated list of categorized issues with linked-result summaries */ PaginatedIssueList;
export type GetApiV2IssuesApiArg = {
  /** Project ID to filter issues */
  projectId: string;
  category?: ResultCategory;
  name?: string;
  page?: number;
  limit?: number;
};
export type PostApiV2IssuesApiResponse =
  /** status 201 Categorized issue created successfully */ IssueCore;
export type PostApiV2IssuesApiArg = {
  createIssueRequest: CreateIssueRequest;
};
export type GetApiV2IssuesWithStatsApiResponse =
  /** status 200 Paginated list of issues with statistics and derived summaries */ PaginatedIssueStatisticsList;
export type GetApiV2IssuesWithStatsApiArg = {
  /** Project ID to filter issues with statistics */
  projectId: string;
  category?: ResultCategory;
  name?: string;
  page?: number;
  limit?: number;
  statFrom?: string;
  statTo?: string;
  /** Filter issues and statistics by exact execution type */
  type?: string;
};
export type GetApiV2IssuesByIssueIdApiResponse =
  /** status 200 Issue details with derived category summary */ IssueRead;
export type GetApiV2IssuesByIssueIdApiArg = {
  issueId: string;
  /** Project ID to verify ownership of the issue */
  projectId: string;
};
export type PatchApiV2IssuesByIssueIdApiResponse =
  /** status 200 Issue core updated successfully */ IssueCore;
export type PatchApiV2IssuesByIssueIdApiArg = {
  issueId: string;
  updateIssueRequest: UpdateIssueRequest;
};
export type DeleteApiV2IssuesByIssueIdApiResponse =
  /** status 200 Issue and all associated assumptions deleted successfully */ {
    message: string;
    issue: IssueCore;
  };
export type DeleteApiV2IssuesByIssueIdApiArg = {
  issueId: string;
  /** Project ID to verify ownership of the issue */
  projectId: string;
};
export type GetApiV2ResultsApiResponse =
  /** status 200 List of results */ ResultsListResponse;
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
  dates?: string[];
  page?: number;
  limit?: number;
};
export type GetApiV2ResultsByResultIdApiResponse =
  /** status 200 Result details */ Result;
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
export type GetApiV2ResultsStatsApiResponse =
  /** status 200 Results statistics */ ResultsStats;
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
export type GetApiV2SpecsBySpecIdApiResponse =
  /** status 200 Spec details */ Spec;
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
export type PostApiV2AssumptionsApiResponse =
  /** status 201 Successfully created assumption */ Assumption;
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
export type PostApiV2ResultErrorsByResultErrorIdIssueApiResponse =
  /** status 201 Issue created and assigned */ ResultErrorIssueWorkflowResponse;
export type PostApiV2ResultErrorsByResultErrorIdIssueApiArg = {
  resultErrorId: string;
  resultErrorIssueCreateRequest: ResultErrorIssueCreateRequest;
};
export type PatchApiV2ResultErrorsByResultErrorIdIssueApiResponse =
  /** status 200 Confirmed issue updated */ ResultErrorIssueWorkflowResponse;
export type PatchApiV2ResultErrorsByResultErrorIdIssueApiArg = {
  resultErrorId: string;
  resultErrorIssueUpdateRequest: ResultErrorIssueUpdateRequest;
};
export type GetApiV2ResultErrorsByResultErrorIdModalContextApiResponse =
  /** status 200 Modal context retrieved successfully */ ResultErrorModalContext;
export type GetApiV2ResultErrorsByResultErrorIdModalContextApiArg = {
  resultErrorId: string;
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
export type GetApiV2ResultErrorsByResultErrorIdApiResponse =
  /** status 200 Result error retrieved successfully */ {
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
export type GetApiV2UsersByUserIdApiResponse =
  /** status 200 User details */ User;
export type GetApiV2UsersByUserIdApiArg = {
  userId: string;
};
export type PatchApiV2UsersByUserIdApiResponse =
  /** status 200 User updated successfully */ User;
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
export type GetApiV2AdminUsersApiResponse =
  /** status 200 User list returned successfully */ AdminManagedUser[];
export type GetApiV2AdminUsersApiArg = void;
export type PostApiV2AdminUsersByUserIdApproveApiResponse =
  /** status 200 User updated successfully */ AdminManagedUser;
export type PostApiV2AdminUsersByUserIdApproveApiArg = {
  userId: string;
};
export type PostApiV2AdminUsersByUserIdSuspendApiResponse =
  /** status 200 User updated successfully */ AdminManagedUser;
export type PostApiV2AdminUsersByUserIdSuspendApiArg = {
  userId: string;
};
export type PostApiV2AdminUsersByUserIdRestoreApiResponse =
  /** status 200 User updated successfully */ AdminManagedUser;
export type PostApiV2AdminUsersByUserIdRestoreApiArg = {
  userId: string;
};
export type PatchApiV2AdminUsersByUserIdRoleApiResponse =
  /** status 200 User role updated successfully */ AdminManagedUser;
export type PatchApiV2AdminUsersByUserIdRoleApiArg = {
  userId: string;
  adminUserRoleUpdateRequest: AdminUserRoleUpdateRequest;
};
export type GetApiV2AuthConfigApiResponse =
  /** status 200 Auth provider configuration */ AuthConfig;
export type GetApiV2AuthConfigApiArg = void;
export type PostApiV2AuthSignupApiResponse =
  /** status 201 User created successfully */ PendingApprovalSignupResponse;
export type PostApiV2AuthSignupApiArg = {
  userSignupRequest: UserSignupRequest;
};
export type PostApiV2AuthLoginApiResponse =
  /** status 200 Login successful or challenge required */
    | UserLoginResponse
    | AuthChallengeResponse;
export type PostApiV2AuthLoginApiArg = {
  userLoginRequest: UserLoginRequest;
};
export type PostApiV2AuthRefreshTokenApiResponse =
  /** status 200 Token refresh successful - returns new access and refresh tokens */ UserLoginResponse;
export type PostApiV2AuthRefreshTokenApiArg = {
  refreshTokenRequest: RefreshTokenRequest;
};
export type PostApiV2AuthLogoutApiResponse =
  /** status 200 Logout completed */ {
    message: string;
  };
export type PostApiV2AuthLogoutApiArg = void;
export type PostApiV2ErrorFormatterApiResponse =
  /** status 200 Error formatted successfully */ ErrorFormatterResponse;
export type PostApiV2ErrorFormatterApiArg = {
  errorFormatterRequest: ErrorFormatterRequest;
};
export type PostApiV2ErrorFormatterResultApiResponse =
  /** status 200 Suggestion generated successfully */ ErrorSuggestionResponse;
export type PostApiV2ErrorFormatterResultApiArg = {
  errorSuggestionRequest: ErrorSuggestionRequest;
};
export type GetApiV2PromptsApiResponse =
  /** status 200 List of available prompts */ PromptsListResponse;
export type GetApiV2PromptsApiArg = void;
export type GetApiV2PromptsByNameApiResponse =
  /** status 200 Prompt configuration */ PromptConfig;
export type GetApiV2PromptsByNameApiArg = {
  name:
    | "developer-code-assistant"
    | "test-portal-assistant"
    | "issue-analysis-assistant"
    | "environment-performance-assistant"
    | "software-documentation-assistant";
};
export type PostApiV2PromptsByNameGenerateApiResponse =
  /** status 200 Generated prompt */ GeneratePromptResponse;
export type PostApiV2PromptsByNameGenerateApiArg = {
  name:
    | "developer-code-assistant"
    | "test-portal-assistant"
    | "issue-analysis-assistant"
    | "environment-performance-assistant"
    | "software-documentation-assistant";
  generatePromptRequest: GeneratePromptRequest;
};
export type PostApiV2SkillsApiResponse =
  /** status 201 Custom skill created */ SkillMetadata;
export type PostApiV2SkillsApiArg = {
  skillPackageUpload: SkillPackageUpload;
};
export type GetApiV2SkillsApiResponse =
  /** status 200 List of available skills */ SkillsListResponse;
export type GetApiV2SkillsApiArg = void;
export type PutApiV2SkillsByIdApiResponse =
  /** status 200 Custom skill replaced */ SkillMetadata;
export type PutApiV2SkillsByIdApiArg = {
  id: string;
  skillPackageUpload: SkillPackageUpload;
};
export type DeleteApiV2SkillsByIdApiResponse = unknown;
export type DeleteApiV2SkillsByIdApiArg = {
  id: string;
};
export type GetApiV2SkillsByIdApiResponse =
  /** status 200 Skill metadata and Markdown preview/source content */ SkillDetailResponse;
export type GetApiV2SkillsByIdApiArg = {
  id: string;
};
export type GetApiV2SkillsByIdArchiveApiResponse =
  /** status 200 Complete portable ZIP skill package */ SkillArchiveDownload;
export type GetApiV2SkillsByIdArchiveApiArg = {
  id: string;
};
export type GetApiV2ProjectsApiResponse =
  /** status 200 List of projects */ Project[];
export type GetApiV2ProjectsApiArg = {
  ownerId?: string;
  isActive?: boolean;
  name?: string;
};
export type PostApiV2ProjectsApiResponse =
  /** status 201 Project created successfully */ Project;
export type PostApiV2ProjectsApiArg = {
  createProjectRequest: CreateProjectRequest;
};
export type GetApiV2ProjectsByIdExecutionTypesApiResponse =
  /** status 200 Project execution types */ ProjectExecutionTypes;
export type GetApiV2ProjectsByIdExecutionTypesApiArg = {
  id: string;
};
export type GetApiV2ProjectsByIdApiResponse =
  /** status 200 Project details */ Project;
export type GetApiV2ProjectsByIdApiArg = {
  id: string;
};
export type PutApiV2ProjectsByIdApiResponse =
  /** status 200 Project updated successfully */ Project;
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
  /** Number of days to include in history (default 30) */
  period?: string;
  /** Filter by execution type */
  type?: string;
  /** Aggregation level for history data (daily, weekly, monthly). Defaults to daily for short periods, weekly for long periods. */
  granularity?: "daily" | "weekly" | "monthly";
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
export type DeleteApiV2UploadKeysByIdApiResponse =
  /** status 200 API key revoked successfully */ RevokeApiKeyResponse;
export type DeleteApiV2UploadKeysByIdApiArg = {
  /** The UUID of the API key to revoke */
  id: string;
};
export type GetApiV2AnalysisExportApiResponse =
  /** status 200 JSONL export file */ string;
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
export type PostApiV2TestScenariosByScenarioIdSpecLinksApiResponse =
  /** status 201 Test scenario Spec link created */ TestScenarioSpecLinkResponse;
export type PostApiV2TestScenariosByScenarioIdSpecLinksApiArg = {
  scenarioId: string;
  projectId: string;
  testScenarioSpecLinkBody: TestScenarioSpecLinkBody;
};
export type GetApiV2TestScenariosByScenarioIdSpecLinksApiResponse =
  /** status 200 Paginated linked Specs */ TestScenarioSpecLinkListResponse;
export type GetApiV2TestScenariosByScenarioIdSpecLinksApiArg = {
  scenarioId: string;
  projectId: string;
  page?: number;
  limit?: number;
};
export type PatchApiV2TestScenariosByScenarioIdApiResponse =
  /** status 200 Updated test scenario details */ TestScenario;
export type PatchApiV2TestScenariosByScenarioIdApiArg = {
  scenarioId: string;
  projectId: string;
  updateTestScenarioRequest: UpdateTestScenarioRequest;
};
export type GetApiV2TestScenariosByScenarioIdApiResponse =
  /** status 200 Test scenario details */ TestScenario;
export type GetApiV2TestScenariosByScenarioIdApiArg = {
  scenarioId: string;
  projectId: string;
};
export type DeleteApiV2TestScenariosByScenarioIdApiResponse = unknown;
export type DeleteApiV2TestScenariosByScenarioIdApiArg = {
  scenarioId: string;
  projectId: string;
};
export type DeleteApiV2TestScenariosByScenarioIdSpecLinksAndSpecIdApiResponse =
  unknown;
export type DeleteApiV2TestScenariosByScenarioIdSpecLinksAndSpecIdApiArg = {
  scenarioId: string;
  specId: string;
  projectId: string;
};
export type GetApiV2TestScenariosByScenarioIdResultsApiResponse =
  /** status 200 Paginated scenario Result evidence */ TestScenarioResultsResponse;
export type GetApiV2TestScenariosByScenarioIdResultsApiArg = {
  scenarioId: string;
  projectId: string;
  page?: number;
  limit?: number;
};
export type GetApiV2TestScenariosByScenarioIdIssuesApiResponse =
  /** status 200 Paginated scenario Issue evidence */ TestScenarioIssuesResponse;
export type GetApiV2TestScenariosByScenarioIdIssuesApiArg = {
  scenarioId: string;
  projectId: string;
  page?: number;
  limit?: number;
};
export type PostApiV2TestScenariosApiResponse =
  /** status 201 Test scenario created */ TestScenario;
export type PostApiV2TestScenariosApiArg = {
  createTestScenarioRequest: CreateTestScenarioRequest;
};
export type GetApiV2TestScenariosApiResponse =
  /** status 200 Paginated test scenarios */ TestScenarioListResponse;
export type GetApiV2TestScenariosApiArg = {
  projectId: string;
  page?: number;
  limit?: number;
};
export type StatusResponse = {
  status: string;
  version: string;
};
export type ErrorResponse = {
  error: string;
};
export type ResultCategory =
  | "bug"
  | "infra"
  | "performance"
  | "script"
  | "other";
export type IssueCore = {
  id: string;
  name: string;
  category: ResultCategory;
  description?: string | null;
  portal?: string | null;
  service?: string | null;
  ticket?: string | null;
  projectId?: string;
  createdById?: string | null;
  updatedById?: string | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  } | null;
  updatedBy?: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};
export type IssueCategorySummary = {
  displayCategory: ResultCategory;
  isMixed: boolean;
  distribution: {
    bug: number;
    infra: number;
    performance: number;
    script: number;
    other: number;
  };
  uncategorizedCount: number;
};
export type IssueRead = IssueCore & {
  categorySummary: IssueCategorySummary;
};
export type PaginatedIssueList = {
  issues: IssueRead[];
  total: number;
  page: number;
  totalPages: number;
};
export type CreateIssueRequest = {
  name: string;
  category: ResultCategory;
  description?: string;
  portal?: string;
  service?: string;
  ticket?: string;
  /** The UUID of the project this issue belongs to */
  projectId: string;
};
export type IssueStatistics = {
  occurrenceCount: number;
  firstOccurrence: string | null;
  lastOccurrence: string | null;
  impactedTestsCount: number;
  timeDistribution: {
    date: string;
    count: number;
  }[];
};
export type IssueWithStatistics = IssueRead & {
  statistics: IssueStatistics;
};
export type PaginatedIssueStatisticsList = {
  issues: IssueWithStatistics[];
  total: number;
  page: number;
  totalPages: number;
};
export type UpdateIssueRequest = {
  name?: string;
  category?: ResultCategory;
  description?: string;
  portal?: string;
  service?: string;
  ticket?: string;
};
export type ResultSpec = {
  id: string;
  key: string;
  file: string;
  title: string;
  tags: string[];
};
export type ResultExecution = {
  id: string;
  environment: string;
  type: string;
  name: string;
  version: string;
  startedAt: string;
  createdAt: string;
};
export type ResultNestedError = {
  id: string;
  type: string;
  message: string;
  callLog: string[];
  callStack: string[];
  testAssertion?: string | null;
  expectedPattern?: string | null;
  receivedString?: string | null;
  location: string;
  resultId?: string | null;
  createdAt: string;
  updatedAt: string;
};
export type Result = {
  id: string;
  status: string;
  reportPortalLink?: string | null;
  retry: number;
  duration: number;
  startTime: string;
  /** Test analysis status */
  analysisStatus?: ("passed" | "failed") | ("passed" | "failed");
  /** Failure category from AI analysis */
  analysisCategory?:
    | ("bug" | "infra" | "performance" | "script" | "other")
    | ("bug" | "infra" | "performance" | "script" | "other");
  /** Confidence level of analysis (1-5 scale) */
  analysisConfidence?: number | null;
  /** Explanation for the categorization decision */
  analysisConclusion?: string | null;
  /** Quality rating of error messages (1-5 scale, only for failed tests) */
  analysisErrorQuality?: number | null;
  /** Explanation for the error quality rating */
  analysisErrorQualityConclusion?: string | null;
  analysisReviewedAt?: string | null;
  analysisReviewedById?: string | null;
  /** Human category correction. When present, this is authoritative over analysisCategory. */
  analysisFeedbackCategory?:
    | ("bug" | "infra" | "performance" | "script" | "other")
    | ("bug" | "infra" | "performance" | "script" | "other");
  analysisFeedbackConfidence?: number | null;
  analysisFeedbackConclusion?: string | null;
  spec: ResultSpec;
  execution: ResultExecution;
  errors: ResultNestedError[];
  createdAt: string;
  updatedAt: string;
};
export type ResultsListResponse = {
  results: Result[];
  /** Unfiltered period results for specs in the current results page */
  rawResults: Result[];
  /** Unique sorted tags matching all active result filters except tag */
  availableTags: string[];
  total: number;
  /** Number of raw results returned for the current results page */
  rawTotal: number;
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
    id: string;
    title: string;
    count: number;
    category: "bug" | "infra" | "performance" | "script" | "other";
    categorySummary: IssueCategorySummary;
  }[];
};
export type UpdateResultAnalysisRequest = {
  /** Test analysis status */
  analysisStatus?: "passed" | "failed";
  /** Failure category from AI analysis */
  analysisCategory?: "bug" | "infra" | "performance" | "script" | "other";
  /** Confidence level of analysis (1-5 scale) */
  analysisConfidence?: number;
  /** Explanation for the categorization decision */
  analysisConclusion?: string;
};
export type UpdateResultAnalysisFeedbackRequest = {
  /** Human category correction. This becomes the effective category instead of the AI analysisCategory while preserving the AI value. */
  analysisFeedbackCategory?:
    | "bug"
    | "infra"
    | "performance"
    | "script"
    | "other";
  /** Manual reviewer confidence (1-5 scale) */
  analysisFeedbackConfidence?: number;
  /** Manual reviewer conclusion */
  analysisFeedbackConclusion?: string;
};
export type Spec = {
  id: string;
  key: string;
  title: string;
  file: string;
  tags: string[];
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
export type ResultErrorIssueWorkflowResponse = {
  issue: IssueCore;
  assumption: Assumption;
  result: {
    id: string;
    analysisFeedbackCategory: ResultCategory;
  };
};
export type ResultErrorIssueCreateRequest = {
  projectId: string;
  name: string;
  category: ResultCategory;
  description?: string;
  portal?: string;
  service?: string;
  ticket?: string;
};
export type ResultErrorIssueUpdateRequest = {
  projectId: string;
  category: ResultCategory;
  name?: string;
  description?: string;
  portal?: string;
  service?: string;
  ticket?: string;
};
export type ResultErrorModalIssue = {
  id: string;
  name: string;
  category: ResultCategory;
  description: string | null;
  portal: string | null;
  service: string | null;
  ticket: string | null;
};
export type ResultErrorModalAssignment = {
  id: string;
  isConfirmed: boolean;
  score: number;
  madeBy: string;
  issue: ResultErrorModalIssue;
};
export type ResultErrorModalContext = {
  error: {
    id: string;
    type: string;
    message: string;
    callLog: string[];
    callStack: string[];
    logs: string[];
    sourceSnippet: {
      path: string;
      text: string;
      startLine: number;
      failingLine: number;
    } | null;
    generatedTestCase: string | null;
    location: string;
  };
  result: {
    id: string;
    attempt: number;
    status: string;
    duration: number;
    startTime: string;
    reportPortalLink: string | null;
    category: "bug" | "infra" | "performance" | "script" | "other";
    testTitle: string;
    specPath: string;
    specKey: string;
    executionName: string;
    environment: string;
  };
  assignments: {
    confirmed: {
      id: string;
      isConfirmed: boolean;
      score: number;
      madeBy: string;
      issue: ResultErrorModalIssue;
    } | null;
    suggestions: ResultErrorModalAssignment[];
  };
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
  resultId?: string | null;
  type: string;
  message: string;
  callLog: string[];
  callStack: string[];
  testAssertion?: string | null;
  expectedPattern?: string | null;
  receivedString?: string | null;
  location: string;
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
export type UserStatus = "pending" | "active" | "suspended";
export type UserRole = "admin" | "member";
export type User = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role: UserRole;
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
export type AdminManagedUser = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  reportPortalUrl?: string | null;
  reportPortalEnabled: boolean;
  monitoringPortalUrl?: string | null;
  monitoringPortalEnabled: boolean;
  analyzeEnabled: boolean;
};
export type AdminUserRoleUpdateRequest = {
  role: UserRole;
};
export type AuthProvider = "local" | "cognito";
export type AuthConfig = {
  provider: AuthProvider;
  capabilities: {
    passwordLogin: boolean;
    passwordSignup: boolean;
    requiresRedirectLogin: boolean;
    supportsNewPasswordChallenge: boolean;
    signupRequiresApproval: boolean;
  };
};
export type PendingApprovalSignupResponse = {
  user: User;
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
  cognitoSession?: any;
};
export type AuthChallengeResponse = {
  status: "NEW_PASSWORD_REQUIRED";
  message: string;
};
export type UserLoginRequest = {
  email: string;
  password: string;
  newPassword?: string;
};
export type RefreshTokenRequest = {
  refreshToken: string;
};
export type ErrorFormatterResponse = {
  name: string;
  description: string;
};
export type ErrorFormatterRequest = {
  name: string;
  description: string;
  /** Optional canonical prompt context category. Values must be lowercase. */
  contextCategory?: "bug" | "infra" | "performance" | "script" | "other";
  /** Deprecated legacy prompt context alias. Case-insensitive; use contextCategory instead. */
  category?: string;
};
export type ErrorSuggestionResponse = {
  category: "bug" | "infra" | "performance" | "script" | "other";
  name: string;
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
  category:
    | "development"
    | "reporting"
    | "analysis"
    | "performance"
    | "documentation";
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
export type SkillMetadata = {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  source: "system" | "custom";
  readOnly: boolean;
  version?: string;
  license?: string;
  compatibility?: string;
  /** URL for the complete portable ZIP skill package. This is the only supported installable download. */
  downloadUrl: string;
};
export type SkillPackageUpload = {
  /** Zip archive containing SKILL.md and optional package resources. */
  package: Blob;
  /** Display title used in the shared skills catalog. */
  title: string;
  /** Catalog category for the custom skill. */
  category: string;
};
export type SkillsListResponse = {
  skills: SkillMetadata[];
};
export type SkillDetailResponse = {
  metadata: SkillMetadata;
  /** Markdown preview/source content. It is not a complete installable artifact; use metadata.downloadUrl for the ZIP package. */
  content: string;
};
export type SkillArchiveDownload = Blob;
export type ProjectCategoryWeights = {
  bug: number;
  infra: number;
  performance: number;
  script: number;
  other: number;
};
export type Project = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  ownerId: string;
  categoryWeights: ProjectCategoryWeights;
  createdAt: string;
  updatedAt: string;
  _count?: {
    executions: number;
    specs: number;
    issues: number;
  };
};
export type CreateProjectRequest = {
  name: string;
  description?: string;
  categoryWeights?: ProjectCategoryWeights;
};
export type ProjectExecutionTypes = string[];
export type UpdateProjectRequest = {
  name?: string;
  description?: string;
  isActive?: boolean;
  categoryWeights?: ProjectCategoryWeights;
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
  /** Number of timed-out tests */
  timedOut: number;
  /** Total duration in milliseconds */
  duration: number;
  issues: DashboardIssueMetrics;
};
export type ExecutionSummary = {
  id: string;
  /** Name of the execution */
  name: string;
  /** Overall execution status */
  status: "passed" | "failed" | "skipped" | "running";
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
  error: "INVALID_PARAMS";
  details: any[];
};
export type PdfExportPeriodTooLargeResponse = {
  error: "PERIOD_TOO_LARGE";
  message: "Export period cannot exceed 365 days";
};
export type PdfExportNotFoundResponse = {
  error: "NOT_FOUND";
};
export type PdfExportServerErrorResponse = {
  /** Internal export failure code: DATA_FETCH_FAILED | CHART_RENDER_FAILED | PDF_BUILD_FAILED */
  error: "DATA_FETCH_FAILED" | "CHART_RENDER_FAILED" | "PDF_BUILD_FAILED";
};
export type PdfExportTimeoutResponse = {
  /** PDF export exceeded server timeout window */
  error: "EXPORT_TIMEOUT";
};
export type PdfExportRequest = {
  /** Project UUID or project name */
  project: string;
  /** Execution type filter, use 'all' to include all types */
  executionType: string;
  /** Accepts YYYY-MM-DD or ISO datetime; backend normalizes to YYYY-MM-DD */
  periodStart: string;
  /** Accepts YYYY-MM-DD or ISO datetime; backend normalizes to YYYY-MM-DD */
  periodEnd: string;
  /** Time-bucket aggregation level: daily = by day, weekly = ISO week, monthly = year-month */
  granularity: "daily" | "weekly" | "monthly";
  /** When true, the export includes an AI-generated insights section in the PDF. Defaults to false when omitted. */
  includeAiInsights?: boolean;
};
export type TestScenarioSpecLinkResponse = {
  scenarioId: string;
  specId: string;
};
export type TestScenarioSpecLinkBody = {
  specId: string;
};
export type TestScenarioLinkedSpec = {
  id: string;
  projectId: string;
  key: string;
  file: string;
  title: string;
  tags: string[];
  annotations: any[];
  createdAt: string;
  updatedAt: string;
};
export type TestScenarioSpecLinkListResponse = {
  scenarioId: string;
  projectId: string;
  specs: TestScenarioLinkedSpec[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type TestScenario = {
  id: string;
  projectId: string;
  createdById: string;
  title: string;
  contentMd: string;
  details: string | null;
  createdAt: string;
  updatedAt: string;
};
export type UpdateTestScenarioRequest =
  | {
      title: string;
      contentMd?: string;
      details?: string | null;
    }
  | {
      title?: string;
      contentMd: string;
      details?: string | null;
    }
  | {
      title?: string;
      contentMd?: string;
      details: string | null;
    };
export type TestScenarioResultsResponse = {
  scenarioId: string;
  projectId: string;
  linkedSpecCount: number;
  results: Result[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type TestScenarioObservedIssue = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  category: string;
  description: string | null;
  portal: string | null;
  service: string | null;
  ticket: string | null;
  createdBy: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  } | null;
  updatedBy: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  } | null;
};
export type TestScenarioIssuesResponse = {
  scenarioId: string;
  projectId: string;
  linkedSpecCount: number;
  issues: TestScenarioObservedIssue[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type CreateTestScenarioRequest = {
  projectId: string;
  title: string;
  contentMd: string;
  details?: string;
};
export type TestScenarioCreatorSummary = {
  id: string;
  name: string;
  email: string;
};
export type TestScenarioSummary = {
  id: string;
  projectId: string;
  createdById: string;
  title: string;
  details: string | null;
  createdBy: TestScenarioCreatorSummary;
  createdAt: string;
  updatedAt: string;
};
export type TestScenarioListResponse = {
  scenarios: TestScenarioSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export const {
  useGetApiV2StatusQuery,
  useLazyGetApiV2StatusQuery,
  useGetApiV2IssuesQuery,
  useLazyGetApiV2IssuesQuery,
  usePostApiV2IssuesMutation,
  useGetApiV2IssuesWithStatsQuery,
  useLazyGetApiV2IssuesWithStatsQuery,
  useGetApiV2IssuesByIssueIdQuery,
  useLazyGetApiV2IssuesByIssueIdQuery,
  usePatchApiV2IssuesByIssueIdMutation,
  useDeleteApiV2IssuesByIssueIdMutation,
  useGetApiV2ResultsQuery,
  useLazyGetApiV2ResultsQuery,
  useGetApiV2ResultsByResultIdQuery,
  useLazyGetApiV2ResultsByResultIdQuery,
  useDeleteApiV2ResultsByResultIdMutation,
  useGetApiV2ResultsStatsQuery,
  useLazyGetApiV2ResultsStatsQuery,
  usePatchApiV2ResultsByResultIdAnalysisMutation,
  usePatchApiV2ResultsByResultIdAnalysisFeedbackMutation,
  useGetApiV2SpecsBySpecIdQuery,
  useLazyGetApiV2SpecsBySpecIdQuery,
  useDeleteApiV2SpecsBySpecIdMutation,
  usePostApiV2AssumptionsMutation,
  usePatchApiV2AssumptionsByAssumptionIdMutation,
  useGetApiV2AssumptionsByAssumptionIdQuery,
  useLazyGetApiV2AssumptionsByAssumptionIdQuery,
  useDeleteApiV2AssumptionsByAssumptionIdMutation,
  usePostApiV2ResultErrorsByResultErrorIdIssueMutation,
  usePatchApiV2ResultErrorsByResultErrorIdIssueMutation,
  useGetApiV2ResultErrorsByResultErrorIdModalContextQuery,
  useLazyGetApiV2ResultErrorsByResultErrorIdModalContextQuery,
  usePatchApiV2ResultErrorsByResultErrorIdAssignIssueMutation,
  usePatchApiV2ResultErrorsByResultErrorIdReviewMutation,
  usePatchApiV2ResultErrorsBulkReviewMutation,
  usePostApiV2ResultErrorsAnalyzeMutation,
  useGetApiV2ResultErrorsByResultErrorIdQuery,
  useLazyGetApiV2ResultErrorsByResultErrorIdQuery,
  useGetApiV2ExecutionsByExecutionIdQuery,
  useLazyGetApiV2ExecutionsByExecutionIdQuery,
  useDeleteApiV2ExecutionsByExecutionIdMutation,
  usePostApiV2UploadJsonReportMutation,
  usePostApiV2UploadJsonReportApiKeyMutation,
  useGetApiV2UsersByUserIdQuery,
  useLazyGetApiV2UsersByUserIdQuery,
  usePatchApiV2UsersByUserIdMutation,
  usePatchApiV2UsersByUserIdIntegrationsMutation,
  usePostApiV2UsersByUserIdMcpTokenMutation,
  useDeleteApiV2UsersByUserIdMcpTokenMutation,
  useGetApiV2AdminUsersQuery,
  useLazyGetApiV2AdminUsersQuery,
  usePostApiV2AdminUsersByUserIdApproveMutation,
  usePostApiV2AdminUsersByUserIdSuspendMutation,
  usePostApiV2AdminUsersByUserIdRestoreMutation,
  usePatchApiV2AdminUsersByUserIdRoleMutation,
  useGetApiV2AuthConfigQuery,
  useLazyGetApiV2AuthConfigQuery,
  usePostApiV2AuthSignupMutation,
  usePostApiV2AuthLoginMutation,
  usePostApiV2AuthRefreshTokenMutation,
  usePostApiV2AuthLogoutMutation,
  usePostApiV2ErrorFormatterMutation,
  usePostApiV2ErrorFormatterResultMutation,
  useGetApiV2PromptsQuery,
  useLazyGetApiV2PromptsQuery,
  useGetApiV2PromptsByNameQuery,
  useLazyGetApiV2PromptsByNameQuery,
  usePostApiV2PromptsByNameGenerateMutation,
  usePostApiV2SkillsMutation,
  useGetApiV2SkillsQuery,
  useLazyGetApiV2SkillsQuery,
  usePutApiV2SkillsByIdMutation,
  useDeleteApiV2SkillsByIdMutation,
  useGetApiV2SkillsByIdQuery,
  useLazyGetApiV2SkillsByIdQuery,
  useGetApiV2SkillsByIdArchiveQuery,
  useLazyGetApiV2SkillsByIdArchiveQuery,
  useGetApiV2ProjectsQuery,
  useLazyGetApiV2ProjectsQuery,
  usePostApiV2ProjectsMutation,
  useGetApiV2ProjectsByIdExecutionTypesQuery,
  useLazyGetApiV2ProjectsByIdExecutionTypesQuery,
  useGetApiV2ProjectsByIdQuery,
  useLazyGetApiV2ProjectsByIdQuery,
  usePutApiV2ProjectsByIdMutation,
  useDeleteApiV2ProjectsByIdMutation,
  useGetApiV2ProjectsByProjectIdDashboardQuery,
  useLazyGetApiV2ProjectsByProjectIdDashboardQuery,
  usePostApiV2UploadCtrfReportMutation,
  usePostApiV2UploadCtrfReportApiKeyMutation,
  usePostApiV2UploadGenerateKeyMutation,
  useGetApiV2UploadKeysQuery,
  useLazyGetApiV2UploadKeysQuery,
  useDeleteApiV2UploadKeysByIdMutation,
  useGetApiV2AnalysisExportQuery,
  useLazyGetApiV2AnalysisExportQuery,
  usePostApiV2ReportsPdfExportMutation,
  usePostApiV2TestScenariosByScenarioIdSpecLinksMutation,
  useGetApiV2TestScenariosByScenarioIdSpecLinksQuery,
  useLazyGetApiV2TestScenariosByScenarioIdSpecLinksQuery,
  usePatchApiV2TestScenariosByScenarioIdMutation,
  useGetApiV2TestScenariosByScenarioIdQuery,
  useLazyGetApiV2TestScenariosByScenarioIdQuery,
  useDeleteApiV2TestScenariosByScenarioIdMutation,
  useDeleteApiV2TestScenariosByScenarioIdSpecLinksAndSpecIdMutation,
  useGetApiV2TestScenariosByScenarioIdResultsQuery,
  useLazyGetApiV2TestScenariosByScenarioIdResultsQuery,
  useGetApiV2TestScenariosByScenarioIdIssuesQuery,
  useLazyGetApiV2TestScenariosByScenarioIdIssuesQuery,
  usePostApiV2TestScenariosMutation,
  useGetApiV2TestScenariosQuery,
  useLazyGetApiV2TestScenariosQuery,
} = injectedRtkApi;
