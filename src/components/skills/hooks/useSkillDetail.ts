// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { skipToken } from '@reduxjs/toolkit/query';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useParams } from 'react-router';

import { type GetApiV2SkillsByIdApiArg, useGetApiV2SkillsByIdQuery } from '@/redux/apis/generatedApi';

const getErrorStatus = (error: unknown) => {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as FetchBaseQueryError).status;
  }

  return undefined;
};

export const useSkillDetail = () => {
  const { id } = useParams<{ id: string }>();
  const skillId = id?.trim() ?? '';
  const queryArg = skillId ? ({ id: skillId as GetApiV2SkillsByIdApiArg['id'] } as const) : skipToken;
  const { data, isLoading, isFetching, error } = useGetApiV2SkillsByIdQuery(queryArg);
  const isInitialLoading = isLoading && !data;

  return {
    skillId,
    skill: data,
    metadata: data?.metadata,
    content: data?.content ?? '',
    isLoading,
    isFetching,
    isInitialLoading,
    isRefetching: isFetching && !isInitialLoading,
    error,
    isNotFound: getErrorStatus(error) === 404,
    hasInvalidSkillId: !skillId,
  };
};
