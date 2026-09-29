// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

export type DashboardPeriod = '1' | 'yesterday' | string;

const formatUtcDate = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getDashboardDateRange = (period: DashboardPeriod, now = new Date()) => {
  if (period !== '1' && period !== 'yesterday') return undefined;

  const date = new Date(now);
  if (period === 'yesterday') date.setUTCDate(date.getUTCDate() - 1);
  const dateString = formatUtcDate(date);

  return { dateFrom: dateString, dateTo: dateString };
};
