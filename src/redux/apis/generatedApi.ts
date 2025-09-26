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
  "Authentication",
  "Users",
  "MCP",
  "Test Analysis",
  "Error Formatter",
  "Prompts",
  "Projects",
  "CTRF",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiV1: build.query<GetApiV1ApiResponse, GetApiV1ApiArg>({
        query: () => ({ url: `/api/v1/` }),
        providesTags: ["System"],
      }),
      getApiV1Issues: build.query<
        GetApiV1IssuesApiResponse,
        GetApiV1IssuesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/issues`,
          params: {
            category: queryArg.category,
            name: queryArg.name,
            page: queryArg.page,
            limit: queryArg.limit,
          },
        }),
        providesTags: ["Issues"],
      }),
      postApiV1Issues: build.mutation<
        PostApiV1IssuesApiResponse,
        PostApiV1IssuesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/issues`,
          method: "POST",
          body: queryArg.createIssueRequest,
        }),
        invalidatesTags: ["Issues"],
      }),
      getApiV1IssuesWithStats: build.query<
        GetApiV1IssuesWithStatsApiResponse,
        GetApiV1IssuesWithStatsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/issues/with-stats`,
          params: {
            category: queryArg.category,
            name: queryArg.name,
            page: queryArg.page,
            limit: queryArg.limit,
            statFrom: queryArg.statFrom,
            statTo: queryArg.statTo,
          },
        }),
        providesTags: ["Issues"],
      }),
      deleteApiV1IssuesByIssueId: build.mutation<
        DeleteApiV1IssuesByIssueIdApiResponse,
        DeleteApiV1IssuesByIssueIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/issues/${queryArg.issueId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Issues", "Results"],
      }),
      getApiV1IssuesByIssueId: build.query<
        GetApiV1IssuesByIssueIdApiResponse,
        GetApiV1IssuesByIssueIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/issues/${queryArg.issueId}` }),
        providesTags: ["Issues"],
      }),
      patchApiV1IssuesByIssueId: build.mutation<
        PatchApiV1IssuesByIssueIdApiResponse,
        PatchApiV1IssuesByIssueIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/issues/${queryArg.issueId}`,
          method: "PATCH",
          body: queryArg.updateIssueRequest,
        }),
        invalidatesTags: ["Issues", "Results"],
      }),
      getApiV2Issues: build.query<
        GetApiV2IssuesApiResponse,
        GetApiV2IssuesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/issues`,
          params: {
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
      getApiV2IssuesByIssueId: build.query<
        GetApiV2IssuesByIssueIdApiResponse,
        GetApiV2IssuesByIssueIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v2/issues/${queryArg.issueId}` }),
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
        }),
        invalidatesTags: ["Issues", "Results"],
      }),
      getApiV1Results: build.query<
        GetApiV1ResultsApiResponse,
        GetApiV1ResultsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/results`,
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
            page: queryArg.page,
            limit: queryArg.limit,
          },
        }),
        providesTags: ["Results"],
      }),
      getApiV1ResultsByResultId: build.query<
        GetApiV1ResultsByResultIdApiResponse,
        GetApiV1ResultsByResultIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/results/${queryArg.resultId}` }),
        providesTags: ["Results"],
      }),
      getApiV1ResultsStats: build.query<
        GetApiV1ResultsStatsApiResponse,
        GetApiV1ResultsStatsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/results-stats`,
          params: {
            projectId: queryArg.projectId,
            dates: queryArg.dates,
          },
        }),
        providesTags: ["Results"],
      }),
      patchApiV1ResultsByResultIdAnalysis: build.mutation<
        PatchApiV1ResultsByResultIdAnalysisApiResponse,
        PatchApiV1ResultsByResultIdAnalysisApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/results/${queryArg.resultId}/analysis`,
          method: "PATCH",
          body: queryArg.updateResultAnalysisRequest,
        }),
        invalidatesTags: ["Results"],
      }),
      getApiV1SpecsBySpecId: build.query<
        GetApiV1SpecsBySpecIdApiResponse,
        GetApiV1SpecsBySpecIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/specs/${queryArg.specId}` }),
        providesTags: ["Specs"],
      }),
      postApiV1Assumptions: build.mutation<
        PostApiV1AssumptionsApiResponse,
        PostApiV1AssumptionsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/assumptions`,
          method: "POST",
          body: queryArg.createAssumptionRequest,
        }),
        invalidatesTags: ["Assumptions", "Results"],
      }),
      patchApiV1AssumptionsByAssumptionId: build.mutation<
        PatchApiV1AssumptionsByAssumptionIdApiResponse,
        PatchApiV1AssumptionsByAssumptionIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/assumptions/${queryArg.assumptionId}`,
          method: "PATCH",
          body: queryArg.updateAssumptionRequest,
        }),
        invalidatesTags: ["Assumptions", "Results"],
      }),
      patchApiV1ResultErrorsByResultErrorIdAssignIssue: build.mutation<
        PatchApiV1ResultErrorsByResultErrorIdAssignIssueApiResponse,
        PatchApiV1ResultErrorsByResultErrorIdAssignIssueApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/result-errors/${queryArg.resultErrorId}/assign-issue`,
          method: "PATCH",
          body: queryArg.assignIssueRequest,
        }),
        invalidatesTags: ["Result Errors"],
      }),
      patchApiV1ResultErrorsByResultErrorIdReview: build.mutation<
        PatchApiV1ResultErrorsByResultErrorIdReviewApiResponse,
        PatchApiV1ResultErrorsByResultErrorIdReviewApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/result-errors/${queryArg.resultErrorId}/review`,
          method: "PATCH",
        }),
        invalidatesTags: ["Result Errors"],
      }),
      patchApiV1ResultErrorsBulkReview: build.mutation<
        PatchApiV1ResultErrorsBulkReviewApiResponse,
        PatchApiV1ResultErrorsBulkReviewApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/result-errors/bulk-review`,
          method: "PATCH",
          body: queryArg.bulkReviewRequest,
        }),
        invalidatesTags: ["Result Errors"],
      }),
      getApiV1ExecutionsByExecutionId: build.query<
        GetApiV1ExecutionsByExecutionIdApiResponse,
        GetApiV1ExecutionsByExecutionIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/executions/${queryArg.executionId}`,
        }),
        providesTags: ["Executions"],
      }),
      postApiV1JsonReport: build.mutation<
        PostApiV1JsonReportApiResponse,
        PostApiV1JsonReportApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/json-report`,
          method: "POST",
          body: queryArg.jsonReportRequest,
        }),
        invalidatesTags: ["Reports"],
      }),
      postApiV1JsonReportUpload: build.mutation<
        PostApiV1JsonReportUploadApiResponse,
        PostApiV1JsonReportUploadApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/json-report/upload`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Reports", "Results"],
      }),
      getApiV1Status: build.query<
        GetApiV1StatusApiResponse,
        GetApiV1StatusApiArg
      >({
        query: () => ({ url: `/api/v1/status` }),
        providesTags: ["System"],
      }),
      postApiV2UsersSignup: build.mutation<
        PostApiV2UsersSignupApiResponse,
        PostApiV2UsersSignupApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/users/signup`,
          method: "POST",
          body: queryArg.userSignupRequest,
        }),
        invalidatesTags: ["Authentication"],
      }),
      postApiV2UsersLogin: build.mutation<
        PostApiV2UsersLoginApiResponse,
        PostApiV2UsersLoginApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/users/login`,
          method: "POST",
          body: queryArg.userLoginRequest,
        }),
        invalidatesTags: ["Authentication"],
      }),
      postApiV2UsersRefreshToken: build.mutation<
        PostApiV2UsersRefreshTokenApiResponse,
        PostApiV2UsersRefreshTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/users/refresh-token`,
          method: "POST",
          body: queryArg.refreshTokenRequest,
        }),
        invalidatesTags: ["Authentication"],
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
      postApiV1TestAnalysisAnalyze: build.mutation<
        PostApiV1TestAnalysisAnalyzeApiResponse,
        PostApiV1TestAnalysisAnalyzeApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/test-analysis/analyze`,
          method: "POST",
          body: queryArg.testAnalysisRequest,
        }),
        invalidatesTags: ["Test Analysis"],
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
      postApiV2CtrfReport: build.mutation<
        PostApiV2CtrfReportApiResponse,
        PostApiV2CtrfReportApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/ctrf/report`,
          method: "POST",
          body: queryArg.ctrfReportRequest,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        invalidatesTags: ["CTRF"],
      }),
      patchApiV2CtrfReportByExecutionId: build.mutation<
        PatchApiV2CtrfReportByExecutionIdApiResponse,
        PatchApiV2CtrfReportByExecutionIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/ctrf/report/${queryArg.executionId}`,
          method: "PATCH",
          body: queryArg.ctrfReportUpdateRequest,
        }),
        invalidatesTags: ["CTRF"],
      }),
      postApiV1Mcp: build.mutation<PostApiV1McpApiResponse, PostApiV1McpApiArg>(
        {
          query: (queryArg) => ({
            url: `/api/v1/mcp`,
            method: "POST",
            body: queryArg.body,
            headers: {
              "mcp-session-id": queryArg["mcp-session-id"],
            },
          }),
          invalidatesTags: ["MCP"],
        },
      ),
      getApiV1Mcp: build.query<GetApiV1McpApiResponse, GetApiV1McpApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/mcp`,
          headers: {
            "mcp-session-id": queryArg["mcp-session-id"],
          },
        }),
        providesTags: ["MCP"],
      }),
      deleteApiV1Mcp: build.mutation<
        DeleteApiV1McpApiResponse,
        DeleteApiV1McpApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/mcp`,
          method: "DELETE",
          headers: {
            "mcp-session-id": queryArg["mcp-session-id"],
          },
        }),
        invalidatesTags: ["MCP"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as generatedApi };
