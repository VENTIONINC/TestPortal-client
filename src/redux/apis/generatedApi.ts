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
      getApi: build.query<GetApiApiResponse, GetApiApiArg>({
        query: () => ({ url: `/api/` }),
        providesTags: ["System"],
      }),
      getApiIssues: build.query<GetApiIssuesApiResponse, GetApiIssuesApiArg>({
        query: (queryArg) => ({
          url: `/api/issues`,
          params: {
            category: queryArg.category,
            name: queryArg.name,
            page: queryArg.page,
            limit: queryArg.limit,
          },
        }),
        providesTags: ["Issues"],
      }),
      postApiIssues: build.mutation<
        PostApiIssuesApiResponse,
        PostApiIssuesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/issues`,
          method: "POST",
          body: queryArg.createIssueRequest,
        }),
        invalidatesTags: ["Issues"],
      }),
      getApiIssuesByIssueId: build.query<
        GetApiIssuesByIssueIdApiResponse,
        GetApiIssuesByIssueIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/issues/${queryArg.issueId}` }),
        providesTags: ["Issues"],
      }),
      patchApiIssuesByIssueId: build.mutation<
        PatchApiIssuesByIssueIdApiResponse,
        PatchApiIssuesByIssueIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/issues/${queryArg.issueId}`,
          method: "PATCH",
          body: queryArg.updateIssueRequest,
        }),
        invalidatesTags: ["Issues"],
      }),
      getApiResults: build.query<GetApiResultsApiResponse, GetApiResultsApiArg>(
        {
          query: (queryArg) => ({
            url: `/api/results`,
            params: {
              tag: queryArg.tag,
              specId: queryArg.specId,
              specFile: queryArg.specFile,
              specName: queryArg.specName,
              environment: queryArg.environment,
              type: queryArg["type"],
              status: queryArg.status,
              from: queryArg["from"],
              to: queryArg.to,
              page: queryArg.page,
              limit: queryArg.limit,
            },
          }),
          providesTags: ["Results"],
        },
      ),
      getApiResultsByResultId: build.query<
        GetApiResultsByResultIdApiResponse,
        GetApiResultsByResultIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/results/${queryArg.resultId}` }),
        providesTags: ["Results"],
      }),
      getApiSpecsBySpecId: build.query<
        GetApiSpecsBySpecIdApiResponse,
        GetApiSpecsBySpecIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/specs/${queryArg.specId}` }),
        providesTags: ["Specs"],
      }),
      postApiAssumptions: build.mutation<
        PostApiAssumptionsApiResponse,
        PostApiAssumptionsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/assumptions`,
          method: "POST",
          body: queryArg.createAssumptionRequest,
        }),
        invalidatesTags: ["Assumptions"],
      }),
      patchApiAssumptionsByAssumptionId: build.mutation<
        PatchApiAssumptionsByAssumptionIdApiResponse,
        PatchApiAssumptionsByAssumptionIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/assumptions/${queryArg.assumptionId}`,
          method: "PATCH",
          body: queryArg.updateAssumptionRequest,
        }),
        invalidatesTags: ["Assumptions"],
      }),
      patchApiResultErrorsByResultErrorIdAssignIssue: build.mutation<
        PatchApiResultErrorsByResultErrorIdAssignIssueApiResponse,
        PatchApiResultErrorsByResultErrorIdAssignIssueApiArg
      >({
        query: (queryArg) => ({
          url: `/api/result-errors/${queryArg.resultErrorId}/assign-issue`,
          method: "PATCH",
          body: queryArg.assignIssueRequest,
        }),
        invalidatesTags: ["Result Errors"],
      }),
      patchApiResultErrorsByResultErrorIdReview: build.mutation<
        PatchApiResultErrorsByResultErrorIdReviewApiResponse,
        PatchApiResultErrorsByResultErrorIdReviewApiArg
      >({
        query: (queryArg) => ({
          url: `/api/result-errors/${queryArg.resultErrorId}/review`,
          method: "PATCH",
        }),
        invalidatesTags: ["Result Errors"],
      }),
      patchApiResultErrorsBulkReview: build.mutation<
        PatchApiResultErrorsBulkReviewApiResponse,
        PatchApiResultErrorsBulkReviewApiArg
      >({
        query: (queryArg) => ({
          url: `/api/result-errors/bulk-review`,
          method: "PATCH",
          body: queryArg.bulkReviewRequest,
        }),
        invalidatesTags: ["Result Errors"],
      }),
      getApiExecutionsByExecutionId: build.query<
        GetApiExecutionsByExecutionIdApiResponse,
        GetApiExecutionsByExecutionIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/executions/${queryArg.executionId}`,
        }),
        providesTags: ["Executions"],
      }),
      postApiJsonReport: build.mutation<
        PostApiJsonReportApiResponse,
        PostApiJsonReportApiArg
      >({
        query: (queryArg) => ({
          url: `/api/json-report`,
          method: "POST",
          body: queryArg.jsonReportRequest,
        }),
        invalidatesTags: ["Reports"],
      }),
      getApiStatus: build.query<GetApiStatusApiResponse, GetApiStatusApiArg>({
        query: () => ({ url: `/api/status` }),
        providesTags: ["System"],
      }),
      postApiUsersSignup: build.mutation<
        PostApiUsersSignupApiResponse,
        PostApiUsersSignupApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/signup`,
          method: "POST",
          body: queryArg.userSignupRequest,
        }),
        invalidatesTags: ["Authentication"],
      }),
      postApiUsersLogin: build.mutation<
        PostApiUsersLoginApiResponse,
        PostApiUsersLoginApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/login`,
          method: "POST",
          body: queryArg.userLoginRequest,
        }),
        invalidatesTags: ["Authentication"],
      }),
      postApiUsersRefreshToken: build.mutation<
        PostApiUsersRefreshTokenApiResponse,
        PostApiUsersRefreshTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/refresh-token`,
          method: "POST",
          body: queryArg.refreshTokenRequest,
        }),
        invalidatesTags: ["Authentication"],
      }),
      getApiUsersByUserId: build.query<
        GetApiUsersByUserIdApiResponse,
        GetApiUsersByUserIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/${queryArg.userId}`,
          headers: {
            authorization: queryArg.authorization,
          },
        }),
        providesTags: ["Users"],
      }),
      patchApiUsersByUserId: build.mutation<
        PatchApiUsersByUserIdApiResponse,
        PatchApiUsersByUserIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/${queryArg.userId}`,
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
export type GetApiApiResponse = unknown;
export type GetApiApiArg = void;
export type GetApiIssuesApiResponse = /** status 200 List of issues */ Issue[];
export type GetApiIssuesApiArg = {
  category?: string;
  name?: string;
  page?: number;
  limit?: number;
};
export type PostApiIssuesApiResponse =
  /** status 201 Issue created successfully */ Issue;
export type PostApiIssuesApiArg = {
  createIssueRequest: CreateIssueRequest;
};
export type GetApiIssuesByIssueIdApiResponse =
  /** status 200 Issue details */ Issue;
export type GetApiIssuesByIssueIdApiArg = {
  issueId: number;
};
export type PatchApiIssuesByIssueIdApiResponse =
  /** status 200 Issue updated successfully */ Issue;
export type PatchApiIssuesByIssueIdApiArg = {
  issueId: number;
  updateIssueRequest: UpdateIssueRequest;
};
export type GetApiResultsApiResponse =
  /** status 200 List of results */ Result[];
export type GetApiResultsApiArg = {
  tag?: string;
  specId?: string;
  specFile?: string;
  specName?: string;
  environment?: string;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};
export type GetApiResultsByResultIdApiResponse =
  /** status 200 Result details */ Result;
export type GetApiResultsByResultIdApiArg = {
  resultId: string;
};
export type GetApiSpecsBySpecIdApiResponse =
  /** status 200 Spec details */ Spec;
export type GetApiSpecsBySpecIdApiArg = {
  specId: string;
};
export type PostApiAssumptionsApiResponse =
  /** status 201 Assumption created successfully */ Assumption;
export type PostApiAssumptionsApiArg = {
  createAssumptionRequest: CreateAssumptionRequest;
};
export type PatchApiAssumptionsByAssumptionIdApiResponse =
  /** status 200 Assumption updated successfully */ Assumption;
export type PatchApiAssumptionsByAssumptionIdApiArg = {
  assumptionId: string;
  updateAssumptionRequest: UpdateAssumptionRequest;
};
export type PatchApiResultErrorsByResultErrorIdAssignIssueApiResponse =
  /** status 200 Issue assigned successfully */ SuccessResponse;
export type PatchApiResultErrorsByResultErrorIdAssignIssueApiArg = {
  resultErrorId: string;
  assignIssueRequest: AssignIssueRequest;
};
export type PatchApiResultErrorsByResultErrorIdReviewApiResponse =
  /** status 200 Result error reviewed successfully */ SuccessResponse;
export type PatchApiResultErrorsByResultErrorIdReviewApiArg = {
  resultErrorId: string;
};
export type PatchApiResultErrorsBulkReviewApiResponse =
  /** status 200 Bulk review completed successfully */ SuccessResponse;
export type PatchApiResultErrorsBulkReviewApiArg = {
  bulkReviewRequest: BulkReviewRequest;
};
export type GetApiExecutionsByExecutionIdApiResponse =
  /** status 200 Execution details */ Execution;
export type GetApiExecutionsByExecutionIdApiArg = {
  executionId: string;
};
export type PostApiJsonReportApiResponse =
  /** status 201 Report processed successfully */ JsonReportResponse;
export type PostApiJsonReportApiArg = {
  jsonReportRequest: JsonReportRequest;
};
export type GetApiStatusApiResponse =
  /** status 200 Server status */ StatusResponse;
export type GetApiStatusApiArg = void;
export type PostApiUsersSignupApiResponse =
  /** status 201 User created successfully */ User;
export type PostApiUsersSignupApiArg = {
  userSignupRequest: UserSignupRequest;
};
export type PostApiUsersLoginApiResponse =
  /** status 200 Login successful - returns user data, access token, and refresh token */ UserLoginResponse;
export type PostApiUsersLoginApiArg = {
  userLoginRequest: UserLoginRequest;
};
export type PostApiUsersRefreshTokenApiResponse =
  /** status 200 Token refresh successful - returns new access and refresh tokens */ UserLoginResponse;
export type PostApiUsersRefreshTokenApiArg = {
  refreshTokenRequest: RefreshTokenRequest;
};
export type GetApiUsersByUserIdApiResponse =
  /** status 200 User details */ User;
export type GetApiUsersByUserIdApiArg = {
  userId: number;
  /** Bearer JWT token */
  authorization: string;
};
export type PatchApiUsersByUserIdApiResponse =
  /** status 200 User updated successfully */ User;
export type PatchApiUsersByUserIdApiArg = {
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
  useGetApiQuery,
  useGetApiIssuesQuery,
  usePostApiIssuesMutation,
  useGetApiIssuesByIssueIdQuery,
  usePatchApiIssuesByIssueIdMutation,
  useGetApiResultsQuery,
  useGetApiResultsByResultIdQuery,
  useGetApiSpecsBySpecIdQuery,
  usePostApiAssumptionsMutation,
  usePatchApiAssumptionsByAssumptionIdMutation,
  usePatchApiResultErrorsByResultErrorIdAssignIssueMutation,
  usePatchApiResultErrorsByResultErrorIdReviewMutation,
  usePatchApiResultErrorsBulkReviewMutation,
  useGetApiExecutionsByExecutionIdQuery,
  usePostApiJsonReportMutation,
  useGetApiStatusQuery,
  usePostApiUsersSignupMutation,
  usePostApiUsersLoginMutation,
  usePostApiUsersRefreshTokenMutation,
  useGetApiUsersByUserIdQuery,
  usePatchApiUsersByUserIdMutation,
} = injectedRtkApi;
