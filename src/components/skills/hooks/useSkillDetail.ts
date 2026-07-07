// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { skipToken } from '@reduxjs/toolkit/query';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useParams } from 'react-router';

import { type GetApiV2SkillsByNameApiArg, useGetApiV2SkillsByNameQuery } from '@/redux/apis/generatedApi';

const getErrorStatus = (error: unknown) => {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as FetchBaseQueryError).status;
  }

  return undefined;
};

export const useSkillDetail = () => {
  const { name } = useParams<{ name: string }>();
  const skillName = name ? decodeURIComponent(name).trim() : '';
  const queryArg = skillName ? ({ name: skillName as GetApiV2SkillsByNameApiArg['name'] } as const) : skipToken;
  const { data, isLoading, isFetching, error } = useGetApiV2SkillsByNameQuery(queryArg);
  const isInitialLoading = isLoading && !data;

  return {
    skillName,
    skill: data,
    metadata: data?.metadata,
    content: data?.content ?? '',
    isLoading,
    isFetching,
    isInitialLoading,
    isRefetching: isFetching && !isInitialLoading,
    error,
    isNotFound: getErrorStatus(error) === 404,
    hasInvalidSkillName: !skillName,
  };
};
