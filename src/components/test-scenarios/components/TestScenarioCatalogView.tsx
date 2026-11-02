// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from 'react';
import {
  Box,
  Button,
  Collapsible,
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
  FiChevronsUp,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
  FiFolder,
  FiLayers,
  FiMoreHorizontal,
  FiPlus,
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
  Pagination,
  Tooltip,
  Wrap,
} from '@/components/ui';
import { extractApiError } from '@/utils/apiErrors';

import { TestSuiteAddScenariosDialogContainer } from '../containers/TestSuiteAddScenariosDialogContainer';
import { getTestScenarioDetailPath } from '../constants';
import type { ScenarioOperationReport } from '../utils';
import type { TestScenarioPagination, TestScenarioSummary } from '../types';

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
  onSortChange: (value: NonNullable<TestScenarioCatalogViewProps['sort']>) => void;
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
  onAddSelectedToSuite: (suiteId: string) => Promise<ScenarioOperationReport>;
  onDeleteSelected: (scenarioIds: string[]) => Promise<ScenarioOperationReport>;
  onRemoveSelectedFromSuite: () => Promise<ScenarioOperationReport>;
  onReorderSuite: (suiteId: string, scenarioIds: string[]) => Promise<void>;
  onCreateFolder: (name: string, parentId: string | null, description?: string | null) => Promise<unknown>;
  onUpdateFolder: (
    folderId: string,
    body: { name?: string; parentId?: string | null; position?: number; description?: string | null },
  ) => Promise<unknown>;
  onDeleteFolder: (folderId: string, disposition: 'parent' | 'unfiled') => Promise<void>;
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

const formatScenarioDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString('en-US'),
    time: date.toLocaleTimeString('en-US'),
  };
};

const ScenarioTimestamp = ({ timestamp }: { timestamp: string }) => {
  const { date, time } = formatScenarioDate(timestamp);
  return (
    <VStack align="start" gap={0} whiteSpace="nowrap" fontSize="xs">
      <Text>{date}</Text>
      <Text>{time}</Text>
    </VStack>
  );
};

const TABLE_CELL_PADDING = { px: 4, py: 4 } as const;
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

