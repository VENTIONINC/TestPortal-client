// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState } from 'react';
import { Box, Button, HStack, Link as ChakraLink, Table, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';

import { ContextMenuButton, Tooltip } from '@/components/ui';

import { getTestScenarioDetailPath } from '../../constants';
import type { TestScenarioContextMenuHandler } from '../../hooks/useTestScenarioContextMenu';
import type { TestScenarioSummary } from '../../types';
import { CatalogTableEmptyState } from './CatalogTableStates';
import { authorInitials, compactDate, priorityColors, SCENARIO_DRAG_MIME, shortAuthorName } from './utils';

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
  const handleToggleAll = () => {
    const allSelected = scenarios.every((scenario) => selectedIds.includes(scenario.id));
    scenarios
      .filter((scenario) => selectedIds.includes(scenario.id) === allSelected)
      .forEach((scenario) => onToggleSelected(scenario.id));
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
                onChange={handleToggleAll}
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
                  <CatalogTableEmptyState
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
              const handleScenarioDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
                const scenarioIds = selected ? selectedIds : [scenario.id];
                onDragPayload(projectId, scenarioIds);
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData(SCENARIO_DRAG_MIME, JSON.stringify({ projectId, scenarioIds }));
              };

              const handleCaptureShiftSelection = (event: React.MouseEvent<HTMLInputElement>) => {
                extendSelection.current = event.shiftKey;
              };

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
                      onDragStart={handleScenarioDragStart}
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
                      onClick={handleCaptureShiftSelection}
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
