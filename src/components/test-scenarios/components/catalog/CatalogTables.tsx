// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState, type DragEvent } from 'react';
import { Box, Button, HStack, IconButton, Link as ChakraLink, Table, Text, VStack } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router';

import { Alert, ContextMenuButton, NativeSelect, Tooltip } from '@/components/ui';

import type { TestScenarioContextMenuHandler } from '../../hooks/useTestScenarioContextMenu';
import { getTestScenarioDetailPath } from '../../constants';
import type { TestScenarioPagination, TestScenarioSummary } from '../../types';
import { priorityColors, SCENARIO_DRAG_MIME, shortAuthorName } from './utils';

export const CatalogLoadError = () => (
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

export const SuiteScenarioTable = ({
  originSearch,
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
  originSearch: string;
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
            {enableSuiteDrag && (
              <Table.ColumnHeader w="30px" py={2}>
                <Text srOnly>Drag to another suite or reorder</Text>
              </Table.ColumnHeader>
            )}
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
                  <EmptyState
                    searchActive={searchActive}
                    emptySuite={emptySuite}
                    suiteView={enableSuiteDrag}
                    onAddScenarios={onAddScenarios}
                  />
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
                css={
                  enableSuiteReorder && dragOverScenarioId === scenario.id
                    ? { '& > td': { boxShadow: 'inset 0 2px 0 #3182ce' } }
                    : undefined
                }
                draggable={enableSuiteDrag && !selectionDisabled && Boolean(projectId)}
                onDragStart={
                  enableSuiteDrag
                    ? (event) => {
                        const scenarioIds = selectedIds.includes(scenario.id) ? selectedIds : [scenario.id];
                        onDragPayload(projectId ?? '', scenarioIds);
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData(SCENARIO_DRAG_MIME, JSON.stringify({ projectId, scenarioIds }));
                      }
                    : undefined
                }
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
                      <RouterLink to={`${getTestScenarioDetailPath(scenario.id)}${originSearch}`}>
                        {scenario.title}
                      </RouterLink>
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

const compactDate = (value: string) => new Date(value).toLocaleDateString('en-US');
const authorInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

export const CompactScenarioTable = ({
  originSearch,
  onScenarioActions,
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
  originSearch: string;
  onScenarioActions?: TestScenarioContextMenuHandler;
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
            {onScenarioActions && (
              <Table.ColumnHeader w="48px">
                <Text srOnly>Actions</Text>
              </Table.ColumnHeader>
            )}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {scenarios.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={8 + Number(Boolean(onScenarioActions))} py={8} textAlign="center">
                {isLoading ? (
                  <Text role="status" color="text.muted">
                    Searching scenarios…
                  </Text>
                ) : (
                  <EmptyState
                    searchActive={searchActive}
                    emptyFolder={emptyFolder && !searchActive}
                    onCreateScenario={onCreateScenario}
                  />
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
                        event.dataTransfer.setData(SCENARIO_DRAG_MIME, JSON.stringify({ projectId, scenarioIds }));
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
                        <RouterLink to={`${getTestScenarioDetailPath(scenario.id)}${originSearch}`}>
                          {scenario.title}
                        </RouterLink>
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
                      <Text display="block" maxW="100%" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
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
                  {onScenarioActions && (
                    <Table.Cell px={1}>
                      <ContextMenuButton
                        aria-label={`Actions for ${scenario.title}`}
                        onClick={(event) => onScenarioActions(event, scenario)}
                      />
                    </Table.Cell>
                  )}
                </Table.Row>
              );
            })
          )}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export const CatalogPagination = ({
  pagination,
  pageSize,
  pageSizes,
  onPageSizeChange,
  onPageChange,
}: {
  pagination: TestScenarioPagination;
  pageSize: number;
  pageSizes: readonly number[];
  onPageSizeChange: (value: number) => void;
  onPageChange: (page: number) => void;
}) => (
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
);
