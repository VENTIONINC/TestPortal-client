import { BaseResult, ResultExecution } from '@/types';

export interface DateFilterConfig {
  yyyy_mm_dd: string;
  stats: string[];
  isActive: boolean;
  display: string;
}

export interface SerializedExecution {
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
}

export interface ResultSpecSectionViewProps {
  specKey: string;
  specFile: string;
  specTitle: string;
  specTags?: string[];
  dateFilters: DateFilterConfig[];
  filteredExecutions: {
    execution: ResultExecution;
    results: BaseResult[];
    serialized: SerializedExecution;
  }[];
  projectId: string;
  onDateToggle: (day: { yyyy_mm_dd: string }) => void;
  onTagClick: (tag: string) => void;
  onExecutionContextMenu: (
    evt: React.MouseEvent<HTMLButtonElement>,
    execution: { id: string; name: string; projectId: string }
  ) => void;
  onResultContextMenu: (
    evt: React.MouseEvent<HTMLButtonElement>,
    result: { id: string; retry: number; specName: string; projectId: string }
  ) => void;
}
