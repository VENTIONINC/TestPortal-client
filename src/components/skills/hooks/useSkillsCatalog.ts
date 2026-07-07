// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useGetApiV2SkillsQuery } from '@/redux/apis/generatedApi';

export const useSkillsCatalog = () => {
  const { data, isLoading, isFetching, error } = useGetApiV2SkillsQuery();
  const skills = data?.skills ?? [];
  const isInitialLoading = isLoading && skills.length === 0;

  return {
    skills,
    isLoading,
    isFetching,
    isInitialLoading,
    isRefetching: isFetching && !isInitialLoading,
    error,
    isEmpty: !isInitialLoading && !error && skills.length === 0,
  };
};
