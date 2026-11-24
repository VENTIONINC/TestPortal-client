// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { FormEvent } from 'react';

import type {
  DeleteApiV2TestScenarioFoldersByFolderIdApiResponse,
  PostApiV2TestScenarioFoldersRestorationApiArg,
  PostApiV2TestSuitesBySuiteIdMembershipChangesApiResponse,
  PostApiV2TestSuitesMovesApiResponse,
} from '@/redux/apis/generatedApi';

import type { TestScenarioContextMenuHandler } from '../../hooks/useTestScenarioContextMenu';
import type { TestScenarioPagination, TestScenarioSummary } from '../../types';
import type { ScenarioOperationReport } from '../../utils';

export type SuiteMembershipUndo = Pick<PostApiV2TestSuitesBySuiteIdMembershipChangesApiResponse, 'restoreData'> & {
  expectedMembershipRevision: number;
  expectedScenarioIds: string[];
  createdSuiteId?: string;
};
export type SuiteMoveUndo = Pick<PostApiV2TestSuitesMovesApiResponse, 'restoreData'> & {
  expectedSourceMembershipRevision: number;
  expectedDestinationMembershipRevision: number;
  expectedSourceScenarioIds: string[];
  expectedDestinationScenarioIds: string[];
  alreadyInDestination: string[];
};

export interface CatalogFolder {
  id: string;
  name: string;
  parentId: string | null;
  description?: string | null;
  position?: number;
  scenarioCount: number;
  children?: unknown[];
}

export interface CatalogSuite {
  id: string;
  membershipRevision: number;
  name: string;
  description: string | null;
  purpose: string | null;
  release: string | null;
  members?: Array<{ testScenarioId: string }>;
}

export interface TestScenarioCatalogViewProps {
  projectId?: string;
  organizationTab?: 'scenarios' | 'suites';
  scenarios: TestScenarioSummary[];
  pagination: TestScenarioPagination;
  projectScenarioCount: number;
  unfiledScenarioCount: number;
  pageSize: number;
  pageSizes: readonly number[];
  onPageSizeChange: (value: number) => void;
  isLoading: boolean;
  error?: unknown;
  onPageChange: (page: number) => void;
  onCreateScenario?: () => void;
  onScenarioActions?: TestScenarioContextMenuHandler;
  search: string;
  onSearchChange: (value: string) => void;
  sort?: 'scenarioKey' | 'title' | 'details' | 'folder' | 'createdBy' | 'createdAt' | 'updatedAt';
  sortDirection: 'asc' | 'desc';
  onSortChange: (value: TestScenarioCatalogViewProps['sort']) => void;
  onSortDirectionChange: (value: 'asc' | 'desc') => void;
  priority: string;
  priorityCounts?: Partial<Record<'high' | 'medium' | 'low', number | undefined>>;
  onPriorityChange: (value: string) => void;
  authorIds?: string[];
  /** @deprecated Use `authorIds` for multi-author filtering. */
  authorId?: string;
  onAuthorChange: (value: string[] | string) => void;
  authors: Array<{ id: string; name: string; email: string; scenarioCount?: number }>;
  authorsLoading: boolean;
  authorsError?: unknown;
  columnFilters: { scenarioKey: string; title: string; details: string; folder: string; createdBy: string };
  onColumnFilterChange: (field: keyof TestScenarioCatalogViewProps['columnFilters'], value: string) => void;
  scope: { kind: 'all' | 'unfiled' | 'folder' | 'suite'; id?: string };
  onScopeChange: (scope: { kind: 'all' | 'unfiled' | 'folder' | 'suite'; id?: string }) => void;
  folders: CatalogFolder[];
  suites: CatalogSuite[];
  organizationLoading: boolean;
  organizationError?: unknown;
  selectedIds: string[];
  allMatchingSelected: boolean;
  isExecutingOperation: boolean;
  isResolvingSelection: boolean;
  selectionError: string | null;
  selectAllMatching: () => Promise<void>;
  toggleSelected: (id: string) => void;
  selectOnlyScenario?: (id: string) => void;
  onRunSelected: (scenarioIds: string[]) => Promise<void>;
  onRunSuite: (suiteId: string) => Promise<void>;
  onMoveSelected: (folderId: string | null) => Promise<ScenarioOperationReport>;
  onMoveScenarioIds: (scenarioIds: string[], folderId: string | null) => Promise<ScenarioOperationReport>;
  restoreFolderDeletion: (
    restoreData: PostApiV2TestScenarioFoldersRestorationApiArg['body']['restoreData'],
  ) => Promise<void>;
  restoreScenarioFolders: (restoreData: NonNullable<ScenarioOperationReport['folderRestoreData']>) => Promise<void>;
  onSuiteOperationStart: () => void;
  onSuiteOperationComplete: (report: ScenarioOperationReport, selection: string[]) => void;
  onDeleteSelected: (scenarioIds: string[]) => Promise<ScenarioOperationReport>;
  removeSuiteMembership: (suiteId: string, scenarioIds: string[]) => Promise<SuiteMembershipUndo>;
  restoreSuiteMembership: (undo: SuiteMembershipUndo) => Promise<void>;
  moveSuiteMembership: (
    sourceSuiteId: string,
    destinationSuiteId: string,
    scenarioIds: string[],
  ) => Promise<SuiteMoveUndo>;
  restoreSuiteMove: (undo: SuiteMoveUndo) => Promise<void>;
  refreshSuiteData: (options?: { reportErrors?: boolean }) => Promise<void>;
  onReorderSuite: (suiteId: string, scenarioIds: string[]) => Promise<void>;
  onCreateFolder: (name: string, parentId: string | null, description?: string | null) => Promise<unknown>;
  onUpdateFolder: (
    folderId: string,
    body: { name?: string; parentId?: string | null; position?: number; description?: string | null },
  ) => Promise<unknown>;
  onDeleteFolder: (folderId: string) => Promise<DeleteApiV2TestScenarioFoldersByFolderIdApiResponse>;
  onCreateSuite: (body: {
    name: string;
    description?: string | null;
    purpose?: string | null;
    release?: string | null;
  }) => Promise<unknown>;
  onUpdateSuite: (
    suiteId: string,
    body: { name?: string; description?: string | null; purpose?: string | null; release?: string | null },
  ) => Promise<unknown>;
  onDeleteSuite: (suiteId: string) => Promise<void>;
}

export type CatalogFolderRow = CatalogFolder & { depth: number };

export type CatalogInlineEditor = 'suite' | 'rename-folder' | 'edit-suite';

export interface CatalogEditorForm {
  name: string;
  description: string;
  error: string | null;
  isSubmitting: boolean;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCancel: () => void;
}
