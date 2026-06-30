// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { User } from '@/redux/apis/generatedApi';
import { ResultExecution } from '@/types';

type SerializedExecution = (
  execution: ResultExecution,
  user: User,
) => {
  id: string;
  createdAt: string;
  updatedAt: string;
  environment: string;
  type: string;
  name: string;
  provider: string;
  reportPortalUrl: string;
  monitoringPortalUrl: string;
  reportPortalEnabled: boolean;
  monitoringPortalEnabled: boolean;
};

export const serializeExecution: SerializedExecution = (execution, user) => {
  const { reportPortalEnabled, reportPortalUrl, monitoringPortalEnabled, monitoringPortalUrl } = user;
  const { id, createdAt, updatedAt, environment, type, name, provider } = execution;

  return {
    id,
    createdAt,
    updatedAt,
    environment,
    type,
    name,
    provider,
    reportPortalUrl: reportPortalUrl ?? '',
    monitoringPortalUrl: monitoringPortalUrl ?? '',
    monitoringPortalEnabled,
    reportPortalEnabled,
  };
};

export const sanitizeFileName = (fileName: string) => {
  if (fileName === 'unknown' || fileName.trim() === '') {
    return '';
  }

  return fileName;
};