const ScenarioColumnHeader = ({
  label,
  field,
  sort,
  sortDirection,
  onSortChange,
  filterValue,
  onFilterChange,
  openFilter,
  onFilterDisclosureChange,
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
  const filterRef = useRef<HTMLDetailsElement>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);
  const [filterPosition, setFilterPosition] = useState<{ top: number; left: number } | null>(null);
  useLayoutEffect(() => {
    if (openFilter !== field || !filterRef.current) return;
    const updatePosition = () => {
      const anchor = filterRef.current?.querySelector('summary')?.getBoundingClientRect();
      if (!anchor) return;
      const width = 260;
      setFilterPosition({
        top: Math.min(anchor.bottom + 6, window.innerHeight - 170),
        left: Math.max(8, Math.min(anchor.left, window.innerWidth - width - 8)),
      });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [field, filterValue, openFilter]);
  useEffect(() => {
    if (openFilter === field && filterPosition) filterInputRef.current?.focus();
  }, [field, filterPosition, openFilter]);
  return (
    <HStack gap={1} minW={0} justify="flex-start" flexWrap="nowrap">
      <Button
        size="xs"
        variant="ghost"
        px={1}
        minW={0}
        flex="1"
        h="auto"
        whiteSpace="nowrap"
        textAlign="start"
        justifyContent="flex-start"
        aria-label={`Sort by ${label}${activeSort ? ` ${activeDirection === 'asc' ? 'ascending' : 'descending'}` : ''}`}
        onClick={() => onSortChange(field)}
      >
        <Text as="span" overflow="hidden" textOverflow="ellipsis">
          {label}
        </Text>
        {activeSort ? (
          activeDirection === 'asc' ? (
            <FiArrowUp aria-hidden="true" />
          ) : (
            <FiArrowDown aria-hidden="true" />
          )
        ) : (
          <FiChevronsUp aria-hidden="true" />
        )}
      </Button>
      {onFilterChange && (
        <details
          ref={filterRef}
          data-filter-field={field}
          open={openFilter === field}
          onToggle={(event) => onFilterDisclosureChange(event.currentTarget.open ? field : null)}
          style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}
        >
          <Box
            as="summary"
            role="button"
            aria-label={`Filter by ${label}${filterValue ? ', filter active' : ''}`}
            aria-pressed={Boolean(filterValue)}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            listStyleType="none"
            cursor="pointer"
            borderRadius="md"
            w="24px"
            h="24px"
            color={filterValue ? 'blue.600' : 'text.muted'}
            bg={filterValue ? 'blue.subtle' : undefined}
            _hover={{ bg: 'bg.subtle', color: 'text.main' }}
          >
            <FiSearch aria-hidden="true" />
          </Box>
          {openFilter === field && filterPosition && (
            <Portal>
              <VStack
                data-filter-panel={field}
                align="stretch"
                gap={2}
                position="fixed"
                zIndex="popover"
                top={`${filterPosition.top}px`}
                left={`${filterPosition.left}px`}
                p={3}
                w="260px"
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border.main"
                borderRadius="md"
                boxShadow="lg"
                fontWeight="normal"
              >
                <Box>
                  <Text fontSize="sm" fontWeight="medium">
                    Search {label}
                  </Text>
                  <Text fontSize="xs" color="text.muted">
                    Match text anywhere in this column
                  </Text>
                </Box>
                <HStack>
                  <Input
                    ref={filterInputRef}
                    size="sm"
                    aria-label={`${label} filter`}
                    placeholder={`Search ${label.toLowerCase()}`}
                    value={filterValue ?? ''}
                    onChange={(event) => onFilterChange(event.currentTarget.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === 'Escape') {
                        event.preventDefault();
                        event.stopPropagation();
                        onFilterDisclosureChange(null);
                      }
                    }}
                    autoFocus
                  />
                  {filterValue && (
                    <IconButton
                      size="sm"
                      variant="ghost"
                      aria-label={`Clear ${label} filter`}
                      onClick={() => onFilterChange('')}
                    >
                      <FiX />
                    </IconButton>
                  )}
                </HStack>
              </VStack>
            </Portal>
          )}
        </details>
      )}
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
    <Text color="text.muted">
      {searchActive ? 'No scenarios match the current search.' : 'No Test Scenarios are available for this project.'}
    </Text>
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
  selectionDisabled: boolean;
  onToggleSelected: (id: string) => void;
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
      <Table.Root size="sm" variant="outline" w="100%" minW={showFolder ? '1100px' : '960px'} tableLayout="fixed">
        <Table.Header>
          <Table.Row bg="bg.subtle">
            <Table.ColumnHeader {...TABLE_CELL_PADDING} w="48px">
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
                <Table.Cell px={2} py={4} maxW="180px" whiteSpace="pre-wrap" overflowWrap="anywhere">
                  {scenario.scenarioKey ?? (
                    <Text as="span" color="text.muted">
                      —
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell {...TABLE_CELL_PADDING} minW={0} overflow="hidden">
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
                      title={scenario.title}
                    >
                      <RouterLink to={getTestScenarioDetailPath(scenario.id)}>{scenario.title}</RouterLink>
                    </ChakraLink>
                  </Tooltip>
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
            <Box position="relative" px={3} py={2} borderBottomWidth="1px" borderColor="border.main">
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
}: {
  value: NonNullable<TestScenarioCatalogViewProps['sort']>;
  onChange: (value: NonNullable<TestScenarioCatalogViewProps['sort']>) => void;
}) => {
  const [open, setOpen] = useState(false);
  const options: Array<{ value: typeof value; label: string }> = [
    { value: 'scenarioKey', label: 'Key' },
    { value: 'title', label: 'Title' },
    { value: 'folder', label: 'Folder' },
    { value: 'updatedAt', label: 'Updated' },
    { value: 'createdBy', label: 'Author' },
  ];
  const selectedLabel = options.find((option) => option.value === value)?.label ?? 'Updated';

  return (
    <Popover.Root open={open} onOpenChange={({ open: nextOpen }) => setOpen(nextOpen)}>
      <Popover.Trigger asChild>
        <Button
          aria-label={`Sort: ${selectedLabel}`}
          variant="outline"
          bg="bg.card"
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
                {options.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    justifyContent="flex-start"
                    fontWeight={option.value === value ? 'semibold' : 'normal'}
                    aria-current={option.value === value ? 'true' : undefined}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
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
                  <EmptyState searchActive={searchActive} />
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
                        title={scenario.scenarioKey ?? 'N/A'}
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
                        title={scenario.title}
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
                        title={folderPath}
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
                      <HStack gap={2} minW={0} title={fullAuthor}>
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
  onMoveSelected,
  onMoveScenarioIds,
  onAddSelectedToSuite,
  onDeleteSelected,
  onRemoveSelectedFromSuite,
  onReorderSuite,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onCreateSuite,
  onUpdateSuite,
  onDeleteSuite,
}: TestScenarioCatalogViewProps) {
  const isScenariosTab = organizationTab !== 'suites';
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
  const [deleteDisposition, setDeleteDisposition] = useState<'parent' | 'unfiled'>('parent');
  const [bulkSuiteId, setBulkSuiteId] = useState('');
  const [moveScenariosOpen, setMoveScenariosOpen] = useState(false);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [isDraggingScenario, setIsDraggingScenario] = useState(false);
  const activeDrag = useRef<{ projectId: string; scenarioIds: string[] } | null>(null);
  const [moveScenariosTarget, setMoveScenariosTarget] = useState('');
  const [moveScenariosError, setMoveScenariosError] = useState<string | null>(null);
  const [operationFeedback, setOperationFeedback] = useState<string | null>(null);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const scopeKey = `${scope.kind}:${scope.id ?? ''}`;
  const latestScope = useRef(scopeKey);
  const moveDialogScope = useRef<string | null>(null);
  latestScope.current = scopeKey;
  useEffect(() => {
    moveDialogScope.current = null;
    setMoveScenariosOpen(false);
    setMoveScenariosTarget('');
    setMoveScenariosError(null);
    setDeleteSelectedOpen(false);
  }, [scopeKey]);

  const [isMovingScenarios, setIsMovingScenarios] = useState(false);
  const [addToSuiteOpen, setAddToSuiteOpen] = useState(false);
  const [addToSuiteError, setAddToSuiteError] = useState<string | null>(null);
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
  const folderRows = flattenFolders(folders);
  const showFolderColumn = scope.kind === 'all' || scope.kind === 'suite' || scope.kind === 'folder';
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
    setTargetFolder(folder);
    setMoveParentId(folder.parentId ?? '');
    setDeleteDisposition('parent');
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
        await onCreateFolder(createName.trim(), selectedFolder?.id ?? null, createDescription.trim() || null);
      } else if (createDialog === 'suite') {
        await onCreateSuite({
          name: createName.trim(),
          purpose: createPurpose.trim() || undefined,
          release: createRelease.trim() || undefined,
          description: createDescription.trim() || undefined,
        });
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
  const submitMoveScenarios = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      isMovingScenarios ||
      selectedIds.length === 0 ||
      scope.kind === 'suite' ||
      moveDialogScope.current !== latestScope.current
    )
      return;
    setIsMovingScenarios(true);
    setMoveScenariosError(null);
    try {
      showOperationReport(await onMoveSelected(moveScenariosTarget === UNFILED_DESTINATION ? null : moveScenariosTarget));
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
      showOperationReport(await onAddSelectedToSuite(bulkSuiteId));
      setAddToSuiteOpen(false);
    } catch (error) {
      setAddToSuiteError(getActionErrorMessage(error));
    } finally {
      setIsAddingToSuite(false);
    }
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
      showOperationReport(await onRemoveSelectedFromSuite());
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
      void onMoveScenarioIds(ids, destinationId).then(showOperationReport).catch((error: unknown) => {
        setOperationFeedback(getActionErrorMessage(error));
      });
    } catch {
      return;
    }
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
    const selected = scope.kind === 'folder' && scope.id === folder.id;
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
            onClick={() => onScopeChange({ kind: 'folder', id: folder.id })}
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
      pb={selectedIds.length > 0 ? { base: 28, md: 24 } : undefined}
      bg="bg.card"
      borderRadius="lg"
    >
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
                  variant={scope.kind === 'all' ? 'subtle' : 'ghost'}
                  colorPalette={scope.kind === 'all' ? 'blue' : undefined}
                  borderStartWidth="3px"
                  borderStartColor={scope.kind === 'all' ? 'blue.500' : 'transparent'}
                  aria-current={scope.kind === 'all' ? 'page' : undefined}
                  onClick={() => onScopeChange({ kind: 'all' })}
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
                onClick={() => onScopeChange({ kind: 'unfiled' })}
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
            {organizationTab !== 'scenarios' && (
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
            )}
          </VStack>

          <VStack align="stretch" gap={4} minW="0">
            <Box minH={{ base: 'auto', md: selectedFolder ? '84px' : 'auto' }}>
              <HStack justify="space-between" align="start" gap={3} flexWrap="wrap">
                <Box minW="0" flex="1">
                  <Heading fontSize="lg" lineHeight="1.3">
                    {selectedFolderPath ??
                      selectedSuite?.name ??
                      (scope.kind === 'unfiled' ? 'No folder scenarios' : 'All scenarios')}
                  </Heading>
                  {selectedFolder?.description && (
                    <Text mt={1} color="text.secondary" fontSize="sm">
                      {selectedFolder.description}
                    </Text>
                  )}
                  <Text mt={selectedFolder?.description ? 0 : 1} color="text.muted" fontSize="sm">
                    {selectedFolder
                      ? `${pagination.total} scenarios`
                      : selectedSuite
                        ? `${selectedSuite.members?.length ?? 0} scenarios${selectedSuite.release ? ` · ${selectedSuite.release}` : ''}`
                        : scope.kind === 'unfiled'
                          ? `${pagination.total} scenarios without a folder`
                          : `${pagination.total} scenarios`}
                  </Text>
                </Box>
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
                <HStack gap={2}>
                  <Button aria-label="Create Test Scenario" variant="primary" onClick={onCreateScenario}>
                    <FiPlus />
                    Create scenario
                  </Button>
                  {isScenariosTab && scope.kind !== 'all' && (
                    <Menu.Root>
                      <Menu.Trigger asChild>
                        <IconButton aria-label="Folder actions" size="md" variant="outline">
                          <FiMoreHorizontal />
                        </IconButton>
                      </Menu.Trigger>
                      <Menu.Positioner>
                        <Menu.Content>
                          <Menu.Item value="create-folder" onClick={() => openCreateDialog('folder')}>
                            {selectedFolder ? 'Create subfolder' : 'Create folder'}
                          </Menu.Item>
                          {selectedFolder && (
                            <>
                              <Menu.Item value="rename-folder" onClick={() => openEditFolderDialog(selectedFolder)}>
                                Edit folder details
                              </Menu.Item>
                              <Menu.Item
                                value="move-folder-up"
                                disabled={selectedFolderIndex <= 0}
                                onClick={() => void reorderFolder(selectedFolder, -1)}
                              >
                                Move up
                              </Menu.Item>
                              <Menu.Item
                                value="move-folder-down"
                                disabled={
                                  selectedFolderIndex < 0 || selectedFolderIndex >= selectedFolderSiblings.length - 1
                                }
                                onClick={() => void reorderFolder(selectedFolder, 1)}
                              >
                                Move down
                              </Menu.Item>
                              <Menu.Item
                                value="move-folder"
                                onClick={() => openFolderActionDialog('move-folder', selectedFolder)}
                              >
                                Move
                              </Menu.Item>
                              <Menu.Item
                                value="delete-folder"
                                color="fg.error"
                                onClick={() => openFolderActionDialog('delete-folder', selectedFolder)}
                              >
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
                    bg={search.trim() ? 'bg.active' : 'bg.card'}
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
                {isScenariosTab ? (
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
                    <ScenarioSortSelect value={sort ?? 'updatedAt'} onChange={onSortChange} />
                    <Tooltip content={sortDirection === 'desc' ? 'Descending' : 'Ascending'}>
                      <IconButton
                        aria-label={`Sort ${sortDirection === 'desc' ? 'descending' : 'ascending'}`}
                        variant="outline"
                        bg="bg.card"
                        color="text.primary"
                        borderColor="border.main"
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

            {operationFeedback && (
              <HStack role="alert" color="fg.error" fontSize="sm">
                <Text>{operationFeedback}</Text>
                <IconButton aria-label="Dismiss operation feedback" size="xs" variant="ghost" onClick={() => setOperationFeedback(null)}>
                  <FiX />
                </IconButton>
              </HStack>
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
            {selectedIds.length > 0 && (
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
                  bg="black"
                  color="white"
                  borderRadius="lg"
                  boxShadow="0 8px 28px rgba(0, 0, 0, 0.28)"
                  aria-label="Bulk scenario actions"
                  role="toolbar"
                  _dark={{ bg: 'white', color: 'gray.900' }}
                >
                  <Text px={1} fontSize="sm" fontWeight="semibold" whiteSpace="nowrap">
                    {selectedIds.length} selected
                  </Text>
                  {isScenariosTab && !allMatchingSelected && selectedIds.length < pagination.total && (
                    <Button
                      size="sm"
                      variant="ghost"
                      color="blue.300"
                      textDecoration="underline"
                      disabled={isResolvingSelection || isExecutingOperation}
                      onClick={() => void selectAllMatching()}
                      _dark={{ color: 'blue.700' }}
                      _hover={{ bg: 'whiteAlpha.200' }}
                    >
                      Select all {pagination.total}
                    </Button>
                  )}
                  {scope.kind !== 'suite' && (
                    <Menu.Root>
                      <Menu.Trigger asChild>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          aria-label="More bulk actions"
                          disabled={isExecutingOperation}
                          color="inherit"
                          _hover={{ bg: 'whiteAlpha.200' }}
                        >
                          <FiMoreHorizontal />
                        </IconButton>
                      </Menu.Trigger>
                      <Menu.Positioner>
                        <Menu.Content>
                          <Menu.Item
                            value="move-selected"
                            onClick={() => {
                              moveDialogScope.current = scopeKey;
                              setMoveScenariosTarget('');
                              setMoveScenariosError(null);
                              setMoveScenariosOpen(true);
                            }}
                          >
                            <HStack justify="space-between" w="full">
                              <Text>Move to folder</Text>
                              <FiFolder aria-hidden="true" />
                            </HStack>
                          </Menu.Item>
                        </Menu.Content>
                      </Menu.Positioner>
                    </Menu.Root>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={suites.length === 0 || isExecutingOperation}
                    onClick={() => {
                      setBulkSuiteId('');
                      setAddToSuiteError(null);
                      setAddToSuiteOpen(true);
                    }}
                    color="inherit"
                    _hover={{ bg: 'whiteAlpha.200' }}
                  >
                    <FiLayers aria-hidden="true" />
                    Add to suite
                  </Button>
                  {isScenariosTab && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isExecutingOperation}
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
                  {scope.kind === 'suite' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isExecutingOperation}
                      onClick={() => {
                        setRemoveFromSuiteError(null);
                        setRemoveFromSuiteOpen(true);
                      }}
                      color="inherit"
                      _hover={{ bg: 'whiteAlpha.200' }}
                    >
                      Remove from suite
                    </Button>
                  )}
                  <IconButton
                    size="sm"
                    variant="ghost"
                    aria-label="Close bulk scenario actions and clear selection"
                    disabled={isExecutingOperation}
                    onClick={clearSelection}
                    color="inherit"
                    _hover={{ bg: 'whiteAlpha.200' }}
                  >
                    <FiX />
                  </IconButton>
                </HStack>
              </Portal>
            )}

            <Box borderWidth="1px" borderColor="border.main" borderRadius="lg" overflow="hidden" bg="bg.card">
              {organizationTab === 'suites' && !selectedSuite ? (
                <Text p={6} textAlign="center" color="text.muted">
                  Select a suite to view its scenarios.
                </Text>
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
                        activeDrag.current = { projectId: dragProjectId, scenarioIds };
                        setIsDraggingScenario(true);
                      }}
                      onDragEnd={() => {
                        activeDrag.current = null;
                        setIsDraggingScenario(false);
                        setDragOverFolderId(null);
                      }}
                      folderPathById={folderPathById}
                      searchActive={Boolean(search.trim()) || Boolean(priority) || selectedAuthorIds.length > 0}
                    />
                  ) : (
                    <ScenarioTable
                      scenarios={scenarios}
                      isLoading={isLoading}
                      selectedIds={selectedIds}
                      selectionDisabled={isExecutingOperation}
                      onToggleSelected={toggleSelected}
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
                  )}
                  {(isScenariosTab || scenarios.length > 0) && (
                    <HStack
                      justify="space-between"
                      flexWrap="wrap"
                      p={3}
                      borderTopWidth="1px"
                      borderColor="border.main"
                    >
                      {isScenariosTab ? (
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
                      ) : (
                        <PaginationSummary pagination={pagination} />
                      )}
                      {!isScenariosTab && pagination.totalPages > 1 && (
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
      {moveScenariosOpen && scope.kind !== 'suite' && moveDialogScope.current === scopeKey && (
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
                  <option value={UNFILED_DESTINATION}>No folder</option>
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
                      bg={
                        createDialog === 'rename-folder' || createDialog === 'suite'
                          ? 'white'
                          : createDialog === 'edit-suite'
                            ? 'bg.card'
                            : undefined
                      }
                    />
                  </label>
                )}
                {['folder', 'rename-folder', 'suite', 'edit-suite'].includes(createDialog) && (
                  <>
                    {(createDialog === 'folder' || createDialog === 'rename-folder') && (
                      <label>
                        <Text mb={1}>Description (optional)</Text>
                        <Textarea
                          value={createDescription}
                          onChange={(event) => setCreateDescription(event.currentTarget.value)}
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
                            bg={
                              createDialog === 'suite' ? 'white' : createDialog === 'edit-suite' ? 'bg.card' : undefined
                            }
                          />
                        </label>
                        <label>
                          <Text mb={1}>Release (optional)</Text>
                          <Input
                            value={createRelease}
                            onChange={(event) => setCreateRelease(event.currentTarget.value)}
                            bg={
                              createDialog === 'suite' ? 'white' : createDialog === 'edit-suite' ? 'bg.card' : undefined
                            }
                          />
                        </label>
                        <label>
                          <Text mb={1}>Description (optional)</Text>
                          <Textarea
                            value={createDescription}
                            onChange={(event) => setCreateDescription(event.currentTarget.value)}
                            bg={
                              createDialog === 'suite' ? 'white' : createDialog === 'edit-suite' ? 'bg.card' : undefined
                            }
                          />
                        </label>
                      </>
                    )}
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
                      <option value="unfiled">No folder</option>
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
