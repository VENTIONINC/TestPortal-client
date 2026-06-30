// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { retry } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

import type { RootState } from '@/redux/store';
import { logout, refreshTokenSuccess } from '@/redux/slices/auth';

import { TAGS } from './tags';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const accessToken = (getState() as RootState).auth.accessToken;

    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`);
    }

    return headers;
  },
});

const shouldRetry = (status: FetchBaseQueryError['status']) => {
  if (status === 'TIMEOUT_ERROR' || status === 'FETCH_ERROR' || status === 'PARSING_ERROR') {
    return true;
  }

  return typeof status === 'number' && (status >= 500 || status === 429);
};

const timeoutOnlyBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && !shouldRetry(result.error.status)) {
    return retry.fail(result.error, result.meta);
  }

  return result;
};

const baseQuery = retry(timeoutOnlyBaseQuery, {
  maxRetries: 2,
  backoff: async (attempt) => {
    await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
  },
});

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken;

    const isRefreshRequest = typeof args === 'object' && 'url' in args && args.url === '/api/v2/users/refresh-token';

    if (refreshToken && !isRefreshRequest) {
      const refreshResult = await baseQuery(
        {
          url: '/api/v2/users/refresh-token',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions,
      );

      if (refreshResult.data && !refreshResult.error) {
        const responseData = refreshResult.data as {
          user: unknown;
          accessToken: string;
          refreshToken: string;
        };

        api.dispatch(
          refreshTokenSuccess({
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
          }),
        );

        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  baseQuery: baseQueryWithAuth,
  endpoints: () => ({}),
  reducerPath: 'baseApi',
  tagTypes: Object.values(TAGS),
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 60 * 5,
});