export type GetApiV1ApiResponse = unknown;
export type GetApiV1ApiArg = void;
export type GetApiV1IssuesApiResponse =
  /** status 200 List of issues */ Issue[];
export type GetApiV1IssuesApiArg = {
  category?: "Bug" | "Script" | "Infra" | "Performance";
  name?: string;
  page?: number;
  limit?: number;
};
export type PostApiV1IssuesApiResponse =
  /** status 201 Issue created successfully */ Issue;
export type PostApiV1IssuesApiArg = {
  createIssueRequest: CreateIssueRequest;
};
export type GetApiV1IssuesWithStatsApiResponse =
  /** status 200 List of issues with statistics */ {
    issues: {
      id: number;
      name: string;
      category?: string;
      description?: string;
      portal?: string;
      service?: string;
      ticket?: string;
      createdById?: number;
      updatedById?: number;
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
export type GetApiV1IssuesWithStatsApiArg = {
  category?: "Bug" | "Script" | "Infra" | "Performance";
  name?: string;
  page?: number;
  limit?: number;
  /** Start date for statistics in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ) */
  statFrom?: string;
  /** End date for statistics in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ) */
  statTo?: string;
};
export type DeleteApiV1IssuesByIssueIdApiResponse =
  /** status 200 Issue and all associated assumptions deleted successfully */ {
    message: string;
    issue: Issue;
  };
export type DeleteApiV1IssuesByIssueIdApiArg = {
  issueId: number;
};
export type GetApiV1IssuesByIssueIdApiResponse =
  /** status 200 Issue details */ Issue;
export type GetApiV1IssuesByIssueIdApiArg = {
  issueId: number;
};
export type PatchApiV1IssuesByIssueIdApiResponse =
  /** status 200 Issue updated successfully */ Issue;
export type PatchApiV1IssuesByIssueIdApiArg = {
  issueId: number;
  updateIssueRequest: UpdateIssueRequest;
};
export type GetApiV2IssuesApiResponse =
  /** status 200 List of issues */ Issue[];
export type GetApiV2IssuesApiArg = {
  category?: string;
  name?: string;
  page?: number;
  limit?: number;
};
export type PostApiV2IssuesApiResponse =
  /** status 201 Issue created successfully */ Issue;
export type PostApiV2IssuesApiArg = {
  createIssueRequest: CreateIssueRequest;
};
export type GetApiV2IssuesByIssueIdApiResponse =
  /** status 200 Issue details */ Issue;
export type GetApiV2IssuesByIssueIdApiArg = {
  issueId: number;
};
export type PatchApiV2IssuesByIssueIdApiResponse =
  /** status 200 Issue updated successfully */ Issue;
export type PatchApiV2IssuesByIssueIdApiArg = {
  issueId: number;
  updateIssueRequest: UpdateIssueRequest;
};
export type DeleteApiV2IssuesByIssueIdApiResponse =
  /** status 200 Issue and all associated assumptions deleted successfully */ {
    message: string;
    issue: Issue;
  };
export type DeleteApiV2IssuesByIssueIdApiArg = {
  issueId: number;
};
export type GetApiV1ResultsApiResponse =
  /** status 200 List of results */ Result[];
export type GetApiV1ResultsApiArg = {
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
export type GetApiV1ResultsByResultIdApiResponse =
  /** status 200 Result details */ Result;
export type GetApiV1ResultsByResultIdApiArg = {
  resultId: string;
};
export type GetApiV1ResultsStatsApiResponse =
  /** status 200 Results statistics */ ResultsStats;
export type GetApiV1ResultsStatsApiArg = {
  projectId: string;
  /** Array of dates in YYYY-MM-DD format to filter results. If not provided, returns stats for all results. */
  dates?: string[];
};
export type PatchApiV1ResultsByResultIdAnalysisApiResponse =
  /** status 200 Result analysis updated successfully */ Result;
export type PatchApiV1ResultsByResultIdAnalysisApiArg = {
  resultId: string;
  updateResultAnalysisRequest: UpdateResultAnalysisRequest;
};
export type GetApiV1SpecsBySpecIdApiResponse =
  /** status 200 Spec details */ Spec;
export type GetApiV1SpecsBySpecIdApiArg = {
  specId: string;
};
export type PostApiV1AssumptionsApiResponse =
  /** status 201 Assumption created successfully */ Assumption;
export type PostApiV1AssumptionsApiArg = {
  createAssumptionRequest: CreateAssumptionRequest;
};
export type PatchApiV1AssumptionsByAssumptionIdApiResponse =
  /** status 200 Assumption updated successfully */ Assumption;
export type PatchApiV1AssumptionsByAssumptionIdApiArg = {
  assumptionId: string;
  updateAssumptionRequest: UpdateAssumptionRequest;
};
export type PatchApiV1ResultErrorsByResultErrorIdAssignIssueApiResponse =
  /** status 200 Issue assigned successfully */ SuccessResponse;
export type PatchApiV1ResultErrorsByResultErrorIdAssignIssueApiArg = {
  resultErrorId: string;
  assignIssueRequest: AssignIssueRequest;
};
export type PatchApiV1ResultErrorsByResultErrorIdReviewApiResponse =
  /** status 200 Result error reviewed successfully */ SuccessResponse;
export type PatchApiV1ResultErrorsByResultErrorIdReviewApiArg = {
  resultErrorId: string;
};
export type PatchApiV1ResultErrorsBulkReviewApiResponse =
  /** status 200 Bulk review completed successfully */ SuccessResponse;
export type PatchApiV1ResultErrorsBulkReviewApiArg = {
  bulkReviewRequest: BulkReviewRequest;
};
export type GetApiV1ExecutionsByExecutionIdApiResponse =
  /** status 200 Execution details */ Execution;
export type GetApiV1ExecutionsByExecutionIdApiArg = {
  executionId: string;
};
export type PostApiV1JsonReportApiResponse =
  /** status 201 Report processed successfully */ JsonReportResponse;
export type PostApiV1JsonReportApiArg = {
  jsonReportRequest: JsonReportRequest;
};
export type PostApiV1JsonReportUploadApiResponse =
  /** status 201 File report processed successfully */ JsonReportResponse;
export type PostApiV1JsonReportUploadApiArg = {
  body: {
    /** Project ID to associate the report with */
    projectId: string;
    /** JSON test report file to upload */
    report: Blob;
  };
};
export type GetApiV1StatusApiResponse =
  /** status 200 Server status */ StatusResponse;
export type GetApiV1StatusApiArg = void;
export type PostApiV2UsersSignupApiResponse =
  /** status 201 User created successfully */ User;
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
export type GetApiV2UsersByUserIdApiResponse =
  /** status 200 User details */ User;
export type GetApiV2UsersByUserIdApiArg = {
  userId: number;
};
export type PatchApiV2UsersByUserIdApiResponse =
  /** status 200 User updated successfully */ User;
export type PatchApiV2UsersByUserIdApiArg = {
  userId: number;
  userUpdateRequest: UserUpdateRequest;
};
export type PatchApiV2UsersByUserIdIntegrationsApiResponse =
  /** status 200 User integrations updated successfully */ User;
export type PatchApiV2UsersByUserIdIntegrationsApiArg = {
  userId: number;
  userIntegrationsUpdateRequest: UserIntegrationsUpdateRequest;
};
export type PostApiV2UsersByUserIdMcpTokenApiResponse =
  /** status 201 MCP token generated successfully */ McpTokenResponse;
export type PostApiV2UsersByUserIdMcpTokenApiArg = {
  userId: number;
};
export type DeleteApiV2UsersByUserIdMcpTokenApiResponse =
  /** status 200 MCP token revoked successfully */ SuccessResponse;
export type DeleteApiV2UsersByUserIdMcpTokenApiArg = {
  userId: number;
};
export type PostApiV1TestAnalysisAnalyzeApiResponse =
  /** status 200 Test analysis completed successfully */ TestAnalysisResponse;
export type PostApiV1TestAnalysisAnalyzeApiArg = {
  testAnalysisRequest: TestAnalysisRequest;
};
export type PostApiV2ErrorFormatterApiResponse =
  /** status 200 Error formatted successfully */ ErrorFormatterResponse;
export type PostApiV2ErrorFormatterApiArg = {
  errorFormatterRequest: ErrorFormatterRequest;
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
    | "environment-performance-assistant";
};
export type PostApiV2PromptsByNameGenerateApiResponse =
  /** status 200 Generated prompt */ GeneratePromptResponse;
export type PostApiV2PromptsByNameGenerateApiArg = {
  name:
    | "developer-code-assistant"
    | "test-portal-assistant"
    | "issue-analysis-assistant"
    | "environment-performance-assistant";
  generatePromptRequest: GeneratePromptRequest;
};
export type GetApiV2ProjectsApiResponse =
  /** status 200 List of projects */ Project[];
export type GetApiV2ProjectsApiArg = {
  ownerId?: number;
  isActive?: boolean;
  name?: string;
};
export type PostApiV2ProjectsApiResponse =
  /** status 201 Project created successfully */ Project;
export type PostApiV2ProjectsApiArg = {
  createProjectRequest: CreateProjectRequest;
};
export type GetApiV2ProjectsByIdApiResponse =
  /** status 200 Project details */ Project;
export type GetApiV2ProjectsByIdApiArg = {
  id: number;
};
export type PutApiV2ProjectsByIdApiResponse =
  /** status 200 Project updated successfully */ Project;
export type PutApiV2ProjectsByIdApiArg = {
  id: number;
  updateProjectRequest: UpdateProjectRequest;
};
export type DeleteApiV2ProjectsByIdApiResponse = unknown;
export type DeleteApiV2ProjectsByIdApiArg = {
  id: number;
};
export type PostApiV2CtrfReportApiResponse =
  /** status 200 CTRF report processed successfully */ CtrfReportResponse;
export type PostApiV2CtrfReportApiArg = {
  /** Project ID to associate the report with */
  projectId: string;
  ctrfReportRequest: CtrfReportRequest;
};
export type PatchApiV2CtrfReportByExecutionIdApiResponse =
  /** status 200 CTRF report updated successfully */ CtrfReportResponse;
export type PatchApiV2CtrfReportByExecutionIdApiArg = {
  /** Execution ID to update */
  executionId: number;
  ctrfReportUpdateRequest: CtrfReportUpdateRequest;
};
export type PostApiV1McpApiResponse = /** status 200 MCP response */ any;
export type PostApiV1McpApiArg = {
  "mcp-session-id"?: string;
  body: any;
};
export type GetApiV1McpApiResponse = /** status 200 MCP session response */ any;
export type GetApiV1McpApiArg = {
  "mcp-session-id": string;
};
export type DeleteApiV1McpApiResponse =
  /** status 200 Session cleanup successful */ any;
export type DeleteApiV1McpApiArg = {
  "mcp-session-id": string;
};
export type Issue = {
  id: number;
  name: string;
  category?: string;
  description?: string;
  portal?: string;
  service?: string;
  ticket?: string;
  createdById?: number;
  updatedById?: number;
  createdAt: string;
  updatedAt: string;
};
export type ErrorResponse = {
  error: string;
};
export type CreateIssueRequest = {
  name: string;
  category?: string;
  description?: string;
  portal?: string;
  service?: string;
  ticket?: string;
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
  createdAt: string;
  updatedAt: string;
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
  }[];
};
export type UpdateResultAnalysisRequest = {
  analysisStatus?: "passed" | "failed";
  analysisCategory?: "bug" | "infra" | "performance" | "script" | "other";
  analysisConfidence?: number;
  analysisConclusion?: string;
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
  issueId: number;
  resultErrorId: number;
  madeBy?: string;
  isConfirmed?: boolean;
  description?: string;
  hypothesis?: string;
  evidence?: string;
  createdAt: string;
  updatedAt: string;
};
export type CreateAssumptionRequest = {
  issueId: number;
  resultErrorId: number;
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
  issueId: number;
};
export type BulkReviewRequest = {
  errorIds: number[];
};
export type Execution = {
  id: string;
  runId: string;
  env?: string;
  version?: string;
  startTime: string;
  endTime?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};
export type JsonReportResponse = {
  success: boolean;
  executionId: number;
  specsProcessed: number;
};
export type JsonReportTestResult = {
  reportPortalLink?: string;
  retry?: number;
  status: string;
  duration?: number;
  startTime: string;
  error?: {
    message: string;
    stack?: string;
    assertion?: string;
  };
};
export type JsonReportTestSpec = {
  title: string;
  custom_id?: string;
  location?: {
    file?: string;
  };
  tags?: string[];
  annotations?: string[];
  results: JsonReportTestResult[];
};
export type JsonReportRequest = {
  runId?: string;
  env?: string;
  version?: string;
  identifierStrategy?: "time-period" | "hourly" | "daily";
  stats?: {
    startTime: string;
  };
  tests: JsonReportTestSpec[];
};
export type StatusResponse = {
  status: string;
  database: string;
  version: string;
  timestamp?: string;
};
export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  mcpToken?: string;
  reportPortalUrl?: string | null;
  reportPortalEnabled: boolean;
  monitoringPortalUrl?: string | null;
  monitoringPortalEnabled: boolean;
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
};
export type McpTokenResponse = {
  token: string;
  expiresAt: string;
  message: string;
};
export type TestResultAnalysis = {
  id: string;
  status: "passed" | "failed";
  category?: "bug" | "infra" | "performance" | "script" | "other";
  confidence: number;
  conclusion?: string;
};
export type TestAnalysisResponse = {
  success: boolean;
  data: {
    dataSource: string;
    totalTests: number;
    analysisResults: TestResultAnalysis[];
  };
};
export type TestAnalysisRequest = {
  testResults?: any[];
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
  category: "development" | "reporting" | "analysis" | "performance";
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
export type Project = {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  ownerId: number;
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
};
export type UpdateProjectRequest = {
  name?: string;
  description?: string;
  isActive?: boolean;
};
export type CtrfReportResponse = {
  success: boolean;
  message: string;
  /** Execution ID for the processed report */
  executionId: number;
  data: {
    /** Number of test specs processed */
    specsProcessed: number;
    /** Database execution ID */
    executionId: number;
  };
};
export type CtrfTool = {
  /** Test tool name (e.g., 'playwright', 'jest') */
  name: string;
  /** Tool version */
  version?: string;
};
export type CtrfSummary = {
  /** Total number of tests */
  tests: number;
  /** Number of passed tests */
  passed: number;
  /** Number of failed tests */
  failed: number;
  /** Number of pending tests */
  pending: number;
  /** Number of skipped tests */
  skipped: number;
  /** Number of tests with other status */
  other: number;
  /** Start timestamp (Unix epoch) */
  start: number;
  /** End timestamp (Unix epoch) */
  stop: number;
};
export type CtrfTestStatus =
  | "passed"
  | "failed"
  | "skipped"
  | "pending"
  | "other";
export type CtrfTest = {
  /** Test name/title */
  name: string;
  status: CtrfTestStatus;
  /** Test duration in milliseconds */
  duration: number;
  /** Error/failure message */
  message?: string;
  /** Stack trace or detailed error info */
  trace?: string;
  /** Original status from test framework */
  rawStatus?: string;
  /** Test type (e.g., 'unit', 'integration') */
  type?: string;
  /** Path to test file */
  filePath?: string;
  /** Retry attempt number */
  retry?: number;
  /** Whether test is flaky */
  flaky?: boolean;
  /** Test suite name */
  suite?: string;
  /** Array of test tags */
  tags?: string[];
  /** Custom test metadata */
  meta?: {
    [key: string]: any;
  };
};
export type CtrfEnvironment = {
  /** Application name */
  appName?: string;
  /** Build name */
  buildName?: string;
  /** Build number */
  buildNumber?: string;
  /** Build URL */
  buildUrl?: string;
  /** Repository name */
  repositoryName?: string;
  /** Repository URL */
  repositoryUrl?: string;
  /** Git branch name */
  branchName?: string;
  /** Test environment (e.g., 'staging', 'prod') */
  testEnvironment?: string;
  /** Custom environment metadata */
  extra?: {
    [key: string]: any;
  };
};
export type CtrfResults = {
  tool: CtrfTool;
  summary: CtrfSummary;
  tests: CtrfTest[];
  environment?: CtrfEnvironment;
  /** Custom metadata */
  extra?: {
    [key: string]: any;
  };
};
export type CtrfReportRequest = {
  results: CtrfResults;
};
export type CtrfReportUpdateRequest = {
  results: CtrfResults;
};
export const {
  useGetApiV1Query,
  useGetApiV1IssuesQuery,
  usePostApiV1IssuesMutation,
  useGetApiV1IssuesWithStatsQuery,
  useDeleteApiV1IssuesByIssueIdMutation,
  useGetApiV1IssuesByIssueIdQuery,
  usePatchApiV1IssuesByIssueIdMutation,
  useGetApiV2IssuesQuery,
  usePostApiV2IssuesMutation,
  useGetApiV2IssuesByIssueIdQuery,
  usePatchApiV2IssuesByIssueIdMutation,
  useDeleteApiV2IssuesByIssueIdMutation,
  useGetApiV1ResultsQuery,
  useGetApiV1ResultsByResultIdQuery,
  useGetApiV1ResultsStatsQuery,
  usePatchApiV1ResultsByResultIdAnalysisMutation,
  useGetApiV1SpecsBySpecIdQuery,
  usePostApiV1AssumptionsMutation,
  usePatchApiV1AssumptionsByAssumptionIdMutation,
  usePatchApiV1ResultErrorsByResultErrorIdAssignIssueMutation,
  usePatchApiV1ResultErrorsByResultErrorIdReviewMutation,
  usePatchApiV1ResultErrorsBulkReviewMutation,
  useGetApiV1ExecutionsByExecutionIdQuery,
  usePostApiV1JsonReportMutation,
  usePostApiV1JsonReportUploadMutation,
  useGetApiV1StatusQuery,
  usePostApiV2UsersSignupMutation,
  usePostApiV2UsersLoginMutation,
  usePostApiV2UsersRefreshTokenMutation,
  useGetApiV2UsersByUserIdQuery,
  usePatchApiV2UsersByUserIdMutation,
  usePatchApiV2UsersByUserIdIntegrationsMutation,
  usePostApiV2UsersByUserIdMcpTokenMutation,
  useDeleteApiV2UsersByUserIdMcpTokenMutation,
  usePostApiV1TestAnalysisAnalyzeMutation,
  usePostApiV2ErrorFormatterMutation,
  useGetApiV2PromptsQuery,
  useGetApiV2PromptsByNameQuery,
  usePostApiV2PromptsByNameGenerateMutation,
  useGetApiV2ProjectsQuery,
  usePostApiV2ProjectsMutation,
  useGetApiV2ProjectsByIdQuery,
  usePutApiV2ProjectsByIdMutation,
  useDeleteApiV2ProjectsByIdMutation,
  usePostApiV2CtrfReportMutation,
  usePatchApiV2CtrfReportByExecutionIdMutation,
  usePostApiV1McpMutation,
  useGetApiV1McpQuery,
  useDeleteApiV1McpMutation,
} = injectedRtkApi;
