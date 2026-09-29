// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { useGetApiV2ManualTestRunsByRunIdQuery } from '@/redux/apis/extendedApi';
import type { ManualTestRunRead } from '@/redux/apis/generatedApi';

const getErrorStatus = (error: unknown) => {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as FetchBaseQueryError).status;
  }

  return undefined;
};

const isScopedRun = (run: ManualTestRunRead | undefined, projectId: string, runId: string) =>
  run?.id === runId && run.projectId === projectId;

export interface UseManualTestRunDetailResult {
  run?: ManualTestRunRead;
  isLoading: boolean;
  isUnavailable: boolean;
  isError: boolean;
  isNotFound: boolean;
  refetch: () => Promise<ManualTestRunRead | undefined>;
  setPersistedRun: Dispatch<SetStateAction<ManualTestRunRead | undefined>>;
}

export const useManualTestRunDetail = (projectId: string, runId: string): UseManualTestRunDetailResult => {
  const query = useGetApiV2ManualTestRunsByRunIdQuery({ projectId, runId });
  const scopeKey = `${projectId}:${runId}`;
  const [persistedEntry, setPersistedEntry] = useState<{ scopeKey: string; run?: ManualTestRunRead }>({ scopeKey });
  const isNotFound = getErrorStatus(query.error) === 404;
  const scopedData = isScopedRun(query.currentData, projectId, runId)
    ? query.currentData
    : isScopedRun(query.data, projectId, runId)
      ? query.data
      : undefined;

  const setPersistedRun = useCallback<Dispatch<SetStateAction<ManualTestRunRead | undefined>>>(
    (update) => {
      setPersistedEntry((previous) => {
        if (previous.scopeKey !== scopeKey) return previous;
        const run = typeof update === 'function' ? update(previous.run) : update;
        if (run && !isScopedRun(run, projectId, runId)) return previous;
        return { scopeKey, run };
      });
    },
    [projectId, runId, scopeKey],
  );

  useEffect(() => {
    setPersistedEntry((previous) => (previous.scopeKey === scopeKey ? previous : { scopeKey }));
  }, [scopeKey]);

  useEffect(() => {
    if (!scopedData) {
      if (isNotFound) setPersistedRun(undefined);
      return;
    }

    setPersistedRun(scopedData);
  }, [isNotFound, scopedData, setPersistedRun]);

  const refetch = useCallback(async () => {
    const result = await query.refetch();
    const refreshed = 'data' in result && isScopedRun(result.data, projectId, runId) ? result.data : undefined;
    if (refreshed) setPersistedRun(refreshed);
    return refreshed;
  }, [projectId, query, runId, setPersistedRun]);

  const run = isNotFound ? undefined : persistedEntry.scopeKey === scopeKey ? persistedEntry.run ?? scopedData : scopedData;
  const isLoading = !run && Boolean(query.isLoading || query.isFetching);

  return {
    run,
    isLoading,
    isUnavailable: !run && !isLoading && (isNotFound || !query.error),
    isError: !run && !isLoading && Boolean(query.error) && !isNotFound,
    isNotFound,
    refetch,
    setPersistedRun,
  };
};
