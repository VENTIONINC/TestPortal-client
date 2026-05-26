// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { BaseResult, ResultExecution } from '@/types';

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

export interface SectionDay {
  yyyy_mm_dd: string;
  stats: string[];
  isActive: boolean;
  isVisible: boolean;
  display: string;
  results: BaseResult[];
  execution: ResultExecution | undefined;
  serialized: SerializedExecution | undefined;
}

export interface ResultSpecSectionViewProps {
  specKey: string;
  specFile: string;
  specTitle: string;
  specTags?: string[];
  sectionDays: SectionDay[];
  projectId: string;
  handleDateToggle: (day: { yyyy_mm_dd: string }) => void;
  onExecutionContextMenu: (
    evt: React.MouseEvent<HTMLButtonElement>,
    execution: { id: string; name: string; projectId: string },
  ) => void;
  onResultContextMenu: (
    evt: React.MouseEvent<HTMLButtonElement>,
    result: { id: string; retry: number; specName: string; projectId: string },
  ) => void;
  activeTags: string[];
  onToggleTag: (tag: string) => void;
}
