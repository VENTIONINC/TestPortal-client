import { ResultErrorAssumption } from '@/types';
import { ConfirmAssumptionRequest, CreateAssumptionRequest } from '@/types/apis';

import { baseApi } from './baseApi';
import { TAGS } from './tags';

export const assumptionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createAssumption: build.mutation<ResultErrorAssumption, CreateAssumptionRequest>({
      query: (body) => ({
        url: '/api/v1/assumptions',
        method: 'POST',
        body,
      }),
      invalidatesTags: [TAGS.Result],
    }),
    confirmAssumption: build.mutation<ResultErrorAssumption, ConfirmAssumptionRequest>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/assumptions/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [TAGS.Result],
    }),
  }),
  overrideExisting: true,
});

export const { useCreateAssumptionMutation, useConfirmAssumptionMutation } = assumptionsApi;
