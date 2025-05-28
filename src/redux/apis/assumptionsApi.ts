import { ResultErrorAssumption } from '@/types';
import { ConfirmAssumptionRequest, CreateAssumptionRequest } from '@/types/apis';

import { baseApi } from './baseApi';
import { TAGS } from './tags';

export const assumptionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createAssumption: build.mutation<ResultErrorAssumption, CreateAssumptionRequest>({
      query: (body) => ({
        url: 'assumptions',
        method: 'POST',
        body,
      }),
    }),
    confirmAssumption: build.mutation<ResultErrorAssumption, ConfirmAssumptionRequest>({
      query: ({ id, ...body }) => ({
        url: `assumptions/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [TAGS.Result],
    }),
  }),
  overrideExisting: true,
});

export const { useCreateAssumptionMutation, useConfirmAssumptionMutation } = assumptionsApi;
