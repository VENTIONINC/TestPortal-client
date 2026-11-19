// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo, useEffect, useRef, useState, type DragEvent, type FormEvent } from 'react';
import { Box, Button, Grid, Heading, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import { FiPlus, FiX } from 'react-icons/fi';

import { Wrap } from '@/components/ui';
import type { DeleteApiV2TestScenarioFoldersByFolderIdApiResponse } from '@/redux/apis/generatedApi';
import { extractApiError } from '@/utils/apiErrors';

import { TestSuiteAddScenariosDialogContainer } from '../containers/TestSuiteAddScenariosDialogContainer';
import { scenarioOriginSearch } from '../scenarioOrigin';
import type { ScenarioOperationReport } from '../utils';
import { CatalogBulkActions, CatalogUndoNotification, type SuitePickerCompletion } from './catalog/CatalogBulkActions';
import {
  CatalogOrganizationDialog,
  DeleteSelectedScenariosDialog,
  RemoveScenariosFromSuiteDialog,
} from './catalog/CatalogDialogs';
import { CatalogFilters } from './catalog/CatalogFilters';
import { CatalogHeader } from './catalog/CatalogHeader';
import { CatalogSidebar } from './catalog/CatalogSidebar';
import { CatalogLoadError, CatalogPagination, CompactScenarioTable, SuiteScenarioTable } from './catalog/CatalogTables';
import type {
  CatalogEditor,
  CatalogEditorForm,
  CatalogFolder,
  CatalogSuite,
  SuiteMembershipUndo,
  SuiteMoveUndo,
  TestScenarioCatalogViewProps,
} from './catalog/types';
import { CATALOG_SCOPE, CATALOG_TAB, flattenFolders, SCENARIO_DRAG_MIME } from './catalog/utils';

export type { CatalogFolder, CatalogSuite, TestScenarioCatalogViewProps } from './catalog/types';

const getMembershipChangeMessage = (addedCount: number, removedCount: number, suiteName: string) => {
  if (addedCount > 0 && removedCount > 0)
    return `${addedCount} scenario${addedCount === 1 ? '' : 's'} added and ${removedCount} removed from ${suiteName}`;
  if (addedCount > 0) return `${addedCount} scenario${addedCount === 1 ? '' : 's'} added to ${suiteName}`;
  return `${removedCount} scenario${removedCount === 1 ? '' : 's'} removed from ${suiteName}`;
};

const getActionErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && ('data' in error || 'status' in error)) {
    return extractApiError(error as Parameters<typeof extractApiError>[0]);
  }
  return error instanceof Error ? error.message : String(error);
};

