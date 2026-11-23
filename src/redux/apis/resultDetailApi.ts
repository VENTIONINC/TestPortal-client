import { generatedResultDetailApi } from './generatedResultDetailApi';
import { resultSpecCoverageTag } from './extendedApi';

export const resultDetailApi = generatedResultDetailApi.enhanceEndpoints({
  addTagTypes: ['ResultSpecCoverage'],
  endpoints: {
    getResultDetailWithRelatedScenarios: {
      providesTags: (_result, _error, arg) => [
        'Results',
        resultSpecCoverageTag(arg.projectId),
      ],
    },
  },
});

export type {
  GetResultDetailWithRelatedScenariosApiArg,
  GetResultDetailWithRelatedScenariosApiResponse,
  RelatedTestScenarioSummary,
  ResultDetail,
} from './generatedResultDetailApi';

export const {
  useGetResultDetailWithRelatedScenariosQuery,
  useLazyGetResultDetailWithRelatedScenariosQuery,
} = resultDetailApi;
