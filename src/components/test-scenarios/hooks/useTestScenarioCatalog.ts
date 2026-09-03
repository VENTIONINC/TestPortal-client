// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo, useState } from 'react';

import { useGetApiV2TestScenariosQuery } from '@/redux/apis/generatedApi';

import { TEST_SCENARIO_PAGE_LIMIT } from '../constants';
import { mapTestScenariosToSummaries } from '../utils';

export const useTestScenarioCatalog = (projectId: string) => {
  const [page, setPage] = useState(1);
  const queryArgs = useMemo(
    () => ({ projectId, page, limit: TEST_SCENARIO_PAGE_LIMIT }),
    [page, projectId],
  );
  const { currentData, isLoading: isQueryLoading, isFetching, error } = useGetApiV2TestScenariosQuery(queryArgs);

  const scenarios = useMemo(
    () => mapTestScenariosToSummaries(currentData?.scenarios ?? []),
    [currentData?.scenarios],
  );
  const pagination = currentData
    ? {
        page: currentData.page,
        limit: currentData.limit,
        total: currentData.total,
        totalPages: currentData.totalPages,
      }
    : {
        page,
        limit: TEST_SCENARIO_PAGE_LIMIT,
        total: 0,
        totalPages: 0,
      };
  const isLoading = isQueryLoading || (isFetching && !currentData);
  const onPageChange = useCallback((nextPage: number) => setPage(nextPage), []);

  return {
    scenarios,
    pagination,
    isLoading,
    error,
    onPageChange,
  };
};

