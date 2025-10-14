import { BaseResult } from '@/types';

export interface ResultsExecutionCardProps {
  results: BaseResult[];
  environment: string;
  type: string;
  name: string;
  provider: string;
  monitoringPortalUrl: string;
  reportPortalUrl: string;
  reportPortalEnabled: boolean;
  monitoringPortalEnabled: boolean;
}
