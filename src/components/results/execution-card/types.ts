import { BaseResult } from '@/types';

export interface ResultsExecutionCardProps {
  results: BaseResult[];
  environment: string;
  type: string;
  name: string;
  version: string;
  monitoringPortalUrl: string;
  reportPortalUrl: string;
  reportPortalEnabled: boolean;
  monitoringPortalEnabled: boolean;
}
