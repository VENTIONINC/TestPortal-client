// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo, useCallback, useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { Box, Button, Collapsible, Grid, Heading, HStack, IconButton, Input, Link as ChakraLink, Menu, Table, Text, Textarea, VStack } from '@chakra-ui/react';
import { FiArrowDown, FiArrowUp, FiChevronsUp, FiChevronDown, FiChevronRight, FiEdit, FiFolder, FiLayers, FiMoreHorizontal, FiPlus, FiSearch, FiTrash2, FiX } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router';

import { Alert, ContextMenuButton, Dialog, DialogBody, DialogFooter, NativeSelect, Pagination, Tooltip, Wrap } from '@/components/ui';
import { extractApiError } from '@/utils/apiErrors';

import { TestSuiteAddScenariosDialogContainer } from '../containers/TestSuiteAddScenariosDialogContainer';
import { getTestScenarioDetailPath } from '../constants';
import { useTestScenarioContextMenu } from '../hooks/useTestScenarioContextMenu';
import type { TestScenarioPagination, TestScenarioSummary } from '../types';

export interface CatalogFolder {
  id: string;
  name: string;
  parentId: string | null;
  position?: number;
  scenarioCount: number;
  children?: unknown[];
}

const getFolderChildren = (folder: CatalogFolder): CatalogFolder[] =>
  (folder.children ?? []).filter((child): child is CatalogFolder =>
    typeof child === 'object' && child !== null && 'id' in child && 'name' in child,
  );

export interface CatalogSuite {
  id: string;
  name: string;
  description: string | null;
  purpose: string | null;
  release: string | null;
  members?: Array<{ testScenarioId: string }>;
}

export interface TestScenarioCatalogViewProps {
  projectId?: string;
  scenarios: TestScenarioSummary[];
  pagination: TestScenarioPagination;
  isLoading: boolean;
  error?: unknown;
  onPageChange: (page: number) => void;
  onCreateScenario?: () => void;
  onContextMenu?: (event: MouseEvent<HTMLButtonElement>, scenario: TestScenarioSummary) => void;
  search: string;
  onSearchChange: (value: string) => void;
  sort?: 'scenarioKey' | 'title' | 'details' | 'folder' | 'createdBy' | 'createdAt' | 'updatedAt';
  sortDirection: 'asc' | 'desc';
  onSortChange: (value: NonNullable<TestScenarioCatalogViewProps['sort']>) => void;
  columnFilters: { scenarioKey: string; title: string; details: string; folder: string; createdBy: string };
  onColumnFilterChange: (field: keyof TestScenarioCatalogViewProps['columnFilters'], value: string) => void;
  scope: { kind: 'all' | 'unfiled' | 'folder' | 'suite'; id?: string };
  onScopeChange: (scope: { kind: 'all' | 'unfiled' | 'folder' | 'suite'; id?: string }) => void;
  folders: CatalogFolder[];
  suites: CatalogSuite[];
  organizationLoading: boolean;
  organizationError?: unknown;
  selectedIds: string[];
  toggleSelected: (id: string) => void;
  selectOnlyScenario?: (id: string) => void;
  onMoveSelected: (folderId: string | null) => Promise<void>;
  onAddSelectedToSuite: (suiteId: string) => Promise<void>;
  onRemoveSelectedFromSuite: () => Promise<void>;
  onReorderSuite: (suiteId: string, scenarioIds: string[]) => Promise<void>;
  onCreateFolder: (name: string, parentId: string | null) => Promise<unknown>;
  onUpdateFolder: (folderId: string, body: { name?: string; parentId?: string | null; position?: number }) => Promise<unknown>;
  onDeleteFolder: (folderId: string, disposition: 'parent' | 'unfiled') => Promise<void>;
  onCreateSuite: (body: { name: string; description?: string | null; purpose?: string | null; release?: string | null }) => Promise<unknown>;
  onUpdateSuite: (suiteId: string, body: { name?: string; description?: string | null; purpose?: string | null; release?: string | null }) => Promise<unknown>;
  onDeleteSuite: (suiteId: string) => Promise<void>;
  includeDescendants: boolean;
  onIncludeDescendantsChange: (value: boolean) => void;
}

const formatScenarioDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString('en-US'),
    time: date.toLocaleTimeString('en-US'),
  };
};

const ScenarioTimestamp = ({ timestamp }: { timestamp: string }) => {
  const { date, time } = formatScenarioDate(timestamp);
  return <VStack align="start" gap={0} whiteSpace="nowrap" fontSize="xs"><Text>{date}</Text><Text>{time}</Text></VStack>;
};

const TABLE_CELL_PADDING = { px: 4, py: 4 } as const;
const UNFILED_DESTINATION = '__unfiled__';

const ScenarioColumnHeader = ({
  label, field, sort, sortDirection, onSortChange, filterValue, onFilterChange, openFilter, onFilterDisclosureChange,
}: {
  label: string;
  field: NonNullable<TestScenarioCatalogViewProps['sort']>;
  sort?: TestScenarioCatalogViewProps['sort'];
  sortDirection: 'asc' | 'desc';
  onSortChange: TestScenarioCatalogViewProps['onSortChange'];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  openFilter: string | null;
  onFilterDisclosureChange: (field: string | null) => void;
}) => {
  // The API's implicit order is newest first. Show that state in the header
  // even while the request leaves the default sort parameters out.
  const activeSort = sort === field || (!sort && field === 'createdAt');
  const activeDirection = sortDirection;
  return (
    <HStack gap={1} minW={0} justify="flex-start" flexWrap="nowrap">
      <Button size="xs" variant="ghost" px={1} minW={0} flex="1" h="auto" whiteSpace="nowrap" textAlign="start" justifyContent="flex-start" aria-label={`Sort by ${label}${activeSort ? ` ${activeDirection === 'asc' ? 'ascending' : 'descending'}` : ''}`} onClick={() => onSortChange(field)}>
        <Text as="span" overflow="hidden" textOverflow="ellipsis">{label}</Text>{activeSort ? (activeDirection === 'asc' ? <FiArrowUp aria-hidden="true" /> : <FiArrowDown aria-hidden="true" />) : <FiChevronsUp aria-hidden="true" />}
      </Button>
      {onFilterChange && <details data-filter-field={field} open={openFilter === field} onToggle={(event) => onFilterDisclosureChange(event.currentTarget.open ? field : null)} style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
        <Box as="summary" role="button" aria-label={`Filter by ${label}${filterValue ? ', filter active' : ''}`} aria-pressed={Boolean(filterValue)} display="inline-flex" alignItems="center" justifyContent="center" listStyleType="none" cursor="pointer" borderRadius="md" w="24px" h="24px" color={filterValue ? 'blue.600' : 'text.muted'} bg={filterValue ? 'blue.subtle' : undefined} _hover={{ bg: 'bg.subtle', color: 'text.main' }}><FiSearch aria-hidden="true" /></Box>
        <VStack align="stretch" gap={2} position="absolute" zIndex="popover" top="calc(100% + 6px)" insetStart="0" p={3} w="260px" bg="bg.panel" borderWidth="1px" borderColor="border.main" borderRadius="md" boxShadow="lg" fontWeight="normal">
          <Box><Text fontSize="sm" fontWeight="semibold">Search {label}</Text><Text fontSize="xs" color="text.muted">Match text anywhere in this column</Text></Box>
          <HStack>
            <Input size="sm" aria-label={`${label} filter`} placeholder={`Search ${label.toLowerCase()}`} value={filterValue ?? ''} onChange={(event) => onFilterChange(event.currentTarget.value)} onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                onFilterDisclosureChange(null);
              }
            }} autoFocus />
            {filterValue && <IconButton size="sm" variant="ghost" aria-label={`Clear ${label} filter`} onClick={() => onFilterChange('')}><FiX /></IconButton>}
          </HStack>
        </VStack>
      </details>}
    </HStack>
  );
};

const getActionErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && ('data' in error || 'status' in error)) {
    return extractApiError(error as Parameters<typeof extractApiError>[0]);
  }
  return error instanceof Error ? error.message : String(error);
};

const flattenFolders = (folders: CatalogFolder[]): Array<CatalogFolder & { depth: number }> => {
  const flattened: Array<CatalogFolder & { depth: number }> = [];
  const visit = (folder: CatalogFolder, depth: number) => {
    flattened.push({ ...folder, depth });
    getFolderChildren(folder).forEach((child) => visit(child, depth + 1));
  };
  folders.forEach((folder) => visit(folder, 0));
  return flattened;
};

const ErrorState = () => (
  <Alert.Root status="error" role="alert">
    <Alert.Indicator />
    <Alert.Content>
      <Alert.Title>Failed to load Test Scenarios</Alert.Title>
      <Alert.Description>Please try again in a moment.</Alert.Description>
    </Alert.Content>
  </Alert.Root>
);

const EmptyState = ({ searchActive = false }: { searchActive?: boolean }) => (
  <VStack py={8}>
    <Text color="text.muted">{searchActive ? 'No scenarios match the current search.' : 'No Test Scenarios are available for this project.'}</Text>
  </VStack>
);

const ScenarioTable = ({
  scenarios,
  isLoading,
  selectedIds,
  onToggleSelected,
  onContextMenu,
  showFolder,
  folderPathById,
  sort,
  sortDirection,
  onSortChange,
  columnFilters,
  onColumnFilterChange,
  openFilter,
  onFilterDisclosureChange,
  searchActive,
}: {
  scenarios: TestScenarioSummary[];
  isLoading: boolean;
  selectedIds: string[];
  onToggleSelected: (id: string) => void;
  onContextMenu?: (event: MouseEvent<HTMLButtonElement>, scenario: TestScenarioSummary) => void;
  showFolder: boolean;
  folderPathById: Map<string, string>;
  sort?: TestScenarioCatalogViewProps['sort'];
  sortDirection: 'asc' | 'desc';
  onSortChange: TestScenarioCatalogViewProps['onSortChange'];
  columnFilters: TestScenarioCatalogViewProps['columnFilters'];
  onColumnFilterChange: TestScenarioCatalogViewProps['onColumnFilterChange'];
  openFilter: string | null;
  onFilterDisclosureChange: (field: string | null) => void;
  searchActive: boolean;
}) => {
  const [anchorScenarioId, setAnchorScenarioId] = useState<string | null>(null);
  const extendSelectionRef = useRef(false);
  const handleScenarioSelection = (scenarioId: string, index: number, extendSelection: boolean) => {
    const anchorIndex = scenarios.findIndex((scenario) => scenario.id === anchorScenarioId);
    if (extendSelection && anchorIndex >= 0) {
      const [start, end] = [anchorIndex, index].sort((a, b) => a - b);
      scenarios.slice(start, end + 1)
        .filter((scenario) => !selectedIds.includes(scenario.id))
        .forEach((scenario) => onToggleSelected(scenario.id));
    } else {
      onToggleSelected(scenarioId);
    }
    setAnchorScenarioId(scenarioId);
  };
  return (
    <Box overflowX="auto">
      <Table.Root size="sm" variant="outline" w="100%" minW={showFolder ? '1100px' : '960px'} tableLayout="fixed">
        <Table.Header>
          <Table.Row bg="bg.subtle">
            <Table.ColumnHeader {...TABLE_CELL_PADDING} w="48px">
              <input
                type="checkbox"
                aria-label="Select all scenarios on this page"
                checked={scenarios.length > 0 && scenarios.every((scenario) => selectedIds.includes(scenario.id))}
                ref={(element) => {
                  if (element)
                    element.indeterminate =
                      scenarios.some((scenario) => selectedIds.includes(scenario.id)) &&
                      !scenarios.every((scenario) => selectedIds.includes(scenario.id));
                }}
                onChange={() => {
                  const allSelected = scenarios.every((scenario) => selectedIds.includes(scenario.id));
                  scenarios
                    .filter((scenario) => selectedIds.includes(scenario.id) === allSelected)
                    .forEach((scenario) => onToggleSelected(scenario.id));
                }}
              />
              <Text srOnly>Select</Text>
            </Table.ColumnHeader>
            <Table.ColumnHeader px={0} py={2} w="130px">
              <ScenarioColumnHeader
                label="Scenario key"
                field="scenarioKey"
                sort={sort}
                sortDirection={sortDirection}
                onSortChange={onSortChange}
                filterValue={columnFilters.scenarioKey}
                onFilterChange={(value) => onColumnFilterChange('scenarioKey', value)}
                openFilter={openFilter}
                onFilterDisclosureChange={onFilterDisclosureChange}
              />
            </Table.ColumnHeader>
            <Table.ColumnHeader {...TABLE_CELL_PADDING} w={{ base: '29%', xl: '20%' }}>
              <ScenarioColumnHeader
                label="Title"
                field="title"
                sort={sort}
                sortDirection={sortDirection}
                onSortChange={onSortChange}
                filterValue={columnFilters.title}
                onFilterChange={(value) => onColumnFilterChange('title', value)}
                openFilter={openFilter}
                onFilterDisclosureChange={onFilterDisclosureChange}
              />
            </Table.ColumnHeader>
            <Table.ColumnHeader {...TABLE_CELL_PADDING} w={{ base: '31%', xl: '22%' }}>
              <ScenarioColumnHeader
                label="Details"
                field="details"
                sort={sort}
                sortDirection={sortDirection}
                onSortChange={onSortChange}
                filterValue={columnFilters.details}
                onFilterChange={(value) => onColumnFilterChange('details', value)}
                openFilter={openFilter}
                onFilterDisclosureChange={onFilterDisclosureChange}
              />
            </Table.ColumnHeader>
            {showFolder && (
              <Table.ColumnHeader px={1} py={2} w="180px">
                <ScenarioColumnHeader
                  label="Folder"
                  field="folder"
                  sort={sort}
                  sortDirection={sortDirection}
                  onSortChange={onSortChange}
                  filterValue={columnFilters.folder}
                  onFilterChange={(value) => onColumnFilterChange('folder', value)}
                  openFilter={openFilter}
                  onFilterDisclosureChange={onFilterDisclosureChange}
                />
              </Table.ColumnHeader>
            )}
            <Table.ColumnHeader {...TABLE_CELL_PADDING} w="18%">
              <ScenarioColumnHeader
                label="Created by"
                field="createdBy"
                sort={sort}
                sortDirection={sortDirection}
                onSortChange={onSortChange}
                filterValue={columnFilters.createdBy}
                onFilterChange={(value) => onColumnFilterChange('createdBy', value)}
                openFilter={openFilter}
                onFilterDisclosureChange={onFilterDisclosureChange}
              />
            </Table.ColumnHeader>
            <Table.ColumnHeader px={1} py={2} w="90px">
              <ScenarioColumnHeader
                label="Created"
                field="createdAt"
                sort={sort}
                sortDirection={sortDirection}
                onSortChange={onSortChange}
                openFilter={openFilter}
                onFilterDisclosureChange={onFilterDisclosureChange}
              />
            </Table.ColumnHeader>
            <Table.ColumnHeader px={1} py={2} w="90px">
              <ScenarioColumnHeader
                label="Updated"
                field="updatedAt"
                sort={sort}
                sortDirection={sortDirection}
                onSortChange={onSortChange}
                openFilter={openFilter}
                onFilterDisclosureChange={onFilterDisclosureChange}
              />
            </Table.ColumnHeader>
            <Table.ColumnHeader px={1} py={4} w="35px" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {scenarios.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={showFolder ? 9 : 8} py={8} textAlign="center">
                {isLoading ? (
                  <Text role="status" color="text.muted">
                    Searching scenarios…
                  </Text>
                ) : (
                  <EmptyState searchActive={searchActive} />
                )}
              </Table.Cell>
            </Table.Row>
          ) : (
            scenarios.map((scenario, index) => (
              <Table.Row
                key={scenario.id}
                data-testid={`test-scenario-${scenario.id}`}
                bg={selectedIds.includes(scenario.id) ? 'bg.subtle' : undefined}
                borderStartWidth={selectedIds.includes(scenario.id) ? '3px' : undefined}
                borderStartColor={selectedIds.includes(scenario.id) ? 'border.focus' : undefined}
                _hover={{ bg: 'bg.subtle' }}
              >
                <Table.Cell {...TABLE_CELL_PADDING}>
                  <input
                    type="checkbox"
                    aria-label={`Select ${scenario.title}`}
                    checked={selectedIds.includes(scenario.id)}
                    onClick={(event) => {
                      extendSelectionRef.current = event.shiftKey;
                    }}
                    onChange={() => {
                      handleScenarioSelection(scenario.id, index, extendSelectionRef.current);
                      extendSelectionRef.current = false;
                    }}
                  />
                </Table.Cell>
                <Table.Cell px={2} py={4} maxW="180px" whiteSpace="pre-wrap" overflowWrap="anywhere">
                  {scenario.scenarioKey ?? (
                    <Text as="span" color="text.muted">
                      —
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell {...TABLE_CELL_PADDING}>
                  <ChakraLink asChild fontWeight="semibold" color="text.main" lineClamp={2}>
                    <RouterLink to={getTestScenarioDetailPath(scenario.id)}>{scenario.title}</RouterLink>
                  </ChakraLink>
                </Table.Cell>
                <Table.Cell
                  {...TABLE_CELL_PADDING}
                  maxW="320px"
                  whiteSpace="pre-wrap"
                  overflowWrap="anywhere"
                  color="text.secondary"
                >
                  {scenario.details ?? 'No details'}
                </Table.Cell>
                {showFolder &&
                  (() => {
                    const folderPath = scenario.folderId
                      ? (folderPathById.get(scenario.folderId) ?? scenario.folderName ?? 'Unknown folder')
                      : 'Unfiled';
                    return (
                      <Table.Cell px={2} py={4} w="180px" maxW="180px">
                        <Tooltip content={folderPath} openDelay={300} closeDelay={100}>
                          <Text
                            display="block"
                            maxW="148px"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            whiteSpace="nowrap"
                            title={folderPath}
                          >
                            {folderPath}
                          </Text>
                        </Tooltip>
                      </Table.Cell>
                    );
                  })()}
                <Table.Cell {...TABLE_CELL_PADDING}>
                  <VStack align="start" gap={0}>
                    <Text>{scenario.createdBy.name}</Text>
                    <Text color="text.secondary" fontSize="sm" overflowWrap="anywhere">
                      {scenario.createdBy.email}
                    </Text>
                  </VStack>
                </Table.Cell>
                <Table.Cell px={1} py={4} color="text.secondary" fontSize="sm">
                  <ScenarioTimestamp timestamp={scenario.createdAt} />
                </Table.Cell>
                <Table.Cell px={1} py={4} color="text.secondary" fontSize="sm">
                  <ScenarioTimestamp timestamp={scenario.updatedAt} />
                </Table.Cell>
                <Table.Cell px={0} py={4} textAlign="start" w="35px">
                  <ContextMenuButton
                    aria-label={`Actions for ${scenario.title}`}
                    onClick={(event) => onContextMenu?.(event, scenario)}
                  />
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

const PaginationSummary = ({ pagination }: { pagination: TestScenarioPagination }) => {
  const firstItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const lastItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <HStack justify="flex-end" align="center" gap={4} flexWrap="wrap" w="100%">
      <Text color="text.secondary" fontSize="sm" textAlign="right">
        Showing {firstItem}-{lastItem} of {pagination.total} Test Scenarios
      </Text>
    </HStack>
  );
};

export const TestScenarioCatalogView = memo(function TestScenarioCatalogView({
  projectId,
  scenarios,
  pagination,
  isLoading,
  error,
  onPageChange,
  onCreateScenario,
  onContextMenu: onContextMenuOverride,
  search,
  onSearchChange,
  sort,
  sortDirection,
  onSortChange,
  columnFilters,
  onColumnFilterChange,
  scope,
  onScopeChange,
  folders,
  suites,
  organizationLoading,
  organizationError,
  selectedIds,
  toggleSelected,
  selectOnlyScenario,
  onMoveSelected,
  onAddSelectedToSuite,
  onRemoveSelectedFromSuite,
  onReorderSuite,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onCreateSuite,
  onUpdateSuite,
  onDeleteSuite,
  includeDescendants,
  onIncludeDescendantsChange,
}: TestScenarioCatalogViewProps) {
  const [createDialog, setCreateDialog] = useState<'folder' | 'suite' | 'rename-folder' | 'edit-suite' | 'move-folder' | 'delete-folder' | 'delete-suite' | null>(null);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  useEffect(() => {
    if (!openFilter) return;
    const handleOutsidePointerDown = (event: PointerEvent) => {
      const filterElement = document.querySelector(`[data-filter-field="${openFilter}"]`);
      if (filterElement && !filterElement.contains(event.target as Node)) setOpenFilter(null);
    };
    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => document.removeEventListener('pointerdown', handleOutsidePointerDown);
  }, [openFilter]);
  const [targetFolder, setTargetFolder] = useState<CatalogFolder | null>(null);
  const [targetSuite, setTargetSuite] = useState<CatalogSuite | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(() => new Set());
  const [moveParentId, setMoveParentId] = useState('');
  const [deleteDisposition, setDeleteDisposition] = useState<'parent' | 'unfiled'>('parent');
  const [bulkSuiteId, setBulkSuiteId] = useState('');
  const [moveScenariosOpen, setMoveScenariosOpen] = useState(false);
  const [moveScenariosTarget, setMoveScenariosTarget] = useState('');
  const [moveScenariosError, setMoveScenariosError] = useState<string | null>(null);
  const [isMovingScenarios, setIsMovingScenarios] = useState(false);
  const [addToSuiteOpen, setAddToSuiteOpen] = useState(false);
  const [addToSuiteError, setAddToSuiteError] = useState<string | null>(null);
  const [isAddingToSuite, setIsAddingToSuite] = useState(false);
  const [removeFromSuiteOpen, setRemoveFromSuiteOpen] = useState(false);
  const [removeFromSuiteError, setRemoveFromSuiteError] = useState<string | null>(null);
  const [isRemovingFromSuite, setIsRemovingFromSuite] = useState(false);
  const requestRemoveFromSuite = useCallback((scenario: Pick<TestScenarioSummary, 'id' | 'title'>) => {
    selectOnlyScenario?.(scenario.id);
    setRemoveFromSuiteError(null);
    setRemoveFromSuiteOpen(true);
  }, [selectOnlyScenario]);
  const suiteAwareContextMenu = useTestScenarioContextMenu(projectId, scope.kind === 'suite' ? requestRemoveFromSuite : undefined);
  const onContextMenu = onContextMenuOverride ?? suiteAwareContextMenu;
  const [addScenariosToSuiteOpen, setAddScenariosToSuiteOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createPurpose, setCreatePurpose] = useState('');
  const [createRelease, setCreateRelease] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const folderRows = flattenFolders(folders);
  const showFolderColumn = scope.kind === 'all' || scope.kind === 'suite' || (scope.kind === 'folder' && includeDescendants);
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
  const selectedFolder = scope.kind === 'folder' ? folderRows.find((folder) => folder.id === scope.id) : undefined;
  const selectedSuite = scope.kind === 'suite' ? suites.find((suite) => suite.id === scope.id) : undefined;
  const activeColumnFilters = (Object.entries(columnFilters) as Array<[keyof typeof columnFilters, string]>)
    .filter(([, value]) => value.trim().length > 0);
  const filterLabels: Record<keyof typeof columnFilters, string> = {
    scenarioKey: 'Scenario key', title: 'Title', details: 'Details', folder: 'Folder', createdBy: 'Created by',
  };
  const breadcrumbs = selectedFolder ? [...folderRows.filter((folder) => {
    let current: (typeof folderRows)[number] | undefined = selectedFolder;
    while (current) {
      if (current.id === folder.id) return true;
      current = folderRows.find((candidate) => candidate.id === current?.parentId);
    }
    return false;
  })].sort((a, b) => a.depth - b.depth) : [];
  const openCreateDialog = (kind: 'folder' | 'suite') => {
    setCreateName('');
    setCreatePurpose('');
    setCreateRelease('');
    setCreateDescription('');
    setCreateError(null);
    setCreateDialog(kind);
  };
  const openEditFolderDialog = (folder: CatalogFolder | undefined = selectedFolder) => {
    if (!folder) return;
    setTargetFolder(folder);
    setCreateName(folder.name);
    setCreatePurpose('');
    setCreateRelease('');
    setCreateDescription('');
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
    setTargetFolder(folder);
    setMoveParentId(folder.parentId ?? '');
    setDeleteDisposition('parent');
    setCreateError(null);
    setCreateDialog(kind);
  };
  const toggleFolderExpanded = (folderId: string) => {
    setExpandedFolderIds((current) => {
      const next = new Set(current);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };
  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!createDialog || isCreating || (!['delete-folder', 'delete-suite'].includes(createDialog) && !createName.trim())) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      if (createDialog === 'folder') {
        await onCreateFolder(createName.trim(), selectedFolder?.id ?? null);
      } else if (createDialog === 'suite') {
        await onCreateSuite({
          name: createName.trim(),
          purpose: createPurpose.trim() || undefined,
          release: createRelease.trim() || undefined,
          description: createDescription.trim() || undefined,
        });
      } else if (createDialog === 'rename-folder' && targetFolder) {
        await onUpdateFolder(targetFolder.id, { name: createName.trim() });
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
        await onDeleteFolder(targetFolder.id, deleteDisposition);
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
  const submitMoveScenarios = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isMovingScenarios || selectedIds.length === 0) return;
    setIsMovingScenarios(true);
    setMoveScenariosError(null);
    try {
      await onMoveSelected(moveScenariosTarget === UNFILED_DESTINATION ? null : moveScenariosTarget);
      setMoveScenariosOpen(false);
    } catch (error) {
      setMoveScenariosError(getActionErrorMessage(error));
    } finally {
      setIsMovingScenarios(false);
    }
  };
  const submitAddToSuite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bulkSuiteId || isAddingToSuite || selectedIds.length === 0) return;
    setIsAddingToSuite(true);
    setAddToSuiteError(null);
    try {
      await onAddSelectedToSuite(bulkSuiteId);
      setAddToSuiteOpen(false);
    } catch (error) {
      setAddToSuiteError(getActionErrorMessage(error));
    } finally {
      setIsAddingToSuite(false);
    }
  };
  const submitRemoveFromSuite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isRemovingFromSuite || selectedIds.length === 0) return;
    setIsRemovingFromSuite(true);
    setRemoveFromSuiteError(null);
    try {
      await onRemoveSelectedFromSuite();
      setRemoveFromSuiteOpen(false);
    } catch (error) {
      setRemoveFromSuiteError(getActionErrorMessage(error));
    } finally {
      setIsRemovingFromSuite(false);
    }
  };
  const clearSelection = () => selectedIds.forEach((id) => toggleSelected(id));
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
  const renderFolder = (folder: CatalogFolder): ReactNode => {
    const children = getFolderChildren(folder);
    const siblings = folderRows.filter((item) => item.parentId === folder.parentId);
    const folderIndex = siblings.findIndex((item) => item.id === folder.id);
    const expanded = expandedFolderIds.has(folder.id);
    const selected = scope.kind === 'folder' && scope.id === folder.id;
    return (
      <Box key={folder.id}>
        <HStack gap={0}>
          {children.length ? <IconButton size="xs" w="4" minW="4" flexShrink={0} variant="ghost" aria-label={`${expanded ? 'Collapse' : 'Expand'} ${folder.name}`} onClick={() => toggleFolderExpanded(folder.id)}>{expanded ? <FiChevronDown /> : <FiChevronRight />}</IconButton> : <Box w="4" flexShrink={0} />}
          <Button flex="1" minW="0" size="sm" px={2} ps={1} variant={selected ? 'subtle' : 'ghost'} colorPalette={selected ? 'blue' : undefined} borderStartWidth="3px" borderStartColor={selected ? 'blue.500' : 'transparent'} justifyContent="flex-start" aria-current={selected ? 'page' : undefined} onClick={() => onScopeChange({ kind: 'folder', id: folder.id })}>
            <FiFolder /><Text flex="1" textAlign="left" lineClamp={1}>{folder.name}</Text><Text color="text.muted" fontSize="xs">{folderScenarioCounts.get(folder.id) ?? folder.scenarioCount}</Text>
          </Button>
          <Menu.Root>
            <Menu.Trigger asChild><IconButton size="xs" variant="ghost" color="text.muted" aria-label={`Actions for folder ${folder.name}`}><FiMoreHorizontal /></IconButton></Menu.Trigger>
            <Menu.Positioner><Menu.Content>
              <Menu.Item value="rename" onClick={() => openEditFolderDialog(folder)}>Rename</Menu.Item>
              <Menu.Item value="move" onClick={() => openFolderActionDialog('move-folder', folder)}>Move</Menu.Item>
              <Menu.Item value="move-up" disabled={folderIndex <= 0} onClick={() => void reorderFolder(folder, -1)}>Move up</Menu.Item>
              <Menu.Item value="move-down" disabled={folderIndex < 0 || folderIndex >= siblings.length - 1} onClick={() => void reorderFolder(folder, 1)}>Move down</Menu.Item>
              <Menu.Item value="delete" color="fg.error" onClick={() => openFolderActionDialog('delete-folder', folder)}>Delete</Menu.Item>
            </Menu.Content></Menu.Positioner>
          </Menu.Root>
        </HStack>
        {expanded && children.map((child) => <Box key={child.id} ps={4}>{renderFolder(child)}</Box>)}
      </Box>
    );
  };
  return (
    <Wrap my={4} mx={6} p={{ base: 3, md: 5 }}>
      <VStack align="stretch" gap={5} w="100%">
        <Grid
          templateColumns={{ base: '1fr', lg: '250px minmax(0, 1fr)' }}
          gap={{ base: 4, lg: 6 }}
          alignItems="stretch"
        >
          <VStack
            align="stretch"
            gap={4}
            pe={{ base: 0, lg: 4 }}
            borderEndWidth={{ base: 0, lg: '1px' }}
            borderColor="border.main"
            aria-label="Scenario organization"
          >
            <VStack align="stretch" gap={1}>
              <Button
                size="sm"
                justifyContent="flex-start"
                variant={scope.kind === 'all' ? 'subtle' : 'ghost'}
                colorPalette={scope.kind === 'all' ? 'blue' : undefined}
                borderStartWidth="3px"
                borderStartColor={scope.kind === 'all' ? 'blue.500' : 'transparent'}
                aria-current={scope.kind === 'all' ? 'page' : undefined}
                onClick={() => onScopeChange({ kind: 'all' })}
              >
                <FiLayers />
                All scenarios
                {scope.kind === 'all' && (
                  <Text ml="auto" color="text.muted" fontSize="xs">
                    {pagination.total}
                  </Text>
                )}
              </Button>
              <Button
                size="sm"
                justifyContent="flex-start"
                variant={scope.kind === 'unfiled' ? 'subtle' : 'ghost'}
                colorPalette={scope.kind === 'unfiled' ? 'blue' : undefined}
                borderStartWidth="3px"
                borderStartColor={scope.kind === 'unfiled' ? 'blue.500' : 'transparent'}
                aria-current={scope.kind === 'unfiled' ? 'page' : undefined}
                onClick={() => onScopeChange({ kind: 'unfiled' })}
              >
                <FiFolder />
                Unfiled
              </Button>
            </VStack>
            <Box>
              <HStack justify="space-between" px={2} mb={1}>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  letterSpacing="wider"
                  color="text.muted"
                  textTransform="uppercase"
                >
                  Folders
                </Text>
                <IconButton
                  size="xs"
                  variant="ghost"
                  aria-label={selectedFolder ? 'Create subfolder' : 'Create folder'}
                  title={selectedFolder ? 'Create inside selected folder' : 'Create folder'}
                  onClick={() => openCreateDialog('folder')}
                >
                  <FiPlus />
                </IconButton>
              </HStack>
              {organizationLoading ? (
                <Text px={2} color="text.muted" fontSize="sm">
                  Loading folders…
                </Text>
              ) : organizationError ? (
                <Text px={2} color="fg.error" fontSize="sm" role="alert">
                  Folders could not be loaded.
                </Text>
              ) : folders.length === 0 ? (
                <Text px={2} color="text.muted" fontSize="sm">
                  No folders yet
                </Text>
              ) : (
                <VStack align="stretch" gap={0}>
                  {folders.map(renderFolder)}
                </VStack>
              )}
            </Box>
            <Box>
              <HStack justify="space-between" px={2} mb={1}>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  letterSpacing="wider"
                  color="text.muted"
                  textTransform="uppercase"
                >
                  Suites
                </Text>
                <IconButton
                  size="xs"
                  variant="ghost"
                  aria-label="Create suite"
                  onClick={() => openCreateDialog('suite')}
                >
                  <FiPlus />
                </IconButton>
              </HStack>
              {organizationLoading ? (
                <Text px={2} color="text.muted" fontSize="sm">
                  Loading suites…
                </Text>
              ) : organizationError ? (
                <Text px={2} color="fg.error" fontSize="sm" role="alert">
                  Suites could not be loaded.
                </Text>
              ) : suites.length === 0 ? (
                <Text px={2} color="text.muted" fontSize="sm">
                  No suites yet
                </Text>
              ) : (
                <VStack align="stretch" gap={0}>
                  {suites.map((suite) => {
                    const selected = scope.kind === 'suite' && scope.id === suite.id;
                    return (
                      <Button
                        key={suite.id}
                        size="sm"
                        variant={selected ? 'subtle' : 'ghost'}
                        colorPalette={selected ? 'blue' : undefined}
                        borderStartWidth="3px"
                        borderStartColor={selected ? 'blue.500' : 'transparent'}
                        justifyContent="flex-start"
                        aria-current={selected ? 'page' : undefined}
                        onClick={() => onScopeChange({ kind: 'suite', id: suite.id })}
                      >
                        <FiLayers />
                        <Text flex="1" textAlign="left" lineClamp={1}>
                          {suite.name}
                        </Text>
                        <Text color="text.muted" fontSize="xs">
                          {suite.members?.length ?? 0}
                        </Text>
                      </Button>
                    );
                  })}
                </VStack>
              )}
            </Box>
          </VStack>

          <VStack align="stretch" gap={4} minW="0">
            <Box>
              {selectedFolder && (
                <HStack aria-label="Folder breadcrumbs" mb={2} gap={1} flexWrap="wrap">
                  <Button size="xs" variant="ghost" onClick={() => onScopeChange({ kind: 'all' })}>
                    All scenarios
                  </Button>
                  {breadcrumbs.map((folder) => (
                    <HStack key={folder.id} gap={1}>
                      <Text color="text.muted">/</Text>
                      <Button
                        size="xs"
                        variant="ghost"
                        aria-current={folder.id === selectedFolder.id ? 'page' : undefined}
                        onClick={() => onScopeChange({ kind: 'folder', id: folder.id })}
                      >
                        {folder.name}
                      </Button>
                    </HStack>
                  ))}
                </HStack>
              )}
              <HStack justify="space-between" align="start" gap={3} flexWrap="wrap">
                <Box>
                  <Heading fontSize="lg">
                    {selectedFolder?.name ??
                      selectedSuite?.name ??
                      (scope.kind === 'unfiled' ? 'Unfiled scenarios' : 'All scenarios')}
                  </Heading>
                  <Text mt={1} color="text.muted" fontSize="sm">
                    {selectedFolder
                      ? `${pagination.total} scenarios${includeDescendants ? ' in this folder and subfolders' : ' directly in this folder'}`
                      : selectedSuite
                        ? `${selectedSuite.members?.length ?? 0} scenarios${selectedSuite.release ? ` · ${selectedSuite.release}` : ''}`
                        : `${pagination.total} scenarios`}
                  </Text>
                </Box>
                {selectedFolder && (
                  <Menu.Root>
                    <Menu.Trigger asChild>
                      <Button size="sm" variant="outline">
                        Folder actions
                        <FiMoreHorizontal />
                      </Button>
                    </Menu.Trigger>
                    <Menu.Positioner>
                      <Menu.Content>
                        <Menu.Item value="rename" onClick={() => openEditFolderDialog(selectedFolder)}>
                          Rename
                        </Menu.Item>
                        <Menu.Item value="move" onClick={() => openFolderActionDialog('move-folder', selectedFolder)}>
                          Move
                        </Menu.Item>
                        <Menu.Item
                          value="delete"
                          color="fg.error"
                          onClick={() => openFolderActionDialog('delete-folder', selectedFolder)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Content>
                    </Menu.Positioner>
                  </Menu.Root>
                )}
                {selectedSuite && (
                  <HStack>
                    <Button size="sm" variant="outline" onClick={() => setAddScenariosToSuiteOpen(true)}>
                      <FiPlus />
                      Add scenarios
                    </Button>
                    <Menu.Root>
                      <Menu.Trigger asChild>
                        <IconButton aria-label="Suite actions" variant="ghost">
                          <FiMoreHorizontal />
                        </IconButton>
                      </Menu.Trigger>
                      <Menu.Positioner>
                        <Menu.Content>
                          <Menu.Item value="edit" onClick={openEditSuiteDialog}>
                            <HStack justify="space-between" w="full">
                              <Text>Edit suite</Text>
                              <FiEdit aria-hidden="true" />
                            </HStack>
                          </Menu.Item>
                          <Menu.Item
                            value="delete"
                            color="fg.error"
                            onClick={() => {
                              setTargetSuite(selectedSuite);
                              setCreateError(null);
                              setCreateDialog('delete-suite');
                            }}
                          >
                            <HStack justify="space-between" w="full">
                              <Text>Delete suite</Text>
                              <FiTrash2 aria-hidden="true" />
                            </HStack>
                          </Menu.Item>
                        </Menu.Content>
                      </Menu.Positioner>
                    </Menu.Root>
                  </HStack>
                )}
                <Button aria-label="Create Test Scenario" variant="primary" onClick={onCreateScenario}>
                  <FiPlus />
                  Create scenario
                </Button>
              </HStack>
            </Box>

            <VStack align="stretch" gap={2}>
              <HStack gap={2} flexWrap="wrap">
                <Box
                  position="relative"
                  flex={{ base: '1 1 100%', md: '0 1 260px' }}
                  w={{ base: '100%', md: '260px' }}
                  maxW="100%"
                >
                  <Box
                    position="absolute"
                    insetStart={3}
                    top="50%"
                    transform="translateY(-50%)"
                    color="text.muted"
                    pointerEvents="none"
                  >
                    <FiSearch />
                  </Box>
                  <Input
                    aria-label="Search scenarios"
                    placeholder="Search title or scenario key"
                    value={search}
                    onChange={(event) => onSearchChange(event.currentTarget.value)}
                    ps={9}
                    pe={search ? 9 : 3}
                    bg="bg.card"
                  />
                  {search && (
                    <IconButton
                      position="absolute"
                      insetEnd={1}
                      top="50%"
                      transform="translateY(-50%)"
                      size="xs"
                      variant="ghost"
                      aria-label="Clear scenario search"
                      onClick={() => onSearchChange('')}
                    >
                      <FiX />
                    </IconButton>
                  )}
                </Box>
                {(search.trim() || activeColumnFilters.length > 0) && (
                  <Text fontSize="xs" color="text.muted">
                    {activeColumnFilters.length + Number(Boolean(search.trim()))} search{' '}
                    {activeColumnFilters.length + Number(Boolean(search.trim())) === 1 ? 'term' : 'terms'} active
                  </Text>
                )}
              </HStack>
              {(activeColumnFilters.length > 0 || search.trim()) && (
                <HStack gap={2} flexWrap="wrap" aria-label="Active scenario filters">
                  {search.trim() && (
                    <Button
                      size="xs"
                      variant="subtle"
                      colorPalette="blue"
                      borderRadius="full"
                      onClick={() => onSearchChange('')}
                    >
                      All fields: {search}
                      <FiX aria-hidden="true" />
                    </Button>
                  )}
                  {activeColumnFilters.map(([field, value]) => (
                    <Button
                      key={field}
                      size="xs"
                      variant="subtle"
                      colorPalette="blue"
                      borderRadius="full"
                      onClick={() => onColumnFilterChange(field, '')}
                    >
                      {filterLabels[field]}: {value}
                      <FiX aria-hidden="true" />
                    </Button>
                  ))}
                  {activeColumnFilters.length + Number(Boolean(search.trim())) > 1 && (
                    <Button
                      size="xs"
                      variant="ghost"
                      color="text.muted"
                      onClick={() => {
                        activeColumnFilters.forEach(([field]) => onColumnFilterChange(field, ''));
                        onSearchChange('');
                      }}
                    >
                      Clear all
                    </Button>
                  )}
                </HStack>
              )}
            </VStack>

            {selectedSuite?.members && selectedSuite.members.length > 0 && (
              <Collapsible.Root>
                <Collapsible.Trigger asChild>
                  <Button variant="ghost" size="sm" alignSelf="flex-start">
                    Manage suite order ({selectedSuite.members.length})<FiChevronDown />
                  </Button>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <VStack
                    align="stretch"
                    gap={1}
                    p={3}
                    mt={2}
                    borderWidth="1px"
                    borderColor="border.main"
                    borderRadius="md"
                    maxH="240px"
                    overflowY="auto"
                  >
                    {selectedSuite.members.map((member, index, members) => (
                      <HStack key={member.testScenarioId}>
                        <Text flex="1" fontSize="sm" lineClamp={1}>
                          {index + 1}.{' '}
                          {scenarios.find((scenario) => scenario.id === member.testScenarioId)?.title ??
                            member.testScenarioId}
                        </Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          aria-label={`Move member ${index + 1} up`}
                          disabled={index === 0}
                          onClick={() => {
                            const ids = members.map((item) => item.testScenarioId);
                            [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
                            void onReorderSuite(selectedSuite.id, ids).catch((error: unknown) =>
                              window.alert(String(error)),
                            );
                          }}
                        >
                          ↑
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          aria-label={`Move member ${index + 1} down`}
                          disabled={index === members.length - 1}
                          onClick={() => {
                            const ids = members.map((item) => item.testScenarioId);
                            [ids[index + 1], ids[index]] = [ids[index], ids[index + 1]];
                            void onReorderSuite(selectedSuite.id, ids).catch((error: unknown) =>
                              window.alert(String(error)),
                            );
                          }}
                        >
                          ↓
                        </Button>
                      </HStack>
                    ))}
                  </VStack>
                </Collapsible.Content>
              </Collapsible.Root>
            )}

            {scope.kind === 'folder' && (
              <HStack align="end" gap={3} flexWrap="wrap">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 40 }}>
                  <input
                    type="checkbox"
                    checked={includeDescendants}
                    onChange={(event) => onIncludeDescendantsChange(event.currentTarget.checked)}
                  />
                  Include subfolders
                </label>
              </HStack>
            )}
            {selectedIds.length > 0 && (
              <HStack
                flexWrap="wrap"
                gap={2}
                p={3}
                bg="bg.subtle"
                borderRadius="md"
                borderStartWidth="3px"
                borderStartColor="border.focus"
                aria-label="Bulk scenario actions"
              >
                <Text fontWeight="semibold" whiteSpace="nowrap">
                  {selectedIds.length} selected
                </Text>
                <Button size="sm" variant="ghost" onClick={clearSelection}>
                  Clear selection
                </Button>
                <Box flex="1" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setMoveScenariosTarget('');
                    setMoveScenariosError(null);
                    setMoveScenariosOpen(true);
                  }}
                >
                  Move…
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={suites.length === 0}
                  onClick={() => {
                    setBulkSuiteId('');
                    setAddToSuiteError(null);
                    setAddToSuiteOpen(true);
                  }}
                >
                  Add to suite…
                </Button>
                {scope.kind === 'suite' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRemoveFromSuiteError(null);
                      setRemoveFromSuiteOpen(true);
                    }}
                  >
                    Remove from suite
                  </Button>
                )}
                {selectedIds.length >= 100 && (
                  <Text role="status" color="text.muted" fontSize="sm">
                    Limit reached: 100 scenarios per action.
                  </Text>
                )}
              </HStack>
            )}

            <Box borderWidth="1px" borderColor="border.main" borderRadius="lg" overflow="hidden" bg="bg.card">
              {error ? (
                <Box p={4}>
                  <ErrorState />
                </Box>
              ) : (
                <>
                  <ScenarioTable
                    scenarios={scenarios}
                    isLoading={isLoading}
                    selectedIds={selectedIds}
                    onToggleSelected={toggleSelected}
                    onContextMenu={onContextMenu}
                    showFolder={showFolderColumn}
                    folderPathById={folderPathById}
                    sort={sort}
                    sortDirection={sortDirection}
                    onSortChange={onSortChange}
                    columnFilters={columnFilters}
                    onColumnFilterChange={onColumnFilterChange}
                    openFilter={openFilter}
                    onFilterDisclosureChange={setOpenFilter}
                    searchActive={Boolean(search.trim()) || activeColumnFilters.length > 0}
                  />
                  {scenarios.length > 0 && (
                    <HStack
                      justify="space-between"
                      flexWrap="wrap"
                      p={3}
                      borderTopWidth="1px"
                      borderColor="border.main"
                    >
                      <PaginationSummary pagination={pagination} />
                      {pagination.totalPages > 1 && (
                        <Box as="nav" aria-label="Test Scenario pagination">
                          <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={onPageChange}
                          />
                        </Box>
                      )}
                    </HStack>
                  )}
                </>
              )}
            </Box>
          </VStack>
        </Grid>
      </VStack>
      {addScenariosToSuiteOpen && selectedSuite && projectId && (
        <TestSuiteAddScenariosDialogContainer
          projectId={projectId}
          suite={selectedSuite}
          folderOptions={folderRows.map(({ id, name, depth }) => ({ id, name, depth }))}
          onClose={() => setAddScenariosToSuiteOpen(false)}
        />
      )}
      {moveScenariosOpen && (
        <Dialog
          title={`Move ${selectedIds.length} scenario${selectedIds.length === 1 ? '' : 's'}`}
          onClose={() => setMoveScenariosOpen(false)}
        >
          <form onSubmit={(event) => void submitMoveScenarios(event)}>
            <DialogBody>
              <VStack align="stretch" gap={4}>
                <Text color="text.secondary">Choose where to move the selected scenarios.</Text>
                <NativeSelect
                  label="Destination folder"
                  placeholder="Choose destination"
                  value={moveScenariosTarget}
                  onChange={(event) => setMoveScenariosTarget(event.currentTarget.value)}
                >
                  <option value={UNFILED_DESTINATION}>Unfiled</option>
                  {folderRows.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {'　'.repeat(folder.depth)}
                      {folder.name}
                    </option>
                  ))}
                </NativeSelect>
                {moveScenariosError && (
                  <Text role="alert" color="fg.error">
                    {moveScenariosError}
                  </Text>
                )}
              </VStack>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setMoveScenariosOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isMovingScenarios}
                disabled={!moveScenariosTarget || isMovingScenarios}
              >
                Move {selectedIds.length} scenario{selectedIds.length === 1 ? '' : 's'}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}
      {addToSuiteOpen && (
        <Dialog
          title={`Add ${selectedIds.length} scenario${selectedIds.length === 1 ? '' : 's'} to suite`}
          onClose={() => setAddToSuiteOpen(false)}
        >
          <form onSubmit={(event) => void submitAddToSuite(event)}>
            <DialogBody>
              <VStack align="stretch" gap={4}>
                <Text color="text.secondary">Choose the suite that should include the selected scenarios.</Text>
                <NativeSelect
                  label="Suite"
                  value={bulkSuiteId}
                  onChange={(event) => setBulkSuiteId(event.currentTarget.value)}
                >
                  <option value="">Select a suite</option>
                  {suites.map((suite) => (
                    <option key={suite.id} value={suite.id}>
                      {suite.name}
                      {suite.release ? ` · ${suite.release}` : ''}
                    </option>
                  ))}
                </NativeSelect>
                {addToSuiteError && (
                  <Text role="alert" color="fg.error">
                    {addToSuiteError}
                  </Text>
                )}
              </VStack>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setAddToSuiteOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isAddingToSuite}
                disabled={!bulkSuiteId || isAddingToSuite}
              >
                Add to suite
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}
      {removeFromSuiteOpen && (
        <Dialog
          title={`Remove ${selectedIds.length} scenario${selectedIds.length === 1 ? '' : 's'} from suite`}
          onClose={() => setRemoveFromSuiteOpen(false)}
        >
          <form onSubmit={(event) => void submitRemoveFromSuite(event)}>
            <DialogBody>
              <VStack align="stretch" gap={4}>
                <Text color="text.secondary">The selected scenarios will remain in the project and other suites.</Text>
                {removeFromSuiteError && (
                  <Text role="alert" color="fg.error">
                    {removeFromSuiteError}
                  </Text>
                )}
              </VStack>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setRemoveFromSuiteOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isRemovingFromSuite}
                disabled={isRemovingFromSuite || selectedIds.length === 0}
              >
                Remove {selectedIds.length} scenario{selectedIds.length === 1 ? '' : 's'}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}
      {createDialog && (
        <Dialog
          title={
            createDialog === 'folder'
              ? selectedFolder
                ? `Create folder inside ${selectedFolder.name}`
                : 'Create folder'
              : createDialog === 'suite'
                ? 'Create suite'
                : createDialog === 'rename-folder'
                  ? 'Rename folder'
                  : createDialog === 'edit-suite'
                    ? 'Edit suite'
                    : createDialog === 'move-folder'
                      ? `Move ${targetFolder?.name ?? 'folder'}`
                      : createDialog === 'delete-folder'
                        ? 'Delete folder'
                        : 'Delete suite'
          }
          onClose={() => setCreateDialog(null)}
        >
          <form onSubmit={(event) => void submitCreate(event)}>
            <DialogBody>
              <VStack align="stretch" gap={4}>
                {['folder', 'suite', 'rename-folder', 'edit-suite'].includes(createDialog) && (
                  <label>
                    <Text mb={1}>Name</Text>
                    <Input
                      autoFocus
                      required
                      maxLength={120}
                      value={createName}
                      onChange={(event) => setCreateName(event.currentTarget.value)}
                      bg={createDialog === 'edit-suite' ? 'bg.card' : undefined}
                    />
                  </label>
                )}
                {(createDialog === 'suite' || createDialog === 'edit-suite') && (
                  <>
                    <label>
                      <Text mb={1}>Purpose (optional)</Text>
                      <Input
                        value={createPurpose}
                        onChange={(event) => setCreatePurpose(event.currentTarget.value)}
                        bg={createDialog === 'edit-suite' ? 'bg.card' : undefined}
                      />
                    </label>
                    <label>
                      <Text mb={1}>Release (optional)</Text>
                      <Input
                        value={createRelease}
                        onChange={(event) => setCreateRelease(event.currentTarget.value)}
                        bg={createDialog === 'edit-suite' ? 'bg.card' : undefined}
                      />
                    </label>
                    <label>
                      <Text mb={1}>Description (optional)</Text>
                      <Textarea
                        value={createDescription}
                        onChange={(event) => setCreateDescription(event.currentTarget.value)}
                        bg={createDialog === 'edit-suite' ? 'bg.card' : undefined}
                      />
                    </label>
                  </>
                )}
                {createDialog === 'move-folder' && targetFolder && (
                  <NativeSelect
                    label="Parent folder"
                    value={moveParentId}
                    onChange={(event) => setMoveParentId(event.currentTarget.value)}
                  >
                    <option value="">Root level</option>
                    {folderRows
                      .filter((folder) => !isInFolderSubtree(folder.id, targetFolder.id))
                      .map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {'　'.repeat(folder.depth)}
                          {folder.name}
                        </option>
                      ))}
                  </NativeSelect>
                )}
                {createDialog === 'delete-folder' && targetFolder && (
                  <>
                    <Text>
                      Direct scenarios will move to the selected destination. Child folders will be promoted to this
                      folder’s parent.
                    </Text>
                    <NativeSelect
                      label="Move direct scenarios to"
                      value={deleteDisposition}
                      onChange={(event) => setDeleteDisposition(event.currentTarget.value as 'parent' | 'unfiled')}
                    >
                      <option value="parent">Parent folder</option>
                      <option value="unfiled">Unfiled</option>
                    </NativeSelect>
                  </>
                )}
                {createDialog === 'delete-suite' && (
                  <Text>Delete “{targetSuite?.name}”? Its scenarios will remain unchanged.</Text>
                )}
                {createError && (
                  <Text role="alert" color="fg.error">
                    {createError}
                  </Text>
                )}
              </VStack>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateDialog(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={['delete-folder', 'delete-suite'].includes(createDialog) ? 'solid' : 'primary'}
                colorPalette={['delete-folder', 'delete-suite'].includes(createDialog) ? 'red' : undefined}
                disabled={
                  isCreating ||
                  (['folder', 'suite', 'rename-folder', 'edit-suite'].includes(createDialog) && !createName.trim())
                }
                loading={isCreating}
              >
                {createDialog === 'folder' || createDialog === 'suite'
                  ? 'Create'
                  : createDialog === 'move-folder'
                    ? 'Move'
                    : ['delete-folder', 'delete-suite'].includes(createDialog)
                      ? 'Delete'
                      : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}
    </Wrap>
  );
});
