import { generatedScenarioManagementApi } from './generatedScenarioManagementApi';
import { scenarioCatalogTag } from './extendedApi';

export const scenarioManagementApi = generatedScenarioManagementApi.enhanceEndpoints({
  addTagTypes: ['ScenarioCatalog'],
  endpoints: {
    getApiV2TestScenariosForResultLinkManagement: {
      providesTags: (_result, _error, arg) => [scenarioCatalogTag(arg.projectId)],
    },
  },
});

export type {
  GetApiV2TestScenariosForResultLinkManagementApiArg,
  GetApiV2TestScenariosForResultLinkManagementApiResponse,
  TestScenarioListResponse,
  TestScenarioSummary,
} from './generatedScenarioManagementApi';

export const {
  useGetApiV2TestScenariosForResultLinkManagementQuery,
  useLazyGetApiV2TestScenariosForResultLinkManagementQuery,
} = scenarioManagementApi;
