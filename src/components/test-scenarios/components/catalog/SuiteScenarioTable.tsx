// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState, type DragEvent } from 'react';
import { Box, Button, HStack, Link as ChakraLink, Table, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';

import { Tooltip } from '@/components/ui';

import { getTestScenarioDetailPath } from '../../constants';
import type { TestScenarioSummary } from '../../types';
import { CatalogTableEmptyState } from './CatalogTableStates';
import { authorInitials, compactDate, priorityColors, SCENARIO_DRAG_MIME, shortAuthorName } from './utils';

interface SuiteScenarioTableProps {
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
}

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
}: SuiteScenarioTableProps) => {
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
  const handleToggleAll = () => {
    const allSelected = scenarios.every((scenario) => selectedIds.includes(scenario.id));
    scenarios
      .filter((scenario) => selectedIds.includes(scenario.id) === allSelected)
      .forEach((scenario) => onToggleSelected(scenario.id));
  };

  const handleCaptureShiftSelection = (event: React.MouseEvent<HTMLInputElement>) => {
    extendSelectionRef.current = event.shiftKey;
  };

  const handleToggleScenario = (scenarioId: string, index: number) => {
    handleScenarioSelection(scenarioId, index, extendSelectionRef.current);
    extendSelectionRef.current = false;
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
                  <CatalogTableEmptyState
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
                    onClick={handleCaptureShiftSelection}
                    onChange={() => handleToggleScenario(scenario.id, index)}
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
