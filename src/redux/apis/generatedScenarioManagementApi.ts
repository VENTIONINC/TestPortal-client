import { generatedApi as api } from "./generatedApi";
export const addTagTypes = ["Test Scenarios"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiV2TestScenariosForResultLinkManagement: build.query<
        GetApiV2TestScenariosForResultLinkManagementApiResponse,
        GetApiV2TestScenariosForResultLinkManagementApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v2/test-scenarios`,
          params: {
            projectId: queryArg.projectId,
            page: queryArg.page,
            limit: queryArg.limit,
            search: queryArg.search,
            createdById: queryArg.createdById,
            sort: queryArg.sort,
          },
        }),
        providesTags: ["Test Scenarios"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as generatedScenarioManagementApi };
export type GetApiV2TestScenariosForResultLinkManagementApiResponse =
  /** status 200 Paginated test scenarios */ TestScenarioListResponse;
export type GetApiV2TestScenariosForResultLinkManagementApiArg = {
  projectId: string;
  page?: number;
  limit?: number;
  search?: string;
  createdById?: string;
  sort?: "recently_created" | "recently_updated" | "title_asc";
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
  scenarioKey: string | null;
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
export type ErrorResponse = {
  error: string;
};
export const {
  useGetApiV2TestScenariosForResultLinkManagementQuery,
  useLazyGetApiV2TestScenariosForResultLinkManagementQuery,
} = injectedRtkApi;
