// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

type GetMonitoringLinkType = (params: { startTime: string; duration: number; env: string; url: string }) => string;

export const getMonitoringLink: GetMonitoringLinkType = ({ env, startTime, duration, url }) => {
  const start = new Date(startTime).getTime();
  const end = start + duration;

  const searchParams = new URLSearchParams({
    query: `env:${env}`,
    agg_m: 'count',
    agg_m_source: 'base',
    agg_t: 'count',
    cols: 'core_service,core_resource_name,log_duration,log_http.method,log_http.status_code',
    fromUser: 'false',
    historicalData: 'true',
    messageDisplay: 'inline',
    query_translation_version: 'v0',
    sort: 'desc',
    sort_by: 'time',
    sort_order: 'asc',
    spanType: 'all',
    storage: 'hot',
    view: 'spans',
    start: start.toString(),
    end: end.toString(),
    paused: 'true',
  });

  return `${url}?${searchParams.toString()}`;
};
