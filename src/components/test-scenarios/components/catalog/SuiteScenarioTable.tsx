// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState, type DragEvent } from 'react';
import { Box, Button, Table, Text } from '@chakra-ui/react';

import type { TestScenarioSummary } from '../../types';
import { ScenarioSummaryCells, ScenarioSummaryHeaders } from './ScenarioSummaryCells';
import { CatalogLoadingRow, CatalogTableEmptyState } from './CatalogTableStates';
import { SCENARIO_DRAG_MIME } from './utils';

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
      <Table.Root
        size="sm"
        variant="outline"
        w="100%"
        minW="980px"
        tableLayout="fixed"
        borderCollapse="separate"
        borderSpacing="8px 0"
        css={{ '& th, & td': { paddingInline: 0, paddingBlock: '8px' } }}
      >
        <Table.Header>
          <Table.Row bg="bg.subtle">
            {enableSuiteDrag && (
              <Table.ColumnHeader w="24px" py={2}>
                <Text srOnly>Drag to another suite or reorder</Text>
              </Table.ColumnHeader>
            )}
            <Table.ColumnHeader px={3} py={2} w="20px">
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
            <ScenarioSummaryHeaders showFolder={showFolder} />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading && !scenarios.length ? (
            <CatalogLoadingRow columnCount={7 + Number(showFolder) + Number(enableSuiteDrag)} />
          ) : scenarios.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={7 + Number(showFolder) + Number(enableSuiteDrag)} py={8} textAlign="center">
                <CatalogTableEmptyState
                  searchActive={searchActive}
                  emptySuite={emptySuite}
                  suiteView={enableSuiteDrag}
                  onAddScenarios={onAddScenarios}
                />
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
                      ? 'blue.subtle'
                      : undefined
                }
                _hover={{
                  bg: selectedIds.includes(scenario.id) ? 'blue.subtle' : 'bg.subtle',
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
                      minW="24px"
                      w="24px"
                      p={0}
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
                <ScenarioSummaryCells
                  scenario={scenario}
                  originSearch={originSearch}
                  folderPathById={folderPathById}
                  showFolder={showFolder}
                  unfiledLabel="Unfiled"
                />
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};
