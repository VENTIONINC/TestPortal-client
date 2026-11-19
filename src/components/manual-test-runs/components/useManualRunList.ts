// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';

import { useGetApiV2ManualTestRunsQuery } from '@/redux/apis/extendedApi';
import { useGetApiV2TestScenariosQuery } from '@/redux/apis/generatedApi';

import { MANUAL_RUN_PERIOD, MANUAL_RUN_SHOW, MANUAL_RUN_STATUS } from '../constants';

const RUN_PAGE_SIZE = 20;
export const periods = [
  [MANUAL_RUN_PERIOD.RECENT, 'Recent'],
  [MANUAL_RUN_PERIOD.TODAY, 'Today'],
  [MANUAL_RUN_PERIOD.LAST_7_DAYS, 'Last 7 days'],
  [MANUAL_RUN_PERIOD.LAST_30_DAYS, 'Last 30 days'],
  [MANUAL_RUN_PERIOD.THIS_MONTH, 'This month'],
  [MANUAL_RUN_PERIOD.LAST_MONTH, 'Last month'],
  [MANUAL_RUN_PERIOD.ANY_TIME, 'Any time'],
  [MANUAL_RUN_PERIOD.CUSTOM, 'Custom range'],
] as const;

export const useManualRunList = (projectId: string) => {
  const [runSearch, setRunSearch] = useState('');
  const [show, setShow] = useState<(typeof MANUAL_RUN_SHOW)[keyof typeof MANUAL_RUN_SHOW]>(MANUAL_RUN_SHOW.IN_PROGRESS);
  const [period, setPeriod] = useState<(typeof periods)[number][0]>(MANUAL_RUN_PERIOD.RECENT);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const activeRunFilterCount =
    Number(show !== MANUAL_RUN_STATUS.IN_PROGRESS) + Number(period !== MANUAL_RUN_PERIOD.RECENT);
  const [runPage, setRunPage] = useState(1);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const listQuery = useGetApiV2ManualTestRunsQuery({
    projectId,
    page: runPage,
    limit: RUN_PAGE_SIZE,
    search: runSearch || undefined,
    show,
    period,
    timeZone,
    ...(period === MANUAL_RUN_PERIOD.CUSTOM ? { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined } : {}),
  });
  const completedCountQuery = useGetApiV2ManualTestRunsQuery(
    {
      projectId,
      page: 1,
      limit: 1,
      search: runSearch || undefined,
      show: MANUAL_RUN_STATUS.COMPLETED,
      period,
      timeZone,
      ...(period === MANUAL_RUN_PERIOD.CUSTOM ? { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined } : {}),
    },
    { skip: show !== MANUAL_RUN_SHOW.ALL },
  );
  const inProgressCountQuery = useGetApiV2ManualTestRunsQuery(
    {
      projectId,
      page: 1,
      limit: 1,
      search: runSearch || undefined,
      show: MANUAL_RUN_STATUS.IN_PROGRESS,
      period,
      timeZone,
      ...(period === MANUAL_RUN_PERIOD.CUSTOM ? { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined } : {}),
    },
    { skip: show !== MANUAL_RUN_SHOW.ALL },
  );
  const allRunsQuery = useGetApiV2ManualTestRunsQuery({
    projectId,
    page: 1,
    limit: 1,
    show: MANUAL_RUN_SHOW.ALL,
    period: MANUAL_RUN_PERIOD.ANY_TIME,
    timeZone,
  });
  const noRunsYet = !allRunsQuery.isLoading && !allRunsQuery.error && allRunsQuery.currentData?.total === 0;
  const scenarioCountQuery = useGetApiV2TestScenariosQuery({ projectId, page: 1, limit: 1 });
  const listedRuns = useMemo(() => listQuery.currentData?.runs ?? [], [listQuery.currentData?.runs]);
  const noRunsInProgress =
    Boolean(allRunsQuery.currentData?.total) &&
    !runSearch &&
    show === MANUAL_RUN_STATUS.IN_PROGRESS &&
    period === MANUAL_RUN_PERIOD.RECENT &&
    listedRuns.length === 0;
  const completedGroups = useMemo(() => {
    const groups = new Map<string, typeof listedRuns>();
    for (const item of listedRuns.filter((candidate) => candidate.status === MANUAL_RUN_STATUS.COMPLETED)) {
      const group = item.completedDay ?? 'Completed';
      groups.set(group, [...(groups.get(group) ?? []), item]);
    }
    return [...groups.entries()];
  }, [listedRuns]);
  const activeRuns = listedRuns.filter((item) => item.status === MANUAL_RUN_STATUS.IN_PROGRESS);
  const completedCount =
    show === MANUAL_RUN_SHOW.ALL ? completedCountQuery.currentData?.total : listQuery.currentData?.total;
  const inProgressCount =
    show === MANUAL_RUN_SHOW.ALL ? inProgressCountQuery.currentData?.total : listQuery.currentData?.total;
  useEffect(() => {
    setRunPage(1);
  }, [runSearch, show, period, dateFrom, dateTo]);

  return {
    listQuery,
    allRunsQuery,
    scenarioCountQuery,
    noRunsYet,
    listedRuns,
    noRunsInProgress,
    runSearch,
    setRunSearch,
    show,
    setShow,
    period,
    setPeriod,
    setDateFrom,
    setDateTo,
    dateFrom,
    dateTo,
    activeRunFilterCount,
    runPage,
    setRunPage,
    completedGroups,
    activeRuns,
    completedCount,
    inProgressCount,
  };
};