export const TestScenarioCatalogView = memo(function TestScenarioCatalogView({
  projectId,
  organizationTab,
  scenarios,
  pagination,
  projectScenarioCount,
  unfiledScenarioCount,
  isLoading,
  error,
  onPageChange,
  onCreateScenario,
  search,
  onSearchChange,
  sort,
  sortDirection,
  onSortChange,
  onSortDirectionChange,
  priority,
  priorityCounts,
  onPriorityChange,
  authorId,
  authorIds,
  onAuthorChange,
  authors,
  authorsLoading,
  authorsError,
  pageSize,
  pageSizes,
  onPageSizeChange,
  columnFilters,
  onColumnFilterChange,
  scope,
  onScopeChange,
  folders,
  suites,
  organizationLoading,
  organizationError,
  selectedIds,
  allMatchingSelected,
  isExecutingOperation,
  isResolvingSelection,
  selectionError,
  selectAllMatching,
  toggleSelected,
  onRunSelected,
  onRunSuite,
  onMoveScenarioIds,
  restoreFolderDeletion,
  restoreScenarioFolders,
  onSuiteOperationStart,
  onSuiteOperationComplete,
  onDeleteSelected,
  removeSuiteMembership,
  restoreSuiteMembership,
  moveSuiteMembership,
  restoreSuiteMove,
  refreshSuiteData,
  onReorderSuite,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onCreateSuite,
  onUpdateSuite,
  onDeleteSuite,
  onScenarioActions,
}: TestScenarioCatalogViewProps) {
  const isScenariosTab = organizationTab === CATALOG_TAB.scenarios;
  const isSuitesTab = organizationTab === CATALOG_TAB.suites;
  const currentProjectId = useRef(projectId);
  currentProjectId.current = projectId;
  const selectedAuthorIds = authorIds ?? (authorId ? [authorId] : []);
  const [createDialog, setCreateDialog] = useState<CatalogEditor | null>(null);
  const [targetFolder, setTargetFolder] = useState<CatalogFolder | null>(null);
  const [targetSuite, setTargetSuite] = useState<CatalogSuite | null>(null);
  const [moveParentId, setMoveParentId] = useState('');
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [isDraggingScenario, setIsDraggingScenario] = useState(false);
  const activeDrag = useRef<{ projectId: string; scenarioIds: string[] } | null>(null);
  const [operationFeedback, setOperationFeedback] = useState<string | null>(null);
  const handleRunCreationError = (error: unknown) => {
    if (currentProjectId.current !== projectId) return;
    const status =
      error && typeof error === 'object' && 'status' in error ? (error as { status: unknown }).status : undefined;
    const uncertain =
      status === 'FETCH_ERROR' ||
      status === 'TIMEOUT_ERROR' ||
      status === 'PARSING_ERROR' ||
      (typeof status === 'number' && status >= 500);
    setOperationFeedback(
      uncertain
        ? 'The server did not confirm run creation. A run may have been created; check Manual runs before trying again.'
        : `Could not start the run. ${getActionErrorMessage(error)}`,
    );
  };
  const handleRunSelected = async () => {
    if (!selectedIds.length || isExecutingOperation) return;
    setOperationFeedback(null);
    try {
      await onRunSelected([...selectedIds]);
    } catch (error) {
      handleRunCreationError(error);
    }
  };
  const [pendingSuiteUndo, setPendingSuiteUndo] = useState<
    | { kind: 'membership'; payload: SuiteMembershipUndo; message: string }
    | { kind: 'move'; payload: SuiteMoveUndo; message: string }
    | { kind: 'reorder'; payload: { suiteId: string; scenarioIds: string[] }; message: string }
    | null
  >(null);
  const [pendingFolderUndo, setPendingFolderUndo] = useState<
    | {
        kind: 'deletion';
        restoreData: DeleteApiV2TestScenarioFoldersByFolderIdApiResponse['restoreData'];
        message: string;
      }
    | { kind: 'move'; restoreData: NonNullable<ScenarioOperationReport['folderRestoreData']>; message: string }
    | null
  >(null);
  const [isUndoingSuiteChange, setIsUndoingSuiteChange] = useState(false);
  useEffect(() => {
    setPendingSuiteUndo(null);
  }, [projectId, organizationTab]);
  useEffect(() => {
    setPendingFolderUndo(null);
  }, [projectId]);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const scopeKey = `${scope.kind}:${scope.id ?? ''}`;
  useEffect(() => {
    setDeleteSelectedOpen(false);
  }, [scopeKey]);

  const [isAddingToSuite, setIsAddingToSuite] = useState(false);
  const [removeFromSuiteOpen, setRemoveFromSuiteOpen] = useState(false);
  const [removeFromSuiteError, setRemoveFromSuiteError] = useState<string | null>(null);
  const [isRemovingFromSuite, setIsRemovingFromSuite] = useState(false);
  const [addScenariosToSuiteOpen, setAddScenariosToSuiteOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createPurpose, setCreatePurpose] = useState('');
  const [createRelease, setCreateRelease] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [inlineFolderParentId, setInlineFolderParentId] = useState<string | null | undefined>(undefined);
  const [inlineFolderName, setInlineFolderName] = useState('');
  const [inlineFolderError, setInlineFolderError] = useState<string | null>(null);
  const folderRows = flattenFolders(folders);
  const showFolderColumn =
    scope.kind === CATALOG_SCOPE.all || scope.kind === CATALOG_SCOPE.suite || scope.kind === CATALOG_SCOPE.folder;
  const folderPathById = new Map<string, string>();
  const folderScenarioCounts = new Map<string, number>();
  folderRows.forEach((folder) => {
    const parentPath = folder.parentId ? folderPathById.get(folder.parentId) : undefined;
    folderPathById.set(folder.id, parentPath ? `${parentPath} / ${folder.name}` : folder.name);
    folderScenarioCounts.set(folder.id, folder.scenarioCount);
  });
  [...folderRows].reverse().forEach((folder) => {
    if (folder.parentId) {
      folderScenarioCounts.set(
        folder.parentId,
        (folderScenarioCounts.get(folder.parentId) ?? 0) + (folderScenarioCounts.get(folder.id) ?? 0),
      );
    }
  });
  const selectedFolder =
    scope.kind === CATALOG_SCOPE.folder ? folderRows.find((folder) => folder.id === scope.id) : undefined;
  const changeScope = (nextScope: typeof scope) => {
    if (pendingFolderUndo?.kind === 'deletion') setPendingFolderUndo(null);
    if (
      (scope.kind !== nextScope.kind || scope.id !== nextScope.id) &&
      !(scope.kind === 'suite' && nextScope.kind === 'suite')
    )
      setPendingSuiteUndo(null);
    onScopeChange(nextScope);
  };
  const startInlineFolder = (parentId: string | null) => {
    const parent = parentId ? folderRows.find((folder) => folder.id === parentId) : undefined;
    if (parent && parent.depth >= 2) return;
    setPendingFolderUndo(null);
    setInlineFolderParentId(parentId);
    setInlineFolderName('');
    setInlineFolderError(null);
  };
  const submitInlineFolder = async () => {
    const name = inlineFolderName.trim();
    if (!name) {
      setInlineFolderParentId(undefined);
      setInlineFolderName('');
      return;
    }
    setIsCreating(true);
    setInlineFolderError(null);
    try {
      const created = await onCreateFolder(name, inlineFolderParentId ?? null);
      if (created && typeof created === 'object' && 'id' in created && typeof created.id === 'string')
        changeScope({ kind: 'folder', id: created.id });
      setInlineFolderParentId(undefined);
      setInlineFolderName('');
    } catch (error) {
      setInlineFolderError(getActionErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  };
  const selectedSuite = scope.kind === CATALOG_SCOPE.suite ? suites.find((suite) => suite.id === scope.id) : undefined;
  const isSelectedSuiteEmpty = selectedSuite !== undefined && (selectedSuite.members?.length ?? 0) === 0;
  const handleRunSuite = async () => {
    if (!selectedSuite || isSelectedSuiteEmpty || isExecutingOperation) return;
    setOperationFeedback(null);
    try {
      await onRunSuite(selectedSuite.id);
    } catch (error) {
      handleRunCreationError(error);
    }
  };
  const isEmptySuitesState = isSuitesTab && !organizationLoading && !organizationError && suites.length === 0;
  const activeColumnFilters = (Object.entries(columnFilters) as Array<[keyof typeof columnFilters, string]>).filter(
    ([, value]) => value.trim().length > 0,
  );
  const selectedFolderPath = selectedFolder
    ? [...folderRows]
        .filter((folder) => {
          let current: (typeof folderRows)[number] | undefined = selectedFolder;
          while (current) {
            if (current.id === folder.id) return true;
            current = folderRows.find((candidate) => candidate.id === current?.parentId);
          }
          return false;
        })
        .sort((a, b) => a.depth - b.depth)
        .map((folder) => folder.name)
        .join(' / ')
    : undefined;
  const openCreateDialog = (kind: 'folder' | 'suite') => {
    setPendingFolderUndo(null);
    setCreateName('');
    setCreatePurpose('');
    setCreateRelease('');
    setCreateDescription('');
    setCreateError(null);
    setCreateDialog(kind);
  };
  const openEditFolderDialog = (folder: CatalogFolder | undefined = selectedFolder) => {
    if (!folder) return;
    setPendingFolderUndo(null);
    setTargetFolder(folder);
    setCreateName(folder.name);
    setCreatePurpose('');
    setCreateRelease('');
    setCreateDescription(folder.description ?? '');
    setCreateError(null);
    setCreateDialog('rename-folder');
  };
  const openEditSuiteDialog = () => {
    if (!selectedSuite) return;
    setTargetSuite(selectedSuite);
    setCreateName(selectedSuite.name);
    setCreatePurpose(selectedSuite.purpose ?? '');
    setCreateRelease(selectedSuite.release ?? '');
    setCreateDescription(selectedSuite.description ?? '');
    setCreateError(null);
    setCreateDialog('edit-suite');
  };
  const openFolderActionDialog = (kind: 'move-folder' | 'delete-folder', folder: CatalogFolder) => {
    setPendingFolderUndo(null);
    setTargetFolder(folder);
    setMoveParentId(folder.parentId ?? '');
    setCreateError(null);
    setCreateDialog(kind);
  };
  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !createDialog ||
      isCreating ||
      (['folder', 'suite', 'rename-folder', 'edit-suite'].includes(createDialog) && !createName.trim())
    )
      return;
    setIsCreating(true);
    setCreateError(null);
    try {
      if (createDialog === 'folder') {
        const created = await onCreateFolder(
          createName.trim(),
          selectedFolder?.id ?? null,
          createDescription.trim() || null,
        );
        if (created && typeof created === 'object' && 'id' in created && typeof created.id === 'string')
          changeScope({ kind: 'folder', id: created.id });
      } else if (createDialog === 'suite') {
        const created = await onCreateSuite({
          name: createName.trim(),
          purpose: createPurpose.trim() || undefined,
          release: createRelease.trim() || undefined,
          description: createDescription.trim() || undefined,
        });
        if (created && typeof created === 'object' && 'id' in created && typeof created.id === 'string')
          changeScope({ kind: 'suite', id: created.id });
      } else if (createDialog === 'rename-folder' && targetFolder) {
        await onUpdateFolder(targetFolder.id, {
          name: createName.trim(),
          description: createDescription.trim() || null,
        });
      } else if (createDialog === 'edit-suite' && targetSuite) {
        await onUpdateSuite(targetSuite.id, {
          name: createName.trim(),
          purpose: createPurpose.trim() || null,
          release: createRelease.trim() || null,
          description: createDescription.trim() || null,
        });
      } else if (createDialog === 'move-folder' && targetFolder) {
        await onUpdateFolder(targetFolder.id, { parentId: moveParentId || null });
      } else if (createDialog === 'delete-folder' && targetFolder) {
        const result = await onDeleteFolder(targetFolder.id);
        if (currentProjectId.current !== projectId) return;
        const descendantCount = Math.max(0, flattenFolders([targetFolder]).length - 1);
        setPendingFolderUndo({
          kind: 'deletion',
          restoreData: result.restoreData,
          message: `Deleted ${targetFolder.name}${descendantCount ? ` and ${descendantCount} nested folder${descendantCount === 1 ? '' : 's'}` : ''}; moved ${result.restoreData.scenarios.length} scenarios to No folder`,
        });
        setPendingSuiteUndo(null);
      } else if (createDialog === 'delete-suite' && targetSuite) {
        await onDeleteSuite(targetSuite.id);
      }
      setCreateDialog(null);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsCreating(false);
    }
  };
  const showOperationReport = (report: ScenarioOperationReport) => {
    if (!report.failedIds.length && !report.unattemptedIds.length && !report.uncertainIds.length) {
      setOperationFeedback(null);
      return;
    }
    const counts = [
      `${report.succeededIds.length} completed`,
      `${report.failedIds.length} failed`,
      `${report.unattemptedIds.length} not attempted`,
      `${report.uncertainIds.length} with unknown outcome`,
    ];
    const guidance = report.uncertainIds.length ? ' Check unknown outcomes before retrying.' : '';
    setOperationFeedback(
      `${counts.join(' · ')}. ${report.errorMessage ?? 'The operation did not complete.'}${guidance}`,
    );
  };
  const submitDeleteSelected = async () => {
    if (isDeletingSelected || deleteTargetIds.length === 0) return;
    setIsDeletingSelected(true);
    try {
      showOperationReport(await onDeleteSelected(deleteTargetIds));
      setDeleteSelectedOpen(false);
    } catch (error) {
      setOperationFeedback(getActionErrorMessage(error));
      setDeleteSelectedOpen(false);
    } finally {
      setIsDeletingSelected(false);
    }
  };
  const submitRemoveFromSuite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isRemovingFromSuite || selectedIds.length === 0) return;
    setIsRemovingFromSuite(true);
    setRemoveFromSuiteError(null);
    try {
      if (scope.kind !== CATALOG_SCOPE.suite || !scope.id) return;
      const undo = await removeSuiteMembership(scope.id, selectedIds);
      setPendingSuiteUndo({
        kind: 'membership',
        payload: undo,
        message: getMembershipChangeMessage(0, selectedIds.length, selectedSuite?.name ?? 'the suite'),
      });
      setOperationFeedback(null);
      clearSelection();
      await refreshSuiteData();
      setRemoveFromSuiteOpen(false);
    } catch (error) {
      setRemoveFromSuiteError(getActionErrorMessage(error));
    } finally {
      setIsRemovingFromSuite(false);
    }
  };
  const handleToggleSelected = (id: string) => {
    setPendingSuiteUndo(null);
    setPendingFolderUndo(null);
    toggleSelected(id);
  };
  const clearSelection = () => selectedIds.forEach((id) => toggleSelected(id));
  const handleScenarioDragOver = (event: DragEvent<HTMLElement>, destinationId: string) => {
    if (
      !isScenariosTab ||
      !projectId ||
      !event.dataTransfer.types.includes(SCENARIO_DRAG_MIME) ||
      activeDrag.current?.projectId !== projectId
    )
      return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverFolderId(destinationId);
  };
  const handleScenarioDrop = (event: DragEvent<HTMLElement>, destinationId: string | null) => {
    if (!isScenariosTab || !projectId || !event.dataTransfer.types.includes(SCENARIO_DRAG_MIME)) return;
    event.preventDefault();
    event.stopPropagation();
    setDragOverFolderId(null);
    setIsDraggingScenario(false);
    const active = activeDrag.current;
    activeDrag.current = null;
    try {
      const payload = JSON.parse(event.dataTransfer.getData(SCENARIO_DRAG_MIME)) as {
        projectId?: string;
        scenarioIds?: unknown;
      };
      if (
        payload.projectId !== projectId ||
        !Array.isArray(payload.scenarioIds) ||
        !payload.scenarioIds.every((id) => typeof id === 'string')
      )
        return;
      const ids = [...new Set(payload.scenarioIds as string[])];
      if (ids.length === 0 || active?.projectId !== projectId || ids.some((id) => !active.scenarioIds.includes(id)))
        return;
      setPendingFolderUndo(null);
      setPendingSuiteUndo(null);
      void onMoveScenarioIds(ids, destinationId)
        .then((report) => {
          if (currentProjectId.current !== projectId) return;
          showOperationReport(report);
          if (report.folderRestoreData?.length) {
            setPendingFolderUndo({
              kind: 'move',
              restoreData: report.folderRestoreData,
              message: `${report.folderRestoreData.length} scenario${report.folderRestoreData.length === 1 ? '' : 's'} moved to ${destinationId === null ? 'No folder' : (folderRows.find((folder) => folder.id === destinationId)?.name ?? 'folder')}`,
            });
          }
        })
        .catch((error: unknown) => {
          if (currentProjectId.current === projectId) setOperationFeedback(getActionErrorMessage(error));
        });
    } catch {
      return;
    }
  };
  const handleSuiteDrop = (event: DragEvent<HTMLElement>, destinationSuiteId: string) => {
    if (
      isScenariosTab ||
      !projectId ||
      !scope.id ||
      scope.id === destinationSuiteId ||
      !event.dataTransfer.types.includes(SCENARIO_DRAG_MIME)
    )
      return;
    event.preventDefault();
    event.stopPropagation();
    setDragOverFolderId(null);
    setIsDraggingScenario(false);
    const active = activeDrag.current;
    activeDrag.current = null;
    try {
      const payload = JSON.parse(event.dataTransfer.getData(SCENARIO_DRAG_MIME)) as {
        projectId?: string;
        scenarioIds?: unknown;
      };
      if (
        payload.projectId !== projectId ||
        !Array.isArray(payload.scenarioIds) ||
        !payload.scenarioIds.every((id) => typeof id === 'string')
      )
        return;
      const ids = [...new Set(payload.scenarioIds as string[])];
      if (!ids.length || active?.projectId !== projectId || ids.some((id) => !active.scenarioIds.includes(id))) return;
      void moveSuiteMembership(scope.id, destinationSuiteId, ids)
        .then(async (undo) => {
          const destinationName = suites.find((suite) => suite.id === destinationSuiteId)?.name ?? 'the suite';
          const sourceName = suites.find((suite) => suite.id === scope.id)?.name ?? 'the suite';
          const skipped = undo.alreadyInDestination.length;
          const moved = ids.length - skipped;
          let message: string;
          if (skipped === ids.length && ids.length === 1) {
            const scenario = scenarios.find((item) => item.id === ids[0]);
            message = `${scenario?.scenarioKey ?? scenario?.title ?? 'Scenario'} is already in ${destinationName} — removed from ${sourceName}`;
          } else if (skipped === ids.length) {
            message = `${ids.length} scenarios were already in ${destinationName} — removed from ${sourceName}`;
          } else {
            message = `${moved} scenario${moved === 1 ? '' : 's'} moved to ${destinationName}${skipped ? ` · ${skipped} ${skipped === 1 ? 'was' : 'were'} already there` : ''}`;
          }
          setPendingSuiteUndo({ kind: 'move', payload: undo, message });
          setOperationFeedback(null);
          clearSelection();
          await refreshSuiteData();
        })
        .catch((error: unknown) => {
          setOperationFeedback(getActionErrorMessage(error));
          void refreshSuiteData();
        });
    } catch {
      return;
    }
  };
  const canReorderSuite = Boolean(
    selectedSuite &&
    scope.kind === CATALOG_SCOPE.suite &&
    (selectedSuite.members?.length ?? 0) <= pageSize &&
    !search.trim() &&
    !priority &&
    selectedAuthorIds.length === 0 &&
    activeColumnFilters.length === 0 &&
    !sort,
  );
  const reorderRequirements = [
    sort && 'select Run order',
    (search.trim() || priority || selectedAuthorIds.length > 0 || activeColumnFilters.length > 0) &&
      'clear search and filters',
    (selectedSuite?.members?.length ?? 0) > pageSize && 'show all suite scenarios on one page',
  ].filter(Boolean);
  const handleSuiteRowDrop = (event: DragEvent<HTMLElement>, targetScenarioId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOverFolderId(null);
    const active = activeDrag.current;
    activeDrag.current = null;
    if (!canReorderSuite || !selectedSuite || !active || active.projectId !== projectId) return;
    try {
      const payload = JSON.parse(event.dataTransfer.getData(SCENARIO_DRAG_MIME)) as {
        projectId?: string;
        scenarioIds?: unknown;
      };
      if (
        payload.projectId !== projectId ||
        !Array.isArray(payload.scenarioIds) ||
        !payload.scenarioIds.every((id) => typeof id === 'string')
      )
        return;
      const movingIds = [...new Set(payload.scenarioIds as string[])];
      const fullOrder = (selectedSuite.members ?? []).map((member) => member.testScenarioId);
      if (!movingIds.length || movingIds.includes(targetScenarioId) || movingIds.some((id) => !fullOrder.includes(id)))
        return;
      const moving = fullOrder.filter((id) => movingIds.includes(id));
      const remaining = fullOrder.filter((id) => !movingIds.includes(id));
      const targetIndex = remaining.indexOf(targetScenarioId);
      if (targetIndex < 0) return;
      const movingDown = fullOrder.indexOf(moving[0]) < fullOrder.indexOf(targetScenarioId);
      const insertionIndex = targetIndex + (movingDown ? 1 : 0);
      const nextOrder = [...remaining.slice(0, insertionIndex), ...moving, ...remaining.slice(insertionIndex)];
      if (nextOrder.some((id, index) => id !== fullOrder[index])) {
        const previousOrder = [...fullOrder];
        const suiteId = selectedSuite.id;
        const suiteName = selectedSuite.name;
        setPendingSuiteUndo(null);
        void onReorderSuite(suiteId, nextOrder)
          .then(async () => {
            await refreshSuiteData();
            setOperationFeedback(null);
            setPendingSuiteUndo({
              kind: 'reorder',
              payload: { suiteId, scenarioIds: previousOrder },
              message: `Scenario order updated in ${suiteName}`,
            });
          })
          .catch((error: unknown) => {
            setOperationFeedback(getActionErrorMessage(error));
            void refreshSuiteData();
          });
      }
    } finally {
      setIsDraggingScenario(false);
    }
  };
  const handleSuiteRowDragOver = (event: DragEvent<HTMLElement>, scenarioId: string) => {
    if (!event.dataTransfer.types.includes(SCENARIO_DRAG_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverFolderId(scenarioId);
  };
  const isInFolderSubtree = (candidateId: string, folderId: string) => {
    let current = folderRows.find((folder) => folder.id === candidateId);
    while (current) {
      if (current.id === folderId) return true;
      current = folderRows.find((folder) => folder.id === current?.parentId);
    }
    return false;
  };
  const reorderFolder = async (folder: CatalogFolder, direction: -1 | 1) => {
    const siblings = folderRows.filter((item) => item.parentId === folder.parentId);
    const currentIndex = siblings.findIndex((item) => item.id === folder.id);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= siblings.length) return;

    const reordered = [...siblings];
    [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];
    for (const [position, sibling] of reordered.entries()) {
      if (sibling.position !== position) await onUpdateFolder(sibling.id, { position });
    }
  };
  const handleDragLeave = (destinationId: string) => {
    setDragOverFolderId((current) => (current === destinationId ? null : current));
  };
  const handleSuiteDragOver = (event: DragEvent<HTMLElement>, suiteId: string) => {
    if (!isScenariosTab && scope.id !== suiteId && projectId && event.dataTransfer.types.includes(SCENARIO_DRAG_MIME)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setDragOverFolderId(suiteId);
    }
  };

  const handleDragPayload = (dragProjectId: string, scenarioIds: string[]) => {
    setPendingFolderUndo(null);
    setPendingSuiteUndo(null);
    activeDrag.current = { projectId: dragProjectId, scenarioIds };
    setIsDraggingScenario(true);
  };
  const handleDragEnd = () => {
    activeDrag.current = null;
    setIsDraggingScenario(false);
    setDragOverFolderId(null);
  };

  const handleSuiteUndo = async () => {
    if (isUndoingSuiteChange || !pendingSuiteUndo) return;
    setIsUndoingSuiteChange(true);
    try {
      if (pendingSuiteUndo.kind === 'membership') {
        await restoreSuiteMembership(pendingSuiteUndo.payload);
        if (pendingSuiteUndo.payload.createdSuiteId) await onDeleteSuite(pendingSuiteUndo.payload.createdSuiteId);
      } else if (pendingSuiteUndo.kind === 'move') await restoreSuiteMove(pendingSuiteUndo.payload);
      else await onReorderSuite(pendingSuiteUndo.payload.suiteId, pendingSuiteUndo.payload.scenarioIds);
      setPendingSuiteUndo(null);
      setOperationFeedback(null);
      await refreshSuiteData();
    } catch (error) {
      setOperationFeedback(`Undo failed: ${getActionErrorMessage(error)}`);
      setPendingSuiteUndo(null);
      await refreshSuiteData();
    } finally {
      setIsUndoingSuiteChange(false);
    }
  };

  const handleFolderUndo = async () => {
    if (isUndoingSuiteChange || !pendingFolderUndo) return;
    setIsUndoingSuiteChange(true);
    try {
      if (pendingFolderUndo.kind === 'deletion') await restoreFolderDeletion(pendingFolderUndo.restoreData);
      else await restoreScenarioFolders(pendingFolderUndo.restoreData);
      setPendingFolderUndo(null);
      setOperationFeedback(null);
      await refreshSuiteData();
    } catch (error) {
      setOperationFeedback(`Undo failed: ${getActionErrorMessage(error)}`);
      setPendingFolderUndo(null);
      await refreshSuiteData();
    } finally {
      setIsUndoingSuiteChange(false);
    }
  };

  const handleSuitePickerComplete: SuitePickerCompletion = (report, selection, undo) => {
    if (currentProjectId.current !== projectId) return;
    onSuiteOperationComplete(report, selection);
    if (undo) {
      const added = undo.restoreData.addedScenarioIds.length;
      const already = selection.length - added;
      const message = `${added} scenario${added === 1 ? '' : 's'} added to ${undo.suiteName}${already ? ` (${already} already there)` : ''}`;
      setPendingSuiteUndo({
        kind: 'membership',
        payload: {
          restoreData: undo.restoreData,
          expectedMembershipRevision: undo.membershipRevision,
          expectedScenarioIds: undo.scenarioIds,
          ...(undo.createdSuiteId ? { createdSuiteId: undo.createdSuiteId } : {}),
        },
        message: undo.createdSuiteId ? `Suite “${undo.suiteName}” created · ${message}` : message,
      });
    } else if (report.succeededIds.length) setPendingSuiteUndo(null);
    setPendingFolderUndo(null);
    showOperationReport(report);
  };

  const organizationEditor: CatalogEditorForm = {
    name: createName,
    description: createDescription,
    error: createError,
    isSubmitting: isCreating,
    onNameChange: setCreateName,
    onDescriptionChange: setCreateDescription,
    onSubmit: submitCreate,
    onCancel: () => setCreateDialog(null),
  };

  const selectedFolderSiblings = selectedFolder
    ? folderRows.filter((folder) => folder.parentId === selectedFolder.parentId)
    : [];
  const selectedFolderIndex = selectedFolderSiblings.findIndex((folder) => folder.id === selectedFolder?.id);
  return (
    <Wrap
      my={4}
      mx={6}
      p={{ base: 3, md: 5 }}
      ps={{ base: 3, md: '14px' }}
      minH="calc(100dvh - 140px)"
      alignItems="stretch"
      bg="bg.card"
      borderRadius="lg"
    >
      <VStack align="stretch" gap={5} w="100%" flex="1">
        <Grid
          templateColumns={{ base: '1fr', lg: '250px minmax(0, 1fr)' }}
          gap={{ base: 4, lg: 6 }}
          alignItems="stretch"
          flex="1"
        >
          <CatalogSidebar
            editor={organizationEditor}
            organizationTab={organizationTab}
            scope={scope}
            folders={folders}
            suites={suites}
            organizationLoading={organizationLoading}
            organizationError={organizationError}
            projectScenarioCount={projectScenarioCount}
            unfiledScenarioCount={unfiledScenarioCount}
            selectedFolder={selectedFolder}
            folderScenarioCounts={folderScenarioCounts}
            isDraggingScenario={isDraggingScenario}
            dragOverFolderId={dragOverFolderId}
            changeScope={changeScope}
            startInlineFolder={startInlineFolder}
            inlineFolderParentId={inlineFolderParentId}
            inlineFolderName={inlineFolderName}
            inlineFolderError={inlineFolderError}
            setInlineFolderName={setInlineFolderName}
            onCancelFolderDraft={() => setInlineFolderParentId(undefined)}
            submitInlineFolder={submitInlineFolder}
            showSuiteDraft={createDialog === 'suite'}
            onCreateSuite={() => openCreateDialog('suite')}
            handleScenarioDragOver={handleScenarioDragOver}
            handleScenarioDrop={handleScenarioDrop}
            onDragLeave={handleDragLeave}
            onSuiteDragOver={handleSuiteDragOver}
            handleSuiteDrop={handleSuiteDrop}
          />

          <VStack align="stretch" gap={4} minW="0">
            {!isEmptySuitesState && (
              <CatalogHeader
                editor={organizationEditor}
                createDialog={createDialog}
                selectedSuite={selectedSuite}
                selectedFolder={selectedFolder}
                selectedFolderPath={selectedFolderPath}
                scope={scope}
                isScenariosTab={isScenariosTab}
                isSelectedSuiteEmpty={isSelectedSuiteEmpty}
                isExecutingOperation={isExecutingOperation}
                handleRunSuite={handleRunSuite}
                onManageScenarios={() => setAddScenariosToSuiteOpen(true)}
                openEditSuiteDialog={openEditSuiteDialog}
                onDeleteSuite={(suite) => {
                  setTargetSuite(suite);
                  setCreateError(null);
                  setCreateDialog('delete-suite');
                }}
                onCreateScenario={onCreateScenario}
                startInlineFolder={startInlineFolder}
                openEditFolderDialog={openEditFolderDialog}
                selectedFolderIndex={selectedFolderIndex}
                selectedFolderSiblingCount={selectedFolderSiblings.length}
                reorderFolder={reorderFolder}
                openFolderActionDialog={openFolderActionDialog}
              />
            )}
            {isEmptySuitesState && (
              <Box
                flex="1"
                minH={{ base: '280px', lg: '420px' }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                px={4}
              >
                <VStack align="center" gap={2} maxW="420px">
                  <Heading fontSize="lg" fontWeight="bold" lineHeight="1.4">
                    Create your first suite
                  </Heading>
                  <Text color="text.secondary" fontSize="sm" lineHeight="1.5">
                    A suite is an ordered set of scenarios you run together — a smoke check, a regression pass, a
                    release check.
                  </Text>
                  <Button size="sm" variant="ghost" colorPalette="blue" onClick={() => openCreateDialog('suite')}>
                    <FiPlus />
                    New suite
                  </Button>
                </VStack>
              </Box>
            )}
            <CatalogFilters
              hidden={isEmptySuitesState}
              showFilters={isScenariosTab || Boolean(selectedSuite)}
              allowRunOrder={!isScenariosTab}
              search={search}
              onSearchChange={onSearchChange}
              priority={priority}
              priorityCounts={priorityCounts}
              onPriorityChange={onPriorityChange}
              selectedAuthorIds={selectedAuthorIds}
              authors={authors}
              authorsLoading={authorsLoading}
              authorsError={authorsError}
              onAuthorChange={onAuthorChange}
              sort={sort}
              sortDirection={sortDirection}
              onSortChange={onSortChange}
              onSortDirectionChange={onSortDirectionChange}
              activeColumnFilters={activeColumnFilters}
              onColumnFilterChange={onColumnFilterChange}
            />

            {operationFeedback && (
              <HStack role="alert" color="fg.error" fontSize="sm">
                <Text>{operationFeedback}</Text>
                <IconButton
                  aria-label="Dismiss operation feedback"
                  size="xs"
                  variant="ghost"
                  onClick={() => setOperationFeedback(null)}
                >
                  <FiX />
                </IconButton>
              </HStack>
            )}
            {pendingSuiteUndo && (
              <CatalogUndoNotification
                label="Suite membership notification"
                message={pendingSuiteUndo.message}
                isUndoing={isUndoingSuiteChange}
                onUndo={handleSuiteUndo}
              />
            )}
            {pendingFolderUndo && (
              <CatalogUndoNotification
                label="Folder organization notification"
                message={pendingFolderUndo.message}
                isUndoing={isUndoingSuiteChange}
                onUndo={handleFolderUndo}
              />
            )}
            {selectionError && (
              <Text role="alert" color="fg.error" fontSize="sm">
                Could not select all matching scenarios: {selectionError}
              </Text>
            )}
            {isResolvingSelection && (
              <Text role="status" color="text.muted" fontSize="sm">
                Resolving all matching scenario IDs…
              </Text>
            )}
            {selectedIds.length > 0 && !pendingSuiteUndo && (
              <CatalogBulkActions
                selectedIds={selectedIds}
                total={pagination.total}
                allMatchingSelected={allMatchingSelected}
                inSuite={scope.kind === CATALOG_SCOPE.suite}
                isSuitesTab={isSuitesTab}
                isScenariosTab={isScenariosTab}
                projectId={projectId}
                isResolvingSelection={isResolvingSelection}
                isExecutingOperation={isExecutingOperation}
                isAddingToSuite={isAddingToSuite}
                onSelectAllMatching={() => {
                  setPendingSuiteUndo(null);
                  setPendingFolderUndo(null);
                  void selectAllMatching();
                }}
                handleRunSelected={handleRunSelected}
                onSuitePickerBusyChange={(busy) => {
                  if (busy) onSuiteOperationStart();
                  setIsAddingToSuite(busy);
                }}
                onSuitePickerComplete={handleSuitePickerComplete}
                onDeleteSelected={() => {
                  setDeleteTargetIds([...selectedIds]);
                  setDeleteSelectedOpen(true);
                }}
                onRemoveFromSuite={() => {
                  setRemoveFromSuiteError(null);
                  setRemoveFromSuiteOpen(true);
                }}
                clearSelection={clearSelection}
              />
            )}

            {!isEmptySuitesState && (
              <Box borderWidth="1px" borderColor="border.main" borderRadius="lg" overflow="hidden" bg="bg.card">
                {isSuitesTab && !selectedSuite ? (
                  <VStack p={8} gap={3} textAlign="center">
                    <Heading size="sm">Select a suite to view its scenarios</Heading>
                    <Text color="text.secondary">Each suite has its own membership and scenario order.</Text>
                    <Button size="sm" variant="outline" onClick={() => openCreateDialog('suite')}>
                      Create suite
                    </Button>
                  </VStack>
                ) : error ? (
                  <Box p={4}>
                    <CatalogLoadError />
                  </Box>
                ) : (
                  <>
                    {isScenariosTab ? (
                      <CompactScenarioTable
                        onScenarioActions={onScenarioActions}
                        originSearch={scenarioOriginSearch(
                          projectId ?? '',
                          scope.kind === 'folder' && scope.id
                            ? { kind: 'folder', id: scope.id }
                            : scope.kind === 'unfiled'
                              ? { kind: 'unfiled' }
                              : { kind: 'all' },
                        )}
                        projectId={projectId ?? ''}
                        scenarios={scenarios}
                        isLoading={isLoading}
                        selectedIds={selectedIds}
                        selectionDisabled={isExecutingOperation}
                        onToggleSelected={handleToggleSelected}
                        onDragPayload={handleDragPayload}
                        onDragEnd={handleDragEnd}
                        folderPathById={folderPathById}
                        searchActive={
                          Boolean(search.trim()) ||
                          Boolean(priority) ||
                          selectedAuthorIds.length > 0 ||
                          activeColumnFilters.length > 0
                        }
                        emptyFolder={scope.kind === 'folder'}
                        onCreateScenario={onCreateScenario ?? (() => {})}
                      />
                    ) : (
                      <SuiteScenarioTable
                        originSearch={scenarioOriginSearch(
                          projectId ?? '',
                          scope.kind === 'suite' && scope.id ? { kind: 'suite', id: scope.id } : { kind: 'all' },
                        )}
                        projectId={projectId}
                        enableSuiteDrag={!isScenariosTab}
                        enableSuiteReorder={canReorderSuite}
                        onDragPayload={handleDragPayload}
                        onDragEnd={handleDragEnd}
                        onSuiteRowDrop={handleSuiteRowDrop}
                        onSuiteRowDragOver={handleSuiteRowDragOver}
                        dragOverScenarioId={dragOverFolderId}
                        scenarios={scenarios}
                        isLoading={isLoading}
                        selectedIds={selectedIds}
                        selectionDisabled={isExecutingOperation}
                        onToggleSelected={handleToggleSelected}
                        showFolder={showFolderColumn}
                        folderPathById={folderPathById}
                        searchActive={Boolean(search.trim()) || activeColumnFilters.length > 0}
                        emptySuite={Boolean(
                          selectedSuite &&
                          selectedSuite.members?.length === 0 &&
                          !search.trim() &&
                          !priority &&
                          !selectedAuthorIds.length &&
                          !activeColumnFilters.length,
                        )}
                        onAddScenarios={() => setAddScenariosToSuiteOpen(true)}
                      />
                    )}
                  </>
                )}
              </Box>
            )}
            {!isEmptySuitesState && !error && (isScenariosTab || selectedSuite) && (
              <CatalogPagination
                pagination={pagination}
                pageSize={pageSize}
                pageSizes={pageSizes}
                onPageSizeChange={onPageSizeChange}
                onPageChange={onPageChange}
              />
            )}
            {!error && selectedSuite?.members && selectedSuite.members.length > 0 && (
              <Text fontSize="sm" color="text.secondary" role="status">
                {canReorderSuite
                  ? 'Drag rows to change the run order, or onto another suite on the left to move them. Changes save right away.'
                  : `To change the run order, ${reorderRequirements.join(', ')}. Drag rows onto another suite on the left to move them. Changes save right away.`}
              </Text>
            )}
          </VStack>
        </Grid>
      </VStack>
      {addScenariosToSuiteOpen && selectedSuite && projectId && (
        <TestSuiteAddScenariosDialogContainer
          projectId={projectId}
          suite={selectedSuite}
          folderOptions={folderRows.map(({ id, name, depth }) => ({
            id,
            name,
            depth,
            scenarioCount: folderScenarioCounts.get(id) ?? 0,
          }))}
          unfiledScenarioCount={unfiledScenarioCount}
          totalScenarioCount={projectScenarioCount}
          onSaved={(payload) => {
            const addedCount = payload.restoreData.addedScenarioIds.length;
            const removedCount = payload.restoreData.removedMembers.length;
            setPendingSuiteUndo({
              kind: 'membership',
              payload,
              message: getMembershipChangeMessage(addedCount, removedCount, selectedSuite?.name ?? 'the suite'),
            });
            setOperationFeedback(null);
          }}
          onClose={() => setAddScenariosToSuiteOpen(false)}
        />
      )}
      {deleteSelectedOpen && (
        <DeleteSelectedScenariosDialog
          count={deleteTargetIds.length}
          isDeletingSelected={isDeletingSelected}
          onClose={() => setDeleteSelectedOpen(false)}
          onConfirm={submitDeleteSelected}
        />
      )}
      {removeFromSuiteOpen && (
        <RemoveScenariosFromSuiteDialog
          count={selectedIds.length}
          isRemovingFromSuite={isRemovingFromSuite}
          removeFromSuiteError={removeFromSuiteError}
          onClose={() => setRemoveFromSuiteOpen(false)}
          onSubmit={submitRemoveFromSuite}
        />
      )}
      {createDialog &&
        createDialog !== 'suite' &&
        createDialog !== 'edit-suite' &&
        createDialog !== 'rename-folder' && (
          <CatalogOrganizationDialog
            editor={organizationEditor}
            createDialog={createDialog}
            selectedFolder={selectedFolder}
            targetFolder={targetFolder}
            targetSuite={targetSuite}
            moveParentId={moveParentId}
            folderRows={folderRows}
            folderScenarioCounts={folderScenarioCounts}
            isInFolderSubtree={isInFolderSubtree}
            setMoveParentId={setMoveParentId}
          />
        )}
    </Wrap>
  );
});
