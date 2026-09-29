import { generatedApi as api } from "./generatedApi";
export const addTagTypes = ["Results"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getResultDetailWithRelatedScenarios: build.query<
        GetResultDetailWithRelatedScenariosApiResponse,
        GetResultDetailWithRelatedScenariosApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/results/${queryArg.resultId}`,
          params: {
            projectId: queryArg.projectId,
          },
        }),
        providesTags: ["Results"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as generatedResultDetailApi };
export type GetResultDetailWithRelatedScenariosApiResponse =
  /** status 200 Result details */ ResultDetail;
export type GetResultDetailWithRelatedScenariosApiArg = {
  resultId: string;
  /** Project ID to verify ownership of the result */
  projectId: string;
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
export type RelatedTestScenarioSummary = {
  id: string;
  title: string;
  details: string | null;
  /** Current generated Test Scenario Markdown returned as JSON text */
  contentMd: string;
};
export type ResultDetail = Result & {
  relatedTestScenarios: RelatedTestScenarioSummary[];
};
export type ErrorResponse = {
  error: string;
};
export const {
  useGetResultDetailWithRelatedScenariosQuery,
  useLazyGetResultDetailWithRelatedScenariosQuery,
} = injectedRtkApi;
