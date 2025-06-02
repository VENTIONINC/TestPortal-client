import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { TAGS } from './tags';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
});

export const baseApi = createApi({
  baseQuery: baseQuery,
  endpoints: () => ({}),
  reducerPath: 'baseApi',
  tagTypes: Object.values(TAGS),
  keepUnusedDataFor: 60 * 5,
});
