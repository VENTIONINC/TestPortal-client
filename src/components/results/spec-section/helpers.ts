import { User } from '@/redux/apis/generatedApi';
import { ResultExecution } from '@/types';

export const serializeExecution = (execution: ResultExecution, user: User) => {
  const { reportPortalEnabled, reportPortalUrl, monitoringPortalEnabled, monitoringPortalUrl } = user;
  const { id, createdAt, updatedAt, environment, type, name, version } = execution;

  return {
    id,
    createdAt,
    updatedAt,
    environment,
    type,
    name,
    version,
    reportPortalUrl,
    monitoringPortalUrl,
    monitoringPortalEnabled,
    reportPortalEnabled,
  };
};
