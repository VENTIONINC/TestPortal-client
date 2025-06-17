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
      getApiV1Results: build.query<
        GetApiV1ResultsApiResponse,
        GetApiV1ResultsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/results`,
          params: {
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
            dates: queryArg.dates,
          },
        }),
        providesTags: ["Results"],
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
        query: (queryArg) => ({
          url: `/api/v2/users/${queryArg.userId}`,
          headers: {
            authorization: queryArg.authorization,
          },
        }),
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
          headers: {
            authorization: queryArg.authorization,
          },
        }),
        invalidatesTags: ["Users"],
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
export type GetApiV1ResultsApiResponse =
  /** status 200 List of results */ Result[];
export type GetApiV1ResultsApiArg = {
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
  /** Array of dates in YYYY-MM-DD format to filter results. If not provided, returns stats for all results. */
  dates?: string[];
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
  /** Bearer JWT token */
  authorization: string;
};
export type PatchApiV2UsersByUserIdApiResponse =
  /** status 200 User updated successfully */ User;
export type PatchApiV2UsersByUserIdApiArg = {
  userId: number;
  /** Bearer JWT token */
  authorization: string;
  userUpdateRequest: UserUpdateRequest;
};
export type Issue = {
  id: number;
  name: string;
  category?: string;
  description?: string;
  portal?: string;
  service?: string;
  ticket?: string;
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
  allureLink?: string;
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
  allureLink?: string;
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
  runId: string;
  env?: string;
  version?: string;
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
export const {
  useGetApiV1Query,
  useGetApiV1IssuesQuery,
  usePostApiV1IssuesMutation,
  useGetApiV1IssuesWithStatsQuery,
  useGetApiV1IssuesByIssueIdQuery,
  usePatchApiV1IssuesByIssueIdMutation,
  useGetApiV1ResultsQuery,
  useGetApiV1ResultsByResultIdQuery,
  useGetApiV1ResultsStatsQuery,
  useGetApiV1SpecsBySpecIdQuery,
  usePostApiV1AssumptionsMutation,
  usePatchApiV1AssumptionsByAssumptionIdMutation,
  usePatchApiV1ResultErrorsByResultErrorIdAssignIssueMutation,
  usePatchApiV1ResultErrorsByResultErrorIdReviewMutation,
  usePatchApiV1ResultErrorsBulkReviewMutation,
  useGetApiV1ExecutionsByExecutionIdQuery,
  usePostApiV1JsonReportMutation,
  useGetApiV1StatusQuery,
  usePostApiV2UsersSignupMutation,
  usePostApiV2UsersLoginMutation,
  usePostApiV2UsersRefreshTokenMutation,
  useGetApiV2UsersByUserIdQuery,
  usePatchApiV2UsersByUserIdMutation,
} = injectedRtkApi;
