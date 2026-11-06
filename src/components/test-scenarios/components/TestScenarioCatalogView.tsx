// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import {
  memo,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from 'react';
import {
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  Link as ChakraLink,
  Menu,
  Portal,
  Popover,
  Table,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import {
  FiArrowDown,
  FiArrowUp,
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
  FiFolder,
  FiFolderPlus,
  FiLayers,
  FiList,
  FiMinusCircle,
  FiMoreHorizontal,
  FiMove,
  FiPlus,
  FiPlay,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { Link as RouterLink } from 'react-router';

import {
  Alert,
  Dialog,
  DialogBody,
  DialogFooter,
  NativeSelect,
  Tooltip,
  Wrap,
} from '@/components/ui';
import { extractApiError } from '@/utils/apiErrors';
import type {
  PostApiV2TestSuitesBySuiteIdMembershipChangesApiResponse,
  PostApiV2TestSuitesMovesApiResponse,
  DeleteApiV2TestScenarioFoldersByFolderIdApiResponse,
  PostApiV2TestScenarioFoldersRestorationApiArg,
} from '@/redux/apis/generatedApi';

import { TestSuiteAddScenariosDialogContainer } from '../containers/TestSuiteAddScenariosDialogContainer';
import { SuitePicker } from './SuitePicker';
import { getTestScenarioDetailPath } from '../constants';
import type { ScenarioOperationReport } from '../utils';
import type { TestScenarioPagination, TestScenarioSummary } from '../types';

type SuiteMembershipUndo = Pick<PostApiV2TestSuitesBySuiteIdMembershipChangesApiResponse, 'restoreData'> & {
  expectedMembershipRevision: number;
  expectedScenarioIds: string[];
  createdSuiteId?: string;
};
type SuiteMoveUndo = Pick<PostApiV2TestSuitesMovesApiResponse, 'restoreData'> & {
  expectedSourceMembershipRevision: number;
  expectedDestinationMembershipRevision: number;
  expectedSourceScenarioIds: string[];
  expectedDestinationScenarioIds: string[];
  alreadyInDestination: string[];
};

const getMembershipChangeMessage = (addedCount: number, removedCount: number, suiteName: string) => {
  if (addedCount > 0 && removedCount > 0)
    return `${addedCount} scenario${addedCount === 1 ? '' : 's'} added and ${removedCount} removed from ${suiteName}`;
  if (addedCount > 0) return `${addedCount} scenario${addedCount === 1 ? '' : 's'} added to ${suiteName}`;
  return `${removedCount} scenario${removedCount === 1 ? '' : 's'} removed from ${suiteName}`;
};

const CATALOG_TAB = { scenarios: 'scenarios', suites: 'suites' } as const;
const CATALOG_SCOPE = { all: 'all', unfiled: 'unfiled', folder: 'folder', suite: 'suite' } as const;

export interface CatalogFolder {
  id: string;
  name: string;
  parentId: string | null;
  description?: string | null;
  position?: number;
  scenarioCount: number;
  children?: unknown[];
}

const getFolderChildren = (folder: CatalogFolder): CatalogFolder[] =>
  (folder.children ?? []).filter(
    (child): child is CatalogFolder => typeof child === 'object' && child !== null && 'id' in child && 'name' in child,
  );

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
  onMoveSelected: (folderId: string | null) => Promise<ScenarioOperationReport>;
  onMoveScenarioIds: (scenarioIds: string[], folderId: string | null) => Promise<ScenarioOperationReport>;
  restoreFolderDeletion: (restoreData: PostApiV2TestScenarioFoldersRestorationApiArg['body']['restoreData']) => Promise<void>;
  restoreScenarioFolders: (restoreData: NonNullable<ScenarioOperationReport['folderRestoreData']>) => Promise<void>;
  onSuiteOperationStart: () => void;
  onSuiteOperationComplete: (report: ScenarioOperationReport, selection: string[]) => void;
  onDeleteSelected: (scenarioIds: string[]) => Promise<ScenarioOperationReport>;
  onRemoveSelectedFromSuite: () => Promise<ScenarioOperationReport>;
  removeSuiteMembership: (suiteId: string, scenarioIds: string[]) => Promise<SuiteMembershipUndo>;
  restoreSuiteMembership: (undo: SuiteMembershipUndo) => Promise<void>;
  moveSuiteMembership: (sourceSuiteId: string, destinationSuiteId: string, scenarioIds: string[]) => Promise<SuiteMoveUndo>;
  restoreSuiteMove: (undo: SuiteMoveUndo) => Promise<void>;
  refreshSuiteData: () => Promise<void>;
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

const UNFILED_DESTINATION = '__unfiled__';

const UnfiledFolderIcon = () => (
  <svg
    aria-hidden="true"
    width="22"
    height="22"
    style={{ display: 'block', flexShrink: 0 }}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.5 6.5a2 2 0 0 1 2-2h4.8l2.6 2.6h7.6a2 2 0 0 1 2 2v8.4a2 2 0 0 1-2 2H4.5a2 2 0 0 1-2-2z" strokeDasharray="2 2" />
  </svg>
);

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

const EmptyState = ({
  searchActive = false,
  emptySuite = false,
  emptyFolder = false,
  suiteView = false,
  onAddScenarios,
  onCreateScenario,
}: {
  searchActive?: boolean;
  emptySuite?: boolean;
  emptyFolder?: boolean;
  suiteView?: boolean;
  onAddScenarios?: () => void;
  onCreateScenario?: () => void;
}) => (
  <VStack py={8} gap={3}>
    <Text color="text.muted">
      {emptySuite
        ? 'No scenarios in this suite yet'
        : emptyFolder
          ? 'No scenarios in this folder yet'
          : searchActive
            ? suiteView
              ? 'No scenarios in this suite match the search and filters'
              : 'No scenarios match the current folder, search and filters'
            : 'No Test Scenarios are available for this project.'}
    </Text>
    {emptySuite && onAddScenarios && (
      <Button size="sm" variant="outline" onClick={onAddScenarios}>
        Add scenarios
      </Button>
    )}
  </VStack>
);

const ScenarioTable = ({
  scenarios,
  isLoading,
  selectedIds,
  selectionDisabled,
  onToggleSelected,
  showFolder,
  folderPathById,
  searchActive,
  emptySuite,
  onAddScenarios,
  projectId,
  enableSuiteDrag,
  enableSuiteReorder,
  onDragPayload,
  onDragEnd,
  onSuiteRowDrop,
  dragOverScenarioId,
  onSuiteRowDragOver,
}: {
  projectId?: string;
  enableSuiteDrag: boolean;
  enableSuiteReorder: boolean;
  onDragPayload: (projectId: string, scenarioIds: string[]) => void;
  onDragEnd: () => void;
  onSuiteRowDrop: (event: DragEvent<HTMLElement>, scenarioId: string) => void;
  dragOverScenarioId: string | null;
  onSuiteRowDragOver: (event: DragEvent<HTMLElement>, scenarioId: string) => void;
  scenarios: TestScenarioSummary[];
  isLoading: boolean;
  selectedIds: string[];
  selectionDisabled: boolean;
  onToggleSelected: (id: string) => void;
  showFolder: boolean;
  folderPathById: Map<string, string>;
  searchActive: boolean;
  emptySuite: boolean;
  onAddScenarios: () => void;
}) => {
  const [anchorScenarioId, setAnchorScenarioId] = useState<string | null>(null);
  const extendSelectionRef = useRef(false);
  const handleScenarioSelection = (scenarioId: string, index: number, extendSelection: boolean) => {
    const anchorIndex = scenarios.findIndex((scenario) => scenario.id === anchorScenarioId);
    if (extendSelection && anchorIndex >= 0) {
      const [start, end] = [anchorIndex, index].sort((a, b) => a - b);
      scenarios
        .slice(start, end + 1)
        .filter((scenario) => !selectedIds.includes(scenario.id))
        .forEach((scenario) => onToggleSelected(scenario.id));
    } else {
      onToggleSelected(scenarioId);
    }
    setAnchorScenarioId(scenarioId);
  };
  return (
    <Box overflowX="auto">
      <Table.Root size="sm" variant="outline" w="100%" minW="980px" tableLayout="fixed">
        <Table.Header>
          <Table.Row bg="bg.subtle">
            {enableSuiteDrag && <Table.ColumnHeader w="30px" py={2}><Text srOnly>Drag to another suite or reorder</Text></Table.ColumnHeader>}
            <Table.ColumnHeader px={3} py={2} w="44px">
              <input
                type="checkbox"
                aria-label="Select all scenarios on this page"
                disabled={selectionDisabled}
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
            <Table.ColumnHeader w="120px" px={2} py={2}>
              Key
            </Table.ColumnHeader>
            <Table.ColumnHeader px={3} py={2}>
              Title
            </Table.ColumnHeader>
            <Table.ColumnHeader w="110px" px={3} py={2}>
              Priority
            </Table.ColumnHeader>
            {showFolder && (
              <Table.ColumnHeader w="190px" px={3} py={2}>
                Folder
              </Table.ColumnHeader>
            )}
            <Table.ColumnHeader w="120px" px={3} py={2}>
              Updated
            </Table.ColumnHeader>
            <Table.ColumnHeader w="180px" px={3} py={2}>
              Author
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {scenarios.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={6 + Number(showFolder) + Number(enableSuiteDrag)} py={8} textAlign="center">
                {isLoading ? (
                  <Text role="status" color="text.muted">
                    Searching scenarios…
                  </Text>
                ) : (
                  <EmptyState searchActive={searchActive} emptySuite={emptySuite} suiteView={enableSuiteDrag} onAddScenarios={onAddScenarios} />
                )}
              </Table.Cell>
            </Table.Row>
          ) : (
            scenarios.map((scenario, index) => (
              <Table.Row
                key={scenario.id}
                data-testid={`test-scenario-${scenario.id}`}
                bg={
                  dragOverScenarioId === scenario.id
                    ? 'blue.subtle'
                    : selectedIds.includes(scenario.id)
                      ? 'blue.50'
                      : undefined
                }
                _hover={{
                  bg: selectedIds.includes(scenario.id) ? 'blue.50' : 'bg.subtle',
                }}
                onDragOver={enableSuiteReorder ? (event) => onSuiteRowDragOver(event, scenario.id) : undefined}
                onDrop={enableSuiteReorder ? (event) => onSuiteRowDrop(event, scenario.id) : undefined}
                css={enableSuiteReorder && dragOverScenarioId === scenario.id
                  ? { '& > td': { boxShadow: 'inset 0 2px 0 #3182ce' } }
                  : undefined}
                draggable={enableSuiteDrag && !selectionDisabled && Boolean(projectId)}
                onDragStart={enableSuiteDrag ? (event) => {
                  const scenarioIds = selectedIds.includes(scenario.id) ? selectedIds : [scenario.id];
                  onDragPayload(projectId ?? '', scenarioIds);
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('application/x-testportal-scenarios', JSON.stringify({ projectId, scenarioIds }));
                } : undefined}
                onDragEnd={enableSuiteDrag ? onDragEnd : undefined}
              >
                {enableSuiteDrag && (
                  <Table.Cell px={1}>
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      aria-label={`Drag ${scenario.title} to another suite or reorder`}
                      title="Drag to another suite or reorder"
                      disabled={selectionDisabled || !projectId}
                    >
                      ⠿
                    </Button>
                  </Table.Cell>
                )}
                <Table.Cell px={3} py={2}>
                  <input
                    type="checkbox"
                    aria-label={`Select ${scenario.title}`}
                    disabled={selectionDisabled}
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
                <Table.Cell px={2} py={2}>
                  <Tooltip content={scenario.scenarioKey ?? 'N/A'}>
                    <Text display="block" maxW="100%" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {scenario.scenarioKey ?? 'N/A'}
                    </Text>
                  </Tooltip>
                </Table.Cell>
                <Table.Cell px={3} py={2} minW={0} overflow="hidden">
                  <Tooltip content={scenario.title}>
                    <ChakraLink
                      asChild
                      display="block"
                      minW={0}
                      maxW="100%"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      fontWeight="semibold"
                      color="text.main"
                    >
                      <RouterLink to={getTestScenarioDetailPath(scenario.id)}>{scenario.title}</RouterLink>
                    </ChakraLink>
                  </Tooltip>
                </Table.Cell>
                <Table.Cell px={3} py={2}>
                  {scenario.priority ? (
                    <Text
                      as="span"
                      display="inline-flex"
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="semibold"
                      bg={priorityColors[scenario.priority].bg}
                      color={priorityColors[scenario.priority].color}
                    >
                      {scenario.priority.charAt(0).toUpperCase() + scenario.priority.slice(1)}
                    </Text>
                  ) : (
                    <Text color="text.muted">—</Text>
                  )}
                </Table.Cell>
                {showFolder &&
                  (() => {
                    const folderPath = scenario.folderId
                      ? (folderPathById.get(scenario.folderId) ?? scenario.folderName ?? 'Unknown folder')
                      : 'Unfiled';
                    return (
                      <Table.Cell px={3} py={2}>
                        <Tooltip content={folderPath} openDelay={300} closeDelay={100}>
                          <Text
                            display="block"
                            maxW="100%"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            whiteSpace="nowrap"
                          >
                            {folderPath}
                          </Text>
                        </Tooltip>
                      </Table.Cell>
                    );
                  })()}
                <Table.Cell px={3} py={2} whiteSpace="nowrap" color="text.secondary">
                  {compactDate(scenario.updatedAt)}
                </Table.Cell>
                <Table.Cell px={3} py={2}>
                  <Tooltip content={`${scenario.createdBy.name} (${scenario.createdBy.email})`}>
                    <HStack gap={2} minW={0}>
                      <Box
                        aria-hidden="true"
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                        w="6"
                        h="6"
                        flexShrink={0}
                        borderRadius="full"
                        bg="blue.subtle"
                        color="blue.fg"
                        fontSize="xs"
                        fontWeight="semibold"
                      >
                        {authorInitials(scenario.createdBy.name)}
                      </Box>
                      <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                        {shortAuthorName(scenario.createdBy.name)}
                      </Text>
                    </HStack>
                  </Tooltip>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

type PriorityValue = 'high' | 'medium' | 'low';

const priorityColors: Record<PriorityValue, { bg: string; color: string }> = {
  high: { bg: 'status.attention.bg', color: 'text.secondary' },
  medium: { bg: 'status.total.bg', color: 'text.secondary' },
  low: { bg: 'status.neutral.bg', color: 'text.secondary' },
};

const PriorityFilter = ({
  value,
  counts,
  onChange,
}: {
  value: string;
  counts?: Partial<Record<PriorityValue, number | undefined>>;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const values: PriorityValue[] = ['high', 'medium', 'low'];
  const selected = value ? (value.split(',') as PriorityValue[]) : [];
  const selectedPriority = selected.length === 1 ? selected[0] : undefined;
  const priorityLabel = (priority: PriorityValue) => priority.charAt(0).toUpperCase() + priority.slice(1);
  return (
    <Popover.Root
      open={open}
      onOpenChange={({ open: nextOpen }) => setOpen(nextOpen)}
    >
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          bg={'bg.card'}
          borderColor={selected.length ? 'border.active' : undefined}
          color={selected.length ? 'text.primary' : undefined}
          minW="110px"
          justifyContent="space-between"
          fontSize="sm"
        >
          {selectedPriority ? (
            <HStack as="span" gap={2}>
              <Text as="span">Priority:</Text>
              <Text
                as="span"
                px={2}
                borderRadius="full"
                fontSize="xs"
                bg={priorityColors[selectedPriority].bg}
                color={priorityColors[selectedPriority].color}
              >
                {priorityLabel(selectedPriority)}
              </Text>
            </HStack>
          ) : selected.length > 1 ? (
            `Priority: ${selected.length}`
          ) : (
            'Priority'
          )}{' '}
          <FiChevronDown />
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="220px" bg="bg.card" p={2}>
            <Popover.Body p={1}>
              <VStack align="stretch" gap={1}>
                {values.map((item) => (
                  <HStack as="label" key={item} px={2} py={1} cursor="pointer" justify="space-between">
                    <HStack gap={2}>
                      <input
                        type="checkbox"
                        aria-label={item.charAt(0).toUpperCase() + item.slice(1)}
                        checked={selected.includes(item)}
                        onChange={() =>
                          onChange(
                            values
                              .filter((entry) => (entry === item ? !selected.includes(entry) : selected.includes(entry)))
                              .join(','),
                          )
                        }
                      />
                      <Text
                        as="span"
                        px={2}
                        borderRadius="full"
                        fontSize="xs"
                        bg={priorityColors[item].bg}
                        color={priorityColors[item].color}
                      >
                        {priorityLabel(item)}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="text.secondary">
                      {counts?.[item] ?? '–'}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Popover.Body>
            <HStack justify="space-between" pt={2} borderTopWidth="1px" borderColor="border.main">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
              >
                Clear
              </Button>
              <Button size="sm" variant="primary" onClick={() => setOpen(false)}>
                Done
              </Button>
            </HStack>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

const AuthorFilter = ({
  value,
  authors,
  loading,
  error,
  onChange,
}: {
  value: string[];
  authors: Array<{ id: string; name: string; email: string; scenarioCount?: number }>;
  loading: boolean;
  error?: unknown;
  onChange: (value: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selectedAuthors = authors.filter((author) => value.includes(author.id));
  const matchingAuthors = authors.filter((author) =>
    `${author.name} ${author.email}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  const selectedAuthor = selectedAuthors[0];
  const label = value.length === 1
    ? `Author: ${selectedAuthor?.name ? shortAuthorName(selectedAuthor.name) : selectedAuthor?.email || '1'}`
    : value.length
      ? `Author: ${value.length}`
      : 'Author';
  const close = () => {
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={({ open: nextOpen }) => {
        setOpen(nextOpen);
        if (!nextOpen) setSearch('');
      }}
    >
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          bg={'bg.card'}
          borderColor={value.length ? 'border.active' : undefined}
          color={value.length ? 'text.primary' : undefined}
          minW="90px"
          maxW="250px"
          justifyContent="space-between"
          fontSize="sm"
        >
          <Text as="span" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{label}</Text>
          <FiChevronDown aria-hidden="true" />
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="260px" bg="bg.card" p={0}>
            <Box position="relative" px={3} py={0} borderBottomWidth="1px" borderColor="border.main">
              <Box position="absolute" insetStart={3} top="50%" transform="translateY(-50%)" zIndex={1} color="text.muted" pointerEvents="none">
                <FiSearch aria-hidden="true" size={13} />
              </Box>
              <Input
                aria-label="Search authors"
                placeholder="Type to find an author"
                size="sm"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                ps={7}
                border={0}
                focusRing="none"
              />
            </Box>
            <Popover.Body p={1} maxH="240px" overflowY="auto">
              <VStack align="stretch" gap={0}>
                {loading && (
                  <Text px={2} py={2} color="text.secondary" fontSize="sm">
                    {authors.length ? 'Updating author counts…' : 'Loading authors…'}
                  </Text>
                )}
                {Boolean(error) && (
                  <Text px={2} py={2} color="text.secondary" fontSize="sm">
                    Author counts are unavailable.
                  </Text>
                )}
                {matchingAuthors.length ? (
                  matchingAuthors.map((author) => (
                    <HStack as="label" key={author.id} px={2} py={1.5} cursor="pointer" justify="space-between">
                      <HStack gap={2} minW={0}>
                        <input
                          type="checkbox"
                          aria-label={author.name || author.email}
                          checked={value.includes(author.id)}
                          onChange={() =>
                            onChange(value.includes(author.id) ? value.filter((id) => id !== author.id) : [...value, author.id])
                          }
                        />
                        <Text as="span" fontSize="sm" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                          {author.name || author.email}
                        </Text>
                      </HStack>
                      <Text flexShrink={0} fontSize="xs" color="text.secondary">
                        {author.scenarioCount ?? (loading ? '…' : '–')}
                      </Text>
                    </HStack>
                  ))
                ) : !loading && !error ? (
                  <Text px={2} py={2} color="text.secondary" fontSize="sm">No authors found</Text>
                ) : null}
              </VStack>
            </Popover.Body>
            <HStack justify="space-between" p={2} borderTopWidth="1px" borderColor="border.main">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onChange([]);
                  close();
                }}
              >
                Clear
              </Button>
              <Button size="sm" variant="primary" onClick={close}>
                Done
              </Button>
            </HStack>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

const ScenarioSortSelect = ({
  value,
  onChange,
  allowRunOrder,
}: {
  value: TestScenarioCatalogViewProps['sort'];
  onChange: (value: TestScenarioCatalogViewProps['sort']) => void;
  allowRunOrder: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const options: Array<{ value: typeof value; label: string }> = [
    { value: 'scenarioKey', label: 'Key' },
    { value: 'title', label: 'Title' },
    { value: 'folder', label: 'Folder' },
    { value: 'updatedAt', label: 'Updated' },
    { value: 'createdBy', label: 'Author' },
  ];
  const selectedLabel = options.find((option) => option.value === value)?.label ?? 'Run order';

  return (
    <Popover.Root open={open} onOpenChange={({ open: nextOpen }) => setOpen(nextOpen)}>
      <Popover.Trigger asChild>
        <Button
          aria-label={`Sort: ${selectedLabel}`}
          variant="outline"
          bg="bg.card"
          borderColor={(allowRunOrder ? Boolean(value) : Boolean(value && value !== 'updatedAt')) ? 'border.active' : undefined}
          minW="152px"
          justifyContent="space-between"
          fontSize="sm"
        >
          <Text as="span">Sort: {selectedLabel}</Text>
          <FiChevronDown aria-hidden="true" />
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="132px" bg="bg.card" p={1}>
            <Popover.Body p={0}>
              <VStack align="stretch" gap={0}>
                {(allowRunOrder ? [{ value: undefined, label: 'Run order' }, ...options] : options).map((option) => {
                  const selected = option.value === value;
                  return (
                    <Button
                      key={option.value ?? 'run-order'}
                      variant="ghost"
                      size="sm"
                      justifyContent="space-between"
                      fontWeight={selected ? 'semibold' : 'normal'}
                      color={selected ? 'blue.600' : undefined}
                      bg={selected ? 'blue.50' : undefined}
                      _hover={{ bg: selected ? 'blue.100' : 'bg.subtle' }}
                      _dark={selected ? { color: 'blue.200', bg: 'blue.900', _hover: { bg: 'blue.800' } } : undefined}
                      aria-current={selected ? 'true' : undefined}
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                    >
                      {option.label}
                      {selected && <FiCheck aria-hidden="true" />}
                    </Button>
                  );
                })}
              </VStack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

const SortDirectionIcon = ({ direction }: { direction: 'asc' | 'desc' }) => {
  const widths = direction === 'desc' ? [9, 7, 5] : [5, 7, 9];

  return (
    <svg
      aria-hidden="true"
      width="22.5"
      height="22.5"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {widths.map((width, index) => (
        <line key={index} x1="2.5" y1={5 + index * 5} x2={2.5 + width} y2={5 + index * 5} />
      ))}
      {direction === 'desc' ? (
        <path d="M16 3.5v12m-3-3 3 3 3-3" />
      ) : (
        <path d="M16 16.5v-12m-3 3 3-3 3 3" />
      )}
    </svg>
  );
};

const compactDate = (value: string) => new Date(value).toLocaleDateString('en-US');
const shortAuthorName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] || 'Unknown author';
  return `${parts[0]} ${parts.at(-1)?.[0] ?? ''}.`;
};
const authorInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

const CompactScenarioTable = ({
  projectId,
  scenarios,
  isLoading,
  selectedIds,
  selectionDisabled,
  onToggleSelected,
  onDragPayload,
  onDragEnd,
  folderPathById,
  searchActive,
  emptyFolder,
  onCreateScenario,
}: {
  projectId: string;
  scenarios: TestScenarioSummary[];
  isLoading: boolean;
  selectedIds: string[];
  selectionDisabled: boolean;
  onToggleSelected: (id: string) => void;
  onDragPayload: (projectId: string, scenarioIds: string[]) => void;
  onDragEnd: () => void;
  folderPathById: Map<string, string>;
  searchActive: boolean;
  emptyFolder: boolean;
  onCreateScenario: () => void;
}) => {
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const extendSelection = useRef(false);
  const selectRange = (id: string, index: number) => {
    const anchorIndex = scenarios.findIndex((scenario) => scenario.id === anchorId);
    if (extendSelection.current && anchorIndex >= 0) {
      const [start, end] = [anchorIndex, index].sort((left, right) => left - right);
      scenarios
        .slice(start, end + 1)
        .filter((scenario) => !selectedIds.includes(scenario.id))
        .forEach((scenario) => onToggleSelected(scenario.id));
    } else onToggleSelected(id);
    setAnchorId(id);
    extendSelection.current = false;
  };
  return (
    <Box overflowX="auto" w="100%">
      <Table.Root size="sm" variant="outline" minW="980px" w="100%" tableLayout="fixed">
        <Table.Header>
          <Table.Row bg="bg.subtle">
            <Table.ColumnHeader w="30px" px={1} py={2}>
              <Text srOnly>Drag</Text>
            </Table.ColumnHeader>
            <Table.ColumnHeader w="44px" px={3} py={2}>
              <input
                type="checkbox"
                aria-label="Select all scenarios on this page"
                disabled={selectionDisabled}
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
            <Table.ColumnHeader w="120px" px={2} py={2}>
              Key
            </Table.ColumnHeader>
            <Table.ColumnHeader px={3} py={2}>
              Title
            </Table.ColumnHeader>
            <Table.ColumnHeader w="110px" px={3} py={2}>
              Priority
            </Table.ColumnHeader>
            <Table.ColumnHeader w="190px" px={3} py={2}>
              Folder
            </Table.ColumnHeader>
            <Table.ColumnHeader w="120px" px={3} py={2}>
              Updated
            </Table.ColumnHeader>
            <Table.ColumnHeader w="180px" px={3} py={2}>
              Author
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {scenarios.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={8} py={8} textAlign="center">
                {isLoading ? (
                  <Text role="status" color="text.muted">
                    Searching scenarios…
                  </Text>
                ) : (
                  <EmptyState searchActive={searchActive} emptyFolder={emptyFolder && !searchActive} onCreateScenario={onCreateScenario} />
                )}
              </Table.Cell>
            </Table.Row>
          ) : (
            scenarios.map((scenario, index) => {
              const selected = selectedIds.includes(scenario.id);
              const folderPath = scenario.folderId
                ? (folderPathById.get(scenario.folderId) ?? scenario.folderName ?? 'Unknown folder')
                : 'No folder';
              const fullAuthor = scenario.createdBy.name
                ? `${scenario.createdBy.name} (${scenario.createdBy.email})`
                : scenario.createdBy.email || 'Unknown author';
              const priority = scenario.priority;
              const priorityStyle = priority ? priorityColors[priority] : undefined;
              return (
                <Table.Row
                  key={scenario.id}
                  data-testid={`test-scenario-${scenario.id}`}
                  bg={selected ? 'blue.50' : undefined}
                  _hover={{ bg: selected ? 'blue.50' : 'bg.subtle' }}
                >
                  <Table.Cell px={1} py={2}>
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      aria-label={`Drag ${scenario.title} to a folder`}
                      title="Drag to move into a folder"
                      draggable={!selectionDisabled}
                      disabled={selectionDisabled}
                      onDragStart={(event) => {
                        const scenarioIds = selected ? selectedIds : [scenario.id];
                        onDragPayload(projectId, scenarioIds);
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData(
                          'application/x-testportal-scenarios',
                          JSON.stringify({ projectId, scenarioIds }),
                        );
                      }}
                      onDragEnd={onDragEnd}
                    >
                      ⠿
                    </Button>
                  </Table.Cell>
                  <Table.Cell px={3} py={2}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${scenario.title}`}
                      disabled={selectionDisabled}
                      checked={selected}
                      onClick={(event) => {
                        extendSelection.current = event.shiftKey;
                      }}
                      onChange={() => selectRange(scenario.id, index)}
                    />
                  </Table.Cell>
                  <Table.Cell px={2} py={2}>
                    <Tooltip content={scenario.scenarioKey ?? 'N/A'}>
                      <Text
                        display="block"
                        maxW="100%"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {scenario.scenarioKey ?? 'N/A'}
                      </Text>
                    </Tooltip>
                  </Table.Cell>
                  <Table.Cell px={3} py={2} minW={0} overflow="hidden">
                    <Tooltip content={scenario.title}>
                      <ChakraLink
                        asChild
                        display="block"
                        minW={0}
                        maxW="100%"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        fontWeight="semibold"
                        color="text.main"
                      >
                        <RouterLink to={getTestScenarioDetailPath(scenario.id)}>{scenario.title}</RouterLink>
                      </ChakraLink>
                    </Tooltip>
                  </Table.Cell>
                  <Table.Cell px={3} py={2}>
                    {priority ? (
                      <Text
                        as="span"
                        display="inline-flex"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="semibold"
                        bg={priorityStyle?.bg}
                        color={priorityStyle?.color}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Text>
                    ) : (
                      <Text color="text.muted">—</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell px={3} py={2}>
                    <Tooltip content={folderPath}>
                      <Text
                        display="block"
                        maxW="100%"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {folderPath}
                      </Text>
                    </Tooltip>
                  </Table.Cell>
                  <Table.Cell px={3} py={2} whiteSpace="nowrap" color="text.secondary">
                    {compactDate(scenario.updatedAt)}
                  </Table.Cell>
                  <Table.Cell px={3} py={2}>
                    <Tooltip content={fullAuthor}>
                      <HStack gap={2} minW={0}>
                        <Box
                          aria-hidden="true"
                          display="inline-flex"
                          alignItems="center"
                          justifyContent="center"
                          w="6"
                          h="6"
                          flexShrink={0}
                          borderRadius="full"
                          bg="blue.subtle"
                          color="blue.fg"
                          fontSize="xs"
                          fontWeight="semibold"
                        >
                          {authorInitials(scenario.createdBy.name)}
                        </Box>
                        <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                          {shortAuthorName(scenario.createdBy.name)}
                        </Text>
                      </HStack>
                    </Tooltip>
                  </Table.Cell>
                </Table.Row>
              );
            })
          )}
        </Table.Body>
      </Table.Root>
    </Box>
  );
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
}: TestScenarioCatalogViewProps) {
  const isScenariosTab = organizationTab === CATALOG_TAB.scenarios;
  const isSuitesTab = organizationTab === CATALOG_TAB.suites;
  const currentProjectId = useRef(projectId);
  currentProjectId.current = projectId;
  const selectedAuthorIds = authorIds ?? (authorId ? [authorId] : []);
  const [createDialog, setCreateDialog] = useState<
    'folder' | 'suite' | 'rename-folder' | 'edit-suite' | 'move-folder' | 'delete-folder' | 'delete-suite' | null
  >(null);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  useEffect(() => {
    if (!openFilter) return;
    const handleOutsidePointerDown = (event: PointerEvent) => {
      const filterElement = document.querySelector(`[data-filter-field="${openFilter}"]`);
      const filterPanel = document.querySelector(`[data-filter-panel="${openFilter}"]`);
      if (
        filterElement &&
        !filterElement.contains(event.target as Node) &&
        !filterPanel?.contains(event.target as Node)
      )
        setOpenFilter(null);
    };
    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => document.removeEventListener('pointerdown', handleOutsidePointerDown);
  }, [openFilter]);
  const [targetFolder, setTargetFolder] = useState<CatalogFolder | null>(null);
  const [targetSuite, setTargetSuite] = useState<CatalogSuite | null>(null);
  const [moveParentId, setMoveParentId] = useState('');
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [isDraggingScenario, setIsDraggingScenario] = useState(false);
  const activeDrag = useRef<{ projectId: string; scenarioIds: string[] } | null>(null);
  const [operationFeedback, setOperationFeedback] = useState<string | null>(null);
  const [pendingSuiteUndo, setPendingSuiteUndo] = useState<
    | { kind: 'membership'; payload: SuiteMembershipUndo; message: string }
    | { kind: 'move'; payload: SuiteMoveUndo; message: string }
    | { kind: 'reorder'; payload: { suiteId: string; scenarioIds: string[] }; expiresAt: number; message: string }
    | null
  >(null);
  const [pendingFolderUndo, setPendingFolderUndo] = useState<
    | { kind: 'deletion'; restoreData: DeleteApiV2TestScenarioFoldersByFolderIdApiResponse['restoreData']; message: string }
    | { kind: 'move'; restoreData: NonNullable<ScenarioOperationReport['folderRestoreData']>; message: string }
    | null
  >(null);
  const [isUndoingSuiteChange, setIsUndoingSuiteChange] = useState(false);
  useEffect(() => {
    setPendingSuiteUndo(null);
  }, [projectId, organizationTab]);
  useEffect(() => {
    if (!pendingSuiteUndo || pendingSuiteUndo.kind !== 'reorder' || isUndoingSuiteChange) return;
    const timeout = window.setTimeout(() => setPendingSuiteUndo(null), Math.max(0, pendingSuiteUndo.expiresAt - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [isUndoingSuiteChange, pendingSuiteUndo]);
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
  const showFolderColumn = scope.kind === CATALOG_SCOPE.all || scope.kind === CATALOG_SCOPE.suite || scope.kind === CATALOG_SCOPE.folder;
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
  const selectedFolder = scope.kind === CATALOG_SCOPE.folder ? folderRows.find((folder) => folder.id === scope.id) : undefined;
  const changeScope = (nextScope: typeof scope) => {
    if (pendingFolderUndo?.kind === 'deletion') setPendingFolderUndo(null);
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
  const isEmptySuitesState = isSuitesTab && !organizationLoading && !organizationError && suites.length === 0;
  const activeColumnFilters = (Object.entries(columnFilters) as Array<[keyof typeof columnFilters, string]>).filter(
    ([, value]) => value.trim().length > 0,
  );
  const filterLabels: Record<keyof typeof columnFilters, string> = {
    scenarioKey: 'Scenario key',
    title: 'Title',
    details: 'Details',
    folder: 'Folder',
    createdBy: 'Created by',
  };
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
        const created = await onCreateFolder(createName.trim(), selectedFolder?.id ?? null, createDescription.trim() || null);
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
    setOperationFeedback(`${counts.join(' · ')}. ${report.errorMessage ?? 'The operation did not complete.'}${guidance}`);
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
  const clearSelection = () => selectedIds.forEach((id) => toggleSelected(id));
  const scenarioDragMime = 'application/x-testportal-scenarios';
  const handleScenarioDragOver = (event: DragEvent<HTMLElement>, destinationId: string) => {
    if (
      !isScenariosTab ||
      !projectId ||
      !event.dataTransfer.types.includes(scenarioDragMime) ||
      activeDrag.current?.projectId !== projectId
    )
      return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverFolderId(destinationId);
  };
  const handleScenarioDrop = (event: DragEvent<HTMLElement>, destinationId: string | null) => {
    if (!isScenariosTab || !projectId || !event.dataTransfer.types.includes(scenarioDragMime)) return;
    event.preventDefault();
    event.stopPropagation();
    setDragOverFolderId(null);
    setIsDraggingScenario(false);
    const active = activeDrag.current;
    activeDrag.current = null;
    try {
      const payload = JSON.parse(event.dataTransfer.getData(scenarioDragMime)) as {
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
      void onMoveScenarioIds(ids, destinationId).then((report) => {
        showOperationReport(report);
        if (!report.failedIds.length && !report.unattemptedIds.length && report.folderRestoreData?.length) {
          setPendingFolderUndo({
            kind: 'move',
            restoreData: report.folderRestoreData,
            message: `${report.folderRestoreData.length} scenario${report.folderRestoreData.length === 1 ? '' : 's'} moved to ${destinationId === null ? 'No folder' : folderRows.find((folder) => folder.id === destinationId)?.name ?? 'folder'}`,
          });
        }
      }).catch((error: unknown) => {
        setOperationFeedback(getActionErrorMessage(error));
      });
    } catch {
      return;
    }
  };
  const handleSuiteDrop = (event: DragEvent<HTMLElement>, destinationSuiteId: string) => {
    if (isScenariosTab || !projectId || !scope.id || scope.id === destinationSuiteId || !event.dataTransfer.types.includes(scenarioDragMime)) return;
    event.preventDefault();
    event.stopPropagation();
    setDragOverFolderId(null);
    setIsDraggingScenario(false);
    const active = activeDrag.current;
    activeDrag.current = null;
    try {
      const payload = JSON.parse(event.dataTransfer.getData(scenarioDragMime)) as { projectId?: string; scenarioIds?: unknown };
      if (payload.projectId !== projectId || !Array.isArray(payload.scenarioIds) || !payload.scenarioIds.every((id) => typeof id === 'string')) return;
      const ids = [...new Set(payload.scenarioIds as string[])];
      if (!ids.length || active?.projectId !== projectId || ids.some((id) => !active.scenarioIds.includes(id))) return;
      void moveSuiteMembership(scope.id, destinationSuiteId, ids).then(async (undo) => {
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
      }).catch((error: unknown) => {
        setOperationFeedback(getActionErrorMessage(error));
        void refreshSuiteData();
      });
    } catch {
      return;
    }
  };
  const canReorderSuite = Boolean(
    selectedSuite && scope.kind === CATALOG_SCOPE.suite && (selectedSuite.members?.length ?? 0) <= pageSize && !search.trim() &&
    !priority && selectedAuthorIds.length === 0 && activeColumnFilters.length === 0 && !sort,
  );
  const reorderRequirements = [
    sort && 'select Run order',
    (search.trim() || priority || selectedAuthorIds.length > 0 || activeColumnFilters.length > 0) && 'clear search and filters',
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
      const payload = JSON.parse(event.dataTransfer.getData(scenarioDragMime)) as { projectId?: string; scenarioIds?: unknown };
      if (payload.projectId !== projectId || !Array.isArray(payload.scenarioIds) || !payload.scenarioIds.every((id) => typeof id === 'string')) return;
      const movingIds = [...new Set(payload.scenarioIds as string[])];
      const fullOrder = (selectedSuite.members ?? []).map((member) => member.testScenarioId);
      if (!movingIds.length || movingIds.includes(targetScenarioId) || movingIds.some((id) => !fullOrder.includes(id))) return;
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
              expiresAt: Date.now() + 10_000,
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
    if (!event.dataTransfer.types.includes(scenarioDragMime)) return;
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
  const renderFolder = (folder: CatalogFolder): ReactNode => {
    const children = getFolderChildren(folder);
    const selected = scope.kind === CATALOG_SCOPE.folder && scope.id === folder.id;
    return (
      <Box key={folder.id}>
        <HStack gap={0}>
          <Button
            flex="1"
            minW="0"
            size="sm"
            px={2}
            ps={1}
            variant={selected || dragOverFolderId === folder.id ? 'subtle' : 'ghost'}
            colorPalette={selected || dragOverFolderId === folder.id ? 'blue' : undefined}
            borderStartWidth="3px"
            borderStartColor={selected || dragOverFolderId === folder.id ? 'blue.500' : 'transparent'}
            outline={dragOverFolderId === folder.id ? '2px dashed' : undefined}
            outlineColor="blue.500"
            outlineOffset="-2px"
            alignItems="center"
            justifyContent="flex-start"
            aria-current={selected ? 'page' : undefined}
            onClick={() => changeScope({ kind: 'folder', id: folder.id })}
            onDragOver={(event) => handleScenarioDragOver(event, folder.id)}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null))
                setDragOverFolderId((current) => (current === folder.id ? null : current));
            }}
            onDrop={(event) => handleScenarioDrop(event, folder.id)}
          >
            <FiFolder size={22} style={{ display: 'block', flexShrink: 0 }} />
            <Text display="flex" alignItems="center" flex="1" textAlign="left" lineClamp={1}>
              {folder.name}
            </Text>
            <Text color="text.muted" fontSize="xs">
              {folderScenarioCounts.get(folder.id) ?? folder.scenarioCount}
            </Text>
          </Button>
        </HStack>
        {children.map((child) => (
          <Box key={child.id} ps={4}>
            {renderFolder(child)}
          </Box>
        ))}
        {inlineFolderParentId === folder.id && (
          <Box ps={4} py={1}>
            <Input
              autoFocus
              size="sm"
              aria-label="New folder name"
              placeholder="Subfolder name"
              border="1px solid"
              borderColor="blue.500"
              _focusVisible={{ borderColor: 'blue.500', outline: 'none', boxShadow: 'none' }}
              value={inlineFolderName}
              disabled={isCreating}
              onChange={(event) => setInlineFolderName(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setInlineFolderParentId(undefined);
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void submitInlineFolder();
                }
              }}
            />
            {inlineFolderError && (
              <Text role="alert" color="fg.error" fontSize="xs">
                {inlineFolderError}
              </Text>
            )}
          </Box>
        )}
      </Box>
    );
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
          <VStack
            align="stretch"
            gap={4}
            pe={{ base: 0, lg: 4 }}
            borderEndWidth={{ base: 0, lg: '1px' }}
            borderColor={isDraggingScenario ? 'blue.200' : 'border.main'}
            bg={isDraggingScenario ? 'blue.50' : 'bg.card'}
            outline={isDraggingScenario ? '1px solid' : undefined}
            outlineColor="blue.200"
            outlineOffset="4px"
            borderRadius={isDraggingScenario ? 'sm' : undefined}
            aria-label="Scenario organization"
          >
            {organizationTab !== 'suites' && (
              <VStack align="stretch" gap={1}>
                <Button
                  size="sm"
                  p={1}
                  justifyContent="flex-start"
                  variant={scope.kind === CATALOG_SCOPE.all ? 'subtle' : 'ghost'}
                  colorPalette={scope.kind === CATALOG_SCOPE.all ? 'blue' : undefined}
                  borderStartWidth="3px"
                  borderStartColor={scope.kind === CATALOG_SCOPE.all ? 'blue.500' : 'transparent'}
                  aria-current={scope.kind === CATALOG_SCOPE.all ? 'page' : undefined}
                  onClick={() => changeScope({ kind: 'all' })}
                >
                  <FiLayers />
                  All scenarios
                  <Text ml="auto" color="text.muted" fontSize="xs">
                    {projectScenarioCount}
                  </Text>
                </Button>
              </VStack>
            )}
            {organizationTab !== 'suites' && (
              <Box>
                <HStack justify="space-between" px={2} mb={1}>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    letterSpacing="wider"
                    color="text.secondary"
                    textTransform="uppercase"
                  >
                    Folders
                  </Text>
                  <IconButton
                    size="xs"
                    variant="ghost"
                    color="text.secondary"
                    aria-label={selectedFolder ? 'Create subfolder' : 'Create folder'}
                    title={selectedFolder ? 'Create inside selected folder' : 'Create folder'}
                    disabled={Boolean(selectedFolder && selectedFolder.depth >= 2)}
                    onClick={() => startInlineFolder(selectedFolder?.id ?? null)}
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
                ) : folders.length === 0 && inlineFolderParentId !== null ? (
                  <Text px={2} color="text.muted" fontSize="sm">
                    No folders yet
                  </Text>
                ) : (
                  <VStack align="stretch" gap={0}>
                    {inlineFolderParentId === null && (
                      <Box py={1}>
                        <Input
                          autoFocus
                          size="sm"
                          aria-label="New folder name"
                          placeholder="Folder name, Enter to create"
                          border="1px solid"
                          borderColor="blue.500"
                          _focusVisible={{ borderColor: 'blue.500', outline: 'none', boxShadow: 'none' }}
                          value={inlineFolderName}
                          disabled={isCreating}
                          onChange={(event) => setInlineFolderName(event.currentTarget.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Escape') setInlineFolderParentId(undefined);
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              void submitInlineFolder();
                            }
                          }}
                        />
                        {inlineFolderError && (
                          <Text role="alert" color="fg.error" fontSize="xs">
                            {inlineFolderError}
                          </Text>
                        )}
                      </Box>
                    )}
                    {folders.map(renderFolder)}
                  </VStack>
                )}
              </Box>
            )}
            {organizationTab !== 'suites' && (
              <Button
                size="sm"
                minH="24px"
                px={1.5}
                gap={3}
                variant="ghost"
                alignItems="center"
                justifyContent="flex-start"
                aria-current={scope.kind === 'unfiled' ? 'page' : undefined}
                onClick={() => changeScope({ kind: 'unfiled' })}
                bg={scope.kind === 'unfiled' || dragOverFolderId === UNFILED_DESTINATION ? 'blue.subtle' : undefined}
                outline={dragOverFolderId === UNFILED_DESTINATION ? '2px dashed' : undefined}
                outlineColor="blue.500"
                outlineOffset="-2px"
                color={scope.kind === 'unfiled' ? 'blue.fg' : 'text.main'}
                _hover={{ bg: 'bg.subtle' }}
                onDragOver={(event) => handleScenarioDragOver(event, UNFILED_DESTINATION)}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null))
                    setDragOverFolderId((current) => (current === UNFILED_DESTINATION ? null : current));
                }}
                onDrop={(event) => handleScenarioDrop(event, null)}
              >
                <UnfiledFolderIcon />
                <Text display="flex" alignItems="center" fontStyle="italic">
                  No folder
                </Text>
                <Text ml="auto" color="text.muted" fontSize="xs">
                  {unfiledScenarioCount}
                </Text>
              </Button>
            )}
            {!isScenariosTab && (
              <Box>
                <HStack justify="space-between" px={2} mb={1}>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    letterSpacing="wider"
                    color="text.secondary"
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
                {createDialog === 'suite' && (
                  <form onSubmit={(event) => void submitCreate(event)}>
                    <Box py={1}>
                        <Input
                          aria-label="Suite name"
                          autoFocus
                          size="sm"
                          maxLength={120}
                          value={createName}
                          placeholder="Suite name, Enter to create"
                          border="1px solid"
                          borderColor="blue.500"
                          _focusVisible={{ borderColor: 'blue.500', outline: 'none', boxShadow: 'none' }}
                          disabled={isCreating}
                          onChange={(event) => setCreateName(event.currentTarget.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Escape') setCreateDialog(null);
                            if (event.key === 'Enter' && !createName.trim()) {
                              event.preventDefault();
                              setCreateDialog(null);
                            }
                          }}
                        />
                      {createError && (
                        <Text role="alert" color="fg.error" fontSize="xs">
                          {createError}
                        </Text>
                      )}
                    </Box>
                  </form>
                )}
                {organizationLoading ? (
                  <Text px={2} color="text.muted" fontSize="sm">
                    Loading suites…
                  </Text>
                ) : organizationError ? (
                  <Text px={2} color="fg.error" fontSize="sm" role="alert">
                    Suites could not be loaded.
                  </Text>
                ) : suites.length === 0 && createDialog !== 'suite' ? (
                  <VStack align="stretch" px={2} py={2} gap={2}>
                    <Text color="text.secondary" fontSize="sm">
                      No suites yet
                    </Text>
                  </VStack>
                ) : (
                  <VStack align="stretch" gap={0}>
                    {suites.map((suite) => {
                      const selected = scope.kind === CATALOG_SCOPE.suite && scope.id === suite.id;
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
                          onClick={() => changeScope({ kind: 'suite', id: suite.id })}
                          onDragOver={(event) => {
                            if (
                              !isScenariosTab &&
                              scope.id !== suite.id &&
                              projectId &&
                              event.dataTransfer.types.includes(scenarioDragMime)
                            ) {
                              event.preventDefault();
                              event.dataTransfer.dropEffect = 'move';
                              setDragOverFolderId(suite.id);
                            }
                          }}
                          onDragLeave={() => setDragOverFolderId((current) => (current === suite.id ? null : current))}
                          onDrop={(event) => handleSuiteDrop(event, suite.id)}
                          outline={dragOverFolderId === suite.id ? '2px dashed' : undefined}
                          outlineColor="blue.500"
                        >
                          <FiList aria-hidden="true" />
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
            )}
          </VStack>

          <VStack align="stretch" gap={4} minW="0">
            {!isEmptySuitesState && (
              <Box>
                <HStack justify="space-between" align="start" gap={3} flexWrap="wrap">
                  <Box minW="0" flex="1">
                    {(createDialog === 'edit-suite' && selectedSuite) ||
                    (createDialog === 'rename-folder' && selectedFolder) ? (
                      <form onSubmit={(event) => void submitCreate(event)}>
                        <Grid templateColumns={{ base: '1fr', md: 'minmax(0, 1fr) auto' }} alignItems="start" gap={3}>
                          <VStack align="stretch" gap={2}>
                            <label>
                              <Text mb={1} fontSize="xs" color="text.secondary">
                                {createDialog === 'rename-folder' ? 'Folder name' : 'Name'}
                              </Text>
                              <Input
                                aria-label={createDialog === 'rename-folder' ? 'Folder name' : 'Suite name'}
                                autoFocus
                                required
                                maxLength={200}
                                value={createName}
                                onChange={(event) => setCreateName(event.currentTarget.value)}
                              />
                            </label>
                            <label>
                              <Text mb={1} fontSize="xs" color="text.secondary">
                                {createDialog === 'rename-folder' ? 'Description (optional)' : 'Description'}
                              </Text>
                              <Textarea
                                aria-label={
                                  createDialog === 'rename-folder' ? 'Description (optional)' : 'Suite description'
                                }
                                value={createDescription}
                                onChange={(event) => setCreateDescription(event.currentTarget.value)}
                              />
                            </label>
                            {createError && (
                              <Text role="alert" color="fg.error" fontSize="sm">
                                {createError}
                              </Text>
                            )}
                          </VStack>
                          <HStack justify="flex-end" pt={{ base: 0, md: 5 }}>
                            <Button size="sm" variant="ghost" type="button" onClick={() => setCreateDialog(null)}>
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              type="submit"
                              disabled={!createName.trim() || isCreating}
                              loading={isCreating}
                            >
                              Save changes
                            </Button>
                          </HStack>
                        </Grid>
                      </form>
                    ) : (
                      <Heading fontSize="lg" lineHeight="1.3">
                        {selectedFolderPath ??
                          selectedSuite?.name ??
                          (isEmptySuitesState
                            ? 'No suites yet'
                            : scope.kind === CATALOG_SCOPE.suite
                              ? 'Select a suite'
                              : scope.kind === 'unfiled'
                                ? 'No folder scenarios'
                                : 'All scenarios')}
                      </Heading>
                    )}
                    {createDialog !== 'edit-suite' &&
                      createDialog !== 'rename-folder' &&
                      selectedFolder?.description && (
                        <Text mt={1} color="text.secondary" fontSize="sm">
                          {selectedFolder.description}
                        </Text>
                      )}
                    {createDialog !== 'edit-suite' && selectedSuite && (
                      <Text mt={1} color="text.muted" fontSize="sm">
                        {selectedSuite.description?.trim() || 'No description'}
                      </Text>
                    )}
                  </Box>
                  {selectedSuite && createDialog !== 'edit-suite' && (
                    <HStack>
                      <Tooltip
                        content="Add scenarios to run this suite"
                        openDelay={500}
                        closeDelay={0}
                        disabled={!isSelectedSuiteEmpty}
                      >
                        <Button
                          variant="primary"
                          aria-disabled={isSelectedSuiteEmpty || undefined}
                          data-disabled={isSelectedSuiteEmpty ? '' : undefined}
                          cursor={isSelectedSuiteEmpty ? 'not-allowed' : 'pointer'}
                          bg={isSelectedSuiteEmpty ? 'button.primary.bg.disabled' : undefined}
                          color={isSelectedSuiteEmpty ? 'button.primary.color' : undefined}
                          opacity={1}
                          _hover={
                            isSelectedSuiteEmpty ? { bg: 'button.primary.bg.disabled', boxShadow: 'none' } : undefined
                          }
                          onClick={(event) => {
                            if (isSelectedSuiteEmpty) event.preventDefault();
                          }}
                        >
                          <FiPlay aria-hidden="true" />
                          Run suite
                        </Button>
                      </Tooltip>
                      <Button variant="outline" onClick={() => setAddScenariosToSuiteOpen(true)}>
                        <FiLayers />
                        Manage scenarios
                      </Button>
                      <Menu.Root>
                        <Menu.Trigger asChild>
                          <IconButton aria-label="Suite actions" variant="outline">
                            <FiMoreHorizontal />
                          </IconButton>
                        </Menu.Trigger>
                        <Menu.Positioner>
                          <Menu.Content>
                            <Menu.Item value="edit" onClick={openEditSuiteDialog}>
                              <HStack justify="left" w="full">
                                <FiEdit aria-hidden="true" />
                                <Text>Edit suite details</Text>
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
                              <HStack justify="left" w="full">
                                <FiTrash2 aria-hidden="true" />
                                <Text>Delete suite</Text>
                              </HStack>
                            </Menu.Item>
                          </Menu.Content>
                        </Menu.Positioner>
                      </Menu.Root>
                    </HStack>
                  )}
                  <HStack gap={2}>
                    {isScenariosTab && createDialog !== 'rename-folder' && (
                      <Button aria-label="Create Test Scenario" variant="primary" onClick={onCreateScenario}>
                        <FiPlus />
                        Create scenario
                      </Button>
                    )}
                    {isScenariosTab && selectedFolder && createDialog !== 'rename-folder' && (
                      <Menu.Root positioning={{ placement: 'bottom-end' }}>
                        <Menu.Trigger asChild>
                          <IconButton aria-label="Folder actions" size="md" variant="outline">
                            <FiMoreHorizontal />
                          </IconButton>
                        </Menu.Trigger>
                        <Menu.Positioner>
                          <Menu.Content minW="210px" p="1" borderRadius="lg">
                            {selectedFolder && selectedFolder.depth < 2 && (
                              <Menu.Item value="create-folder" minH="32px" gap="3" onClick={() => startInlineFolder(selectedFolder.id)}>
                                <FiFolderPlus aria-hidden="true" />
                                New subfolder
                              </Menu.Item>
                            )}
                            {selectedFolder && (
                              <>
                                <Menu.Item value="rename-folder" minH="32px" gap="3" onClick={() => openEditFolderDialog(selectedFolder)}>
                                  <FiEdit aria-hidden="true" />
                                  Edit folder details
                                </Menu.Item>
                                <Menu.Item
                                  value="move-folder-up"
                                  minH="32px"
                                  gap="3"
                                  disabled={selectedFolderIndex <= 0}
                                  onClick={() => void reorderFolder(selectedFolder, -1)}
                                >
                                  <FiArrowUp aria-hidden="true" />
                                  Move up
                                </Menu.Item>
                                <Menu.Item
                                  value="move-folder-down"
                                  minH="32px"
                                  gap="3"
                                  disabled={
                                    selectedFolderIndex < 0 || selectedFolderIndex >= selectedFolderSiblings.length - 1
                                  }
                                  onClick={() => void reorderFolder(selectedFolder, 1)}
                                >
                                  <FiArrowDown aria-hidden="true" />
                                  Move down
                                </Menu.Item>
                                <Menu.Item
                                  value="move-folder"
                                  minH="32px"
                                  gap="3"
                                  onClick={() => openFolderActionDialog('move-folder', selectedFolder)}
                                >
                                  <FiMove aria-hidden="true" />
                                  Move
                                </Menu.Item>
                                <Menu.Separator />
                                <Menu.Item
                                  value="delete-folder"
                                  minH="32px"
                                  gap="3"
                                  color="fg.error"
                                  onClick={() => openFolderActionDialog('delete-folder', selectedFolder)}
                                >
                                  <FiTrash2 aria-hidden="true" />
                                  Delete folder
                                </Menu.Item>
                              </>
                            )}
                          </Menu.Content>
                        </Menu.Positioner>
                      </Menu.Root>
                    )}
                  </HStack>
                </HStack>
              </Box>
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
            <VStack align="stretch" gap={2} display={isEmptySuitesState ? 'none' : undefined}>
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
                    zIndex={1}
                    color="text.muted"
                    pointerEvents="none"
                  >
                    <FiSearch aria-hidden="true" size={14} />
                  </Box>
                  <Input
                    aria-label="Search scenarios"
                    placeholder="Search by title or key"
                    value={search}
                    onChange={(event) => onSearchChange(event.currentTarget.value)}
                    ps={9}
                    pe={search ? 9 : 3}
                    bg="bg.card"
                    borderColor={search.trim() ? 'border.active' : undefined}
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
                {isScenariosTab || selectedSuite ? (
                  <>
                    <PriorityFilter value={priority} counts={priorityCounts} onChange={onPriorityChange} />
                    <AuthorFilter
                      value={selectedAuthorIds}
                      authors={authors}
                      loading={authorsLoading}
                      error={authorsError}
                      onChange={onAuthorChange}
                    />
                    <Box flex="1 1 auto" minW={0} />
                    <ScenarioSortSelect value={sort} onChange={onSortChange} allowRunOrder={!isScenariosTab} />
                    <Tooltip content={sortDirection === 'desc' ? 'Descending' : 'Ascending'}>
                      <IconButton
                        aria-label={`Sort ${sortDirection === 'desc' ? 'descending' : 'ascending'}`}
                        disabled={!sort}
                        variant="outline"
                        bg="bg.card"
                        color="text.primary"
                        borderColor={sort && sortDirection !== 'desc' ? 'border.active' : 'border.main'}
                        h="40px"
                        w="40px"
                        minW="40px"
                        p={0}
                        borderRadius="md"
                        _hover={{ bg: 'bg.subtle', borderColor: 'border.active' }}
                        onClick={() => onSortDirectionChange(sortDirection === 'desc' ? 'asc' : 'desc')}
                      >
                        <SortDirectionIcon direction={sortDirection} />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : null}
                {(search.trim() || activeColumnFilters.length > 0) && (
                  <Text fontSize="xs" color="text.muted">
                    {activeColumnFilters.length + Number(Boolean(search.trim()))} search{' '}
                    {activeColumnFilters.length + Number(Boolean(search.trim())) === 1 ? 'term' : 'terms'} active
                  </Text>
                )}
              </HStack>
              {activeColumnFilters.length > 0 && (
                <HStack gap={2} flexWrap="wrap" aria-label="Active scenario filters">
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
              <Portal>
                <HStack
                  role="status"
                  aria-label="Suite membership notification"
                  position="fixed"
                  bottom={{ base: 3, md: 5 }}
                  left="50%"
                  transform="translateX(-50%)"
                  zIndex={1500}
                  justify="space-between"
                  gap={5}
                  width="max-content"
                  maxW="calc(100vw - 32px)"
                  bg="#1f1f23"
                  color="white"
                  borderRadius="md"
                  boxShadow="lg"
                  px={4}
                  py={2}
                >
                  <Text fontSize="sm" lineHeight="short" flex="1">
                    {pendingSuiteUndo.message}
                  </Text>
                  <Button
                    size="sm"
                    variant="plain"
                    color="#b7c6ff"
                    flexShrink={0}
                    disabled={isUndoingSuiteChange}
                    onClick={async () => {
                      if (isUndoingSuiteChange) return;
                      setIsUndoingSuiteChange(true);
                      try {
                        if (pendingSuiteUndo.kind === 'membership') {
                          await restoreSuiteMembership(pendingSuiteUndo.payload);
                          if (pendingSuiteUndo.payload.createdSuiteId)
                            await onDeleteSuite(pendingSuiteUndo.payload.createdSuiteId);
                        } else if (pendingSuiteUndo.kind === 'move') await restoreSuiteMove(pendingSuiteUndo.payload);
                        else
                          await onReorderSuite(pendingSuiteUndo.payload.suiteId, pendingSuiteUndo.payload.scenarioIds);
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
                    }}
                  >
                    {isUndoingSuiteChange ? 'Undoing…' : 'Undo'}
                  </Button>
                </HStack>
              </Portal>
            )}
            {pendingFolderUndo && (
              <Portal>
                <HStack
                  role="status"
                  aria-label="Folder organization notification"
                  position="fixed"
                  bottom={{ base: 3, md: 5 }}
                  left="50%"
                  transform="translateX(-50%)"
                  zIndex={1500}
                  justify="space-between"
                  gap={5}
                  width="max-content"
                  maxW="calc(100vw - 32px)"
                  bg="#1f1f23"
                  color="white"
                  borderRadius="md"
                  boxShadow="lg"
                  px={4}
                  py={2}
                >
                  <Text fontSize="sm" lineHeight="short" flex="1">
                    {pendingFolderUndo.message}
                  </Text>
                  <Button
                    size="sm"
                    variant="plain"
                    color="#b7c6ff"
                    flexShrink={0}
                    disabled={isUndoingSuiteChange}
                    onClick={async () => {
                      if (isUndoingSuiteChange) return;
                      setIsUndoingSuiteChange(true);
                      try {
                        if (pendingFolderUndo.kind === 'deletion')
                          await restoreFolderDeletion(pendingFolderUndo.restoreData);
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
                    }}
                  >
                    {isUndoingSuiteChange ? 'Undoing…' : 'Undo'}
                  </Button>
                </HStack>
              </Portal>
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
              <Portal>
                <HStack
                  position="fixed"
                  left="50%"
                  bottom={{ base: 3, md: 5 }}
                  transform="translateX(-50%)"
                  zIndex="popover"
                  flexWrap={{ base: 'wrap', sm: 'nowrap' }}
                  justify="center"
                  gap={{ base: 1, sm: 2 }}
                  px={{ base: 2, sm: 3 }}
                  py={2}
                  maxW="calc(100vw - 24px)"
                  color="white"
                  borderRadius="lg"
                  boxShadow="0 8px 28px rgba(0, 0, 0, 0.28)"
                  aria-label="Bulk scenario actions"
                  role="toolbar"
                  bg={scope.kind === CATALOG_SCOPE.suite ? 'gray.900' : 'black'}
                  _dark={{ bg: 'gray.900', color: 'white' }}
                >
                  <Text
                    as="span"
                    display="inline-flex"
                    alignItems="center"
                    h="8"
                    px={1}
                    fontSize="sm"
                    lineHeight="1.2"
                    fontWeight="semibold"
                    whiteSpace="nowrap"
                  >
                    {selectedIds.length} selected
                  </Text>
                  {!allMatchingSelected && selectedIds.length < pagination.total && (
                    <Button
                      size="sm"
                      variant="ghost"
                      color="blue.300"
                      disabled={isResolvingSelection || isExecutingOperation}
                      onClick={() => void selectAllMatching()}
                      _dark={{ color: 'blue.700' }}
                      _hover={{ bg: 'whiteAlpha.200' }}
                    >
                      Select all {pagination.total}
                    </Button>
                  )}
                  <Box aria-hidden="true" h="6" borderStartWidth="1px" borderColor="whiteAlpha.400" mx={1} />
                  {(isSuitesTab || isScenariosTab) && (
                    <Tooltip
                      content={`Start a manual run with the ${selectedIds.length === 1 ? 'selected scenario' : `${selectedIds.length} selected scenarios`}`}
                      openDelay={500}
                      closeDelay={0}
                      contentProps={{ maxW: '240px' }}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        color="white"
                        _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
                        _active={{ bg: 'whiteAlpha.300', color: 'white' }}
                        _focusVisible={{ outline: '2px solid', outlineColor: 'blue.300', outlineOffset: '2px' }}
                      >
                        <FiPlay aria-hidden="true" />
                        Run selected
                      </Button>
                    </Tooltip>
                  )}
                  {isScenariosTab && projectId && (
                    <SuitePicker
                      key={projectId}
                      projectId={projectId}
                      selectedIds={selectedIds}
                      disabled={isExecutingOperation || isAddingToSuite}
                      onBusyChange={(busy) => {
                        if (busy) onSuiteOperationStart();
                        setIsAddingToSuite(busy);
                      }}
                      onComplete={(report, selection, undo) => {
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
                      }}
                    />
                  )}
                  {isScenariosTab && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isExecutingOperation || isAddingToSuite}
                      onClick={() => {
                        setDeleteTargetIds([...selectedIds]);
                        setDeleteSelectedOpen(true);
                      }}
                      color="red.300"
                      _dark={{ color: 'red.600' }}
                      _hover={{ bg: 'whiteAlpha.200' }}
                    >
                      <FiTrash2 aria-hidden="true" />
                      Delete
                    </Button>
                  )}
                  {scope.kind === CATALOG_SCOPE.suite && (
                    <Tooltip
                      content="Unlink from this suite. The scenarios stay in the catalog."
                      openDelay={500}
                      closeDelay={0}
                      contentProps={{ maxW: '240px' }}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isExecutingOperation || isAddingToSuite}
                        onClick={() => {
                          setRemoveFromSuiteError(null);
                          setRemoveFromSuiteOpen(true);
                        }}
                        color="red.300"
                        _hover={{ bg: 'whiteAlpha.200' }}
                      >
                        <FiMinusCircle aria-hidden="true" />
                        Remove from suite
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip content="Clear selection" openDelay={500} closeDelay={0} contentProps={{ maxW: '240px' }}>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      aria-label="Clear selection"
                      disabled={isExecutingOperation || isAddingToSuite}
                      onClick={clearSelection}
                      color="inherit"
                      _hover={{ bg: 'whiteAlpha.200' }}
                    >
                      <FiX />
                    </IconButton>
                  </Tooltip>
                </HStack>
              </Portal>
            )}

            {!isEmptySuitesState && (
              <Box borderWidth="1px" borderColor="border.main" borderRadius="lg" overflow="hidden" bg="bg.card">
                {isSuitesTab && !selectedSuite && !isEmptySuitesState ? (
                  <VStack p={8} gap={3} textAlign="center">
                    <Heading size="sm">Select a suite to view its scenarios</Heading>
                    <Text color="text.secondary">Each suite has its own membership and scenario order.</Text>
                    <Button size="sm" variant="outline" onClick={() => openCreateDialog('suite')}>
                      Create suite
                    </Button>
                  </VStack>
                ) : error ? (
                  <Box p={4}>
                    <ErrorState />
                  </Box>
                ) : (
                  <>
                    {isScenariosTab ? (
                      <CompactScenarioTable
                        projectId={projectId ?? ''}
                        scenarios={scenarios}
                        isLoading={isLoading}
                        selectedIds={selectedIds}
                        selectionDisabled={isExecutingOperation}
                        onToggleSelected={toggleSelected}
                        onDragPayload={(dragProjectId, scenarioIds) => {
                          setPendingFolderUndo(null);
                          setPendingSuiteUndo(null);
                          activeDrag.current = { projectId: dragProjectId, scenarioIds };
                          setIsDraggingScenario(true);
                        }}
                        onDragEnd={() => {
                          activeDrag.current = null;
                          setIsDraggingScenario(false);
                          setDragOverFolderId(null);
                        }}
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
                      <ScenarioTable
                        projectId={projectId}
                        enableSuiteDrag={!isScenariosTab}
                        enableSuiteReorder={canReorderSuite}
                        onDragPayload={(dragProjectId, scenarioIds) => {
                          setPendingFolderUndo(null);
                          setPendingSuiteUndo(null);
                          activeDrag.current = { projectId: dragProjectId, scenarioIds };
                          setIsDraggingScenario(true);
                        }}
                        onDragEnd={() => {
                          activeDrag.current = null;
                          setIsDraggingScenario(false);
                          setDragOverFolderId(null);
                        }}
                        onSuiteRowDrop={handleSuiteRowDrop}
                        onSuiteRowDragOver={handleSuiteRowDragOver}
                        dragOverScenarioId={dragOverFolderId}
                        scenarios={scenarios}
                        isLoading={isLoading}
                        selectedIds={selectedIds}
                        selectionDisabled={isExecutingOperation}
                        onToggleSelected={toggleSelected}
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
              <HStack justify="space-between" flexWrap="wrap" gap={3}>
                <HStack w="full" justify="space-between" gap={3} flexWrap="wrap">
                  <Text color="text.secondary" fontSize="sm">
                    {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}–
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </Text>
                  <HStack as="nav" aria-label="Test Scenario pagination" gap={2}>
                    <Text color="text.secondary" fontSize="sm" whiteSpace="nowrap">
                      Rows per page
                    </Text>
                    <Box w="64px">
                      <NativeSelect
                        id="scenario-page-size"
                        aria-label="Rows per page"
                        h="8"
                        bg="bg.card"
                        ps={2}
                        value={String(pageSize)}
                        onChange={(event) => onPageSizeChange(Number(event.currentTarget.value))}
                      >
                        {pageSizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </NativeSelect>
                    </Box>
                    <IconButton
                      aria-label="Previous Page"
                      size="sm"
                      variant="outline"
                      disabled={pagination.page <= 1}
                      onClick={() => onPageChange(pagination.page - 1)}
                    >
                      <FiChevronLeft />
                    </IconButton>
                    <IconButton
                      aria-label="Next Page"
                      size="sm"
                      variant="outline"
                      disabled={pagination.page >= pagination.totalPages || pagination.totalPages === 0}
                      onClick={() => onPageChange(pagination.page + 1)}
                    >
                      <FiChevronRight />
                    </IconButton>
                  </HStack>
                </HStack>
              </HStack>
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
        <Dialog
          title={`Delete ${deleteTargetIds.length} selected scenario${deleteTargetIds.length === 1 ? '' : 's'}?`}
          onClose={() => setDeleteSelectedOpen(false)}
        >
          <DialogBody>
            <Text>
              This permanently deletes the selected scenarios. Only scenarios in this confirmed selection will be
              deleted.
            </Text>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={isDeletingSelected}
              onClick={() => setDeleteSelectedOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              colorPalette="red"
              loading={isDeletingSelected}
              disabled={isDeletingSelected}
              onClick={() => void submitDeleteSelected()}
            >
              Delete {deleteTargetIds.length} scenarios
            </Button>
          </DialogFooter>
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
      {createDialog &&
        createDialog !== 'suite' &&
        createDialog !== 'edit-suite' &&
        createDialog !== 'rename-folder' && (
          <Dialog
            title={
              createDialog === 'folder'
                ? selectedFolder
                  ? `Create folder inside ${selectedFolder.name}`
                  : 'Create folder'
                : createDialog === 'move-folder'
                  ? `Move ${targetFolder?.name ?? 'folder'}`
                  : createDialog === 'delete-folder'
                    ? `Delete folder “${targetFolder?.name ?? 'folder'}”?`
                    : `Delete suite “${targetSuite?.name ?? ''}”?`
            }
            onClose={() => setCreateDialog(null)}
          >
            <form onSubmit={(event) => void submitCreate(event)}>
              <DialogBody>
                <VStack align="stretch" gap={4}>
                  {createDialog === 'folder' && (
                    <label>
                      <Text mb={1}>Name</Text>
                      <Input
                        autoFocus
                        required
                        maxLength={200}
                        value={createName}
                        onChange={(event) => setCreateName(event.currentTarget.value)}
                        bg={undefined}
                      />
                    </label>
                  )}
                  {createDialog === 'folder' && (
                    <label>
                      <Text mb={1}>Description (optional)</Text>
                      <Textarea
                        value={createDescription}
                        onChange={(event) => setCreateDescription(event.currentTarget.value)}
                      />
                    </label>
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
                  {createDialog === 'delete-folder' &&
                    targetFolder &&
                    (() => {
                      const nestedFolders = flattenFolders([targetFolder]).slice(1);
                      const nestedFolderCount = nestedFolders.length;
                      const scenarioCount = folderScenarioCounts.get(targetFolder.id) ?? targetFolder.scenarioCount;

                      return (
                        <Text>
                          {nestedFolderCount === 0
                            ? `All ${scenarioCount} scenarios in this folder will move to No folder. Scenarios are not deleted.`
                            : `Its ${nestedFolderCount} subfolder${nestedFolderCount === 1 ? '' : 's'} ${nestedFolders.map((folder) => `“${folder.name}”`).join(', ')} will be deleted as well. All ${scenarioCount} scenario${scenarioCount === 1 ? '' : 's'} from these folders will move to No folder. Scenarios are not deleted.`}
                        </Text>
                      );
                    })()}
                  {createDialog === 'delete-suite' && (
                    <Text color="text.secondary">
                      {targetSuite?.members?.length ?? 0} scenario{targetSuite?.members?.length === 1 ? '' : 's'} will
                      be unlinked from this suite. The scenarios themselves stay in the catalog. This can’t be undone.
                    </Text>
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
                  disabled={isCreating || (['folder', 'rename-folder'].includes(createDialog) && !createName.trim())}
                  loading={isCreating}
                >
                  {createDialog === 'folder'
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
