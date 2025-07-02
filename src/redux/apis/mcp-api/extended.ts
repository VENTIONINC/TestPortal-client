import { generatedMcpApi } from './generated';

export const extendedMcpApi = generatedMcpApi.injectEndpoints({
  endpoints: () => ({}),
  overrideExisting: false,
});

export const { usePostApiChatMutation, useGetApiChatStatusQuery } = extendedMcpApi;
