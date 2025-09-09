import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

import type { RootState } from '@/redux/store';
import { logout, refreshTokenSuccess } from '@/redux/slices/auth';

import { TAGS } from './tags';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const accessToken = (getState() as RootState).auth.accessToken;

    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`);
    }

    return headers;
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
  keepUnusedDataFor: 60 * 5,
});
