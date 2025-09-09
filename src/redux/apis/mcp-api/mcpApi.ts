import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_MCP_CLIENT_API,
});

export const mcpApi = createApi({
  baseQuery: baseQuery,
  endpoints: () => ({}),
  reducerPath: 'mcpApi',
  tagTypes: [],
});
