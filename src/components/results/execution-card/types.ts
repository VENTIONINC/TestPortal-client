import { BaseResult } from '@/types';

export interface ResultsExecutionCardProps {
  results: BaseResult[];
  onContextMenu: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onResultContextMenu: (
    evt: React.MouseEvent<HTMLButtonElement>,
    result: { id: string; specName: string; projectId: string; retry: number },
  ) => void;
  environment: string;
  type: string;
  name: string;
  provider: string;
  monitoringPortalUrl: string;
  reportPortalUrl: string;
  reportPortalEnabled: boolean;
  monitoringPortalEnabled: boolean;
  specName: string;
  projectId: string;
}
