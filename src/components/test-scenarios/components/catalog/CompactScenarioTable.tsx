// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState } from 'react';
import { Box, Button, Table, Text } from '@chakra-ui/react';

import { ContextMenuButton } from '@/components/ui';
import type { TestScenarioContextMenuHandler } from '@/components/test-scenarios';

import type { TestScenarioSummary } from '../../types';
import { ScenarioSummaryCells, ScenarioSummaryHeaders } from './ScenarioSummaryCells';
import { CatalogLoadingRow, CatalogTableEmptyState } from './CatalogTableStates';
import { SCENARIO_DRAG_MIME } from './utils';

interface CompactScenarioTableProps {
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
}

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
}: CompactScenarioTableProps) => {
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

  const columnCount = 9 + Number(Boolean(onScenarioActions));

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
            <ScenarioSummaryHeaders />
            {onScenarioActions && (
              <Table.ColumnHeader w="48px">
                <Text srOnly>Actions</Text>
              </Table.ColumnHeader>
            )}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading && !scenarios.length ? (
            <CatalogLoadingRow columnCount={columnCount} />
          ) : scenarios.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columnCount} py={8} textAlign="center">
                <CatalogTableEmptyState
                  searchActive={searchActive}
                  emptyFolder={emptyFolder && !searchActive}
                  onCreateScenario={onCreateScenario}
                />
              </Table.Cell>
            </Table.Row>
          ) : (
            scenarios.map((scenario, index) => {
              const selected = selectedIds.includes(scenario.id);
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
                  bg={selected ? 'blue.subtle' : undefined}
                  _hover={{ bg: selected ? 'blue.subtle' : 'bg.subtle' }}
                >
                  <Table.Cell px={1} py={2}>
                    <Button
                      type="button"
                      size="xs"
                      minW="24px"
                      w="24px"
                      p={0}
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
                  <ScenarioSummaryCells
                    scenario={scenario}
                    originSearch={originSearch}
                    folderPathById={folderPathById}
                    unfiledLabel="No folder"
                  />
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
