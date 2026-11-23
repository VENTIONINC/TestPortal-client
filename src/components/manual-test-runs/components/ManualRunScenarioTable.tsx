// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useRef, type Dispatch, type KeyboardEvent, type SetStateAction } from 'react';
import { Box, Button, HStack, Table, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router';
import { FiCheck, FiSkipForward, FiSlash, FiX } from 'react-icons/fi';

import type { ManualTestRunScenarioRead, ManualTestRunScenarioResult } from '@/redux/apis/generatedApi';
import { green_100, grey_2100, grey_skipped, orange_300, red_100, yellow_100 } from '@/theme/colors/palette';

import { MANUAL_RUN_RESULT } from '../constants';
import { AssigneePicker } from './AssigneePicker';
import { RESULTS, resultExplanations, resultLabels } from './manualRunResults';

const selectedResultColors: Partial<Record<(typeof RESULTS)[number], string>> = {
  [MANUAL_RUN_RESULT.BLOCKED]: orange_300,
  [MANUAL_RUN_RESULT.SKIPPED]: grey_2100,
};

const INSTRUCTION_FIELDS = [
  ['Details', 'details'],
  ['Preconditions', 'preconditions'],
  ['Test data', 'testData'],
] as const;

interface ManualRunScenarioTableProps {
  runId: string;
  completed: boolean;
  writesBlocked: boolean;
  visibleScenarios: ManualTestRunScenarioRead[];
  selectedScenarioIds: string[];
  setSelectedScenarioIds: Dispatch<SetStateAction<string[]>>;
  expandedScenarioId: string | undefined;
  setExpandedScenarioId: Dispatch<SetStateAction<string | undefined>>;
  users: Array<{ id: string; name: string }>;
  onLoadUsers: () => void;
  onUpdateAssignee: (scenarioId: string, assigneeId: string | null) => void;
  onUpdateResult: (scenario: ManualTestRunScenarioRead, result: ManualTestRunScenarioResult) => void;
  onScenarioKeyDown: (scenario: ManualTestRunScenarioRead, event: KeyboardEvent) => void;
  onReorder: (sourceId: string, targetId: string) => void;
}

export const ManualRunScenarioTable = ({
  runId,
  completed,
  writesBlocked,
  visibleScenarios,
  selectedScenarioIds,
  setSelectedScenarioIds,
  expandedScenarioId,
  setExpandedScenarioId,
  users,
  onLoadUsers,
  onUpdateAssignee,
  onUpdateResult,
  onScenarioKeyDown,
  onReorder,
}: ManualRunScenarioTableProps) => {
  const draggedScenarioId = useRef<string | undefined>(undefined);

  const handleDragStart = (scenarioId: string, event: React.DragEvent<HTMLTableRowElement>) => {
    draggedScenarioId.current = scenarioId;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', scenarioId);
  };

  const handleDragOver = (event: React.DragEvent<HTMLTableRowElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (scenarioId: string, event: React.DragEvent<HTMLTableRowElement>) => {
    event.preventDefault();
    if (draggedScenarioId.current) onReorder(draggedScenarioId.current, scenarioId);
    draggedScenarioId.current = undefined;
  };

  const handleDragEnd = () => {
    draggedScenarioId.current = undefined;
  };

  const handleToggleInstructions = (scenarioId: string) => {
    setExpandedScenarioId((current) => (current === scenarioId ? undefined : scenarioId));
  };

  return (
    <Box overflowX="auto" borderWidth="1px" borderColor="border" borderRadius="md">
      <Table.Root size="sm" variant="line" tableLayout="fixed" minW="810px" w="full">
        <colgroup>
          <col style={{ width: '28px' }} />
          <col style={{ width: '40px' }} />
          <col style={{ width: '152px' }} />
          <col style={{ width: '80px' }} />
          <col />
          <col style={{ width: '160px' }} />
          <col style={{ width: '150px' }} />
        </colgroup>
        <Table.Header>
          <Table.Row bg="bg.subtle">
            <Table.ColumnHeader aria-label="Reorder" w="28px"></Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center" verticalAlign="middle">
              <input
                aria-label="Select visible scenarios"
                type="checkbox"
                style={{ width: '16px', height: '16px', display: 'block', margin: 'auto' }}
                disabled={completed}
                checked={
                  visibleScenarios.length > 0 && visibleScenarios.every((item) => selectedScenarioIds.includes(item.id))
                }
                onChange={(event) =>
                  setSelectedScenarioIds((current) =>
                    event.target.checked
                      ? [...new Set([...current, ...visibleScenarios.map((item) => item.id)])]
                      : current.filter((id) => !visibleScenarios.some((item) => item.id === id)),
                  )
                }
              />
            </Table.ColumnHeader>
            <Table.ColumnHeader color="fg.muted" fontSize="xs">
              Status
            </Table.ColumnHeader>
            <Table.ColumnHeader color="fg.muted" fontSize="xs">
              Key
            </Table.ColumnHeader>
            <Table.ColumnHeader color="fg.muted" fontSize="xs">
              Title
            </Table.ColumnHeader>
            <Table.ColumnHeader color="fg.muted" fontSize="xs">
              Folder
            </Table.ColumnHeader>
            <Table.ColumnHeader color="fg.muted" fontSize="xs">
              Assignee
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {visibleScenarios.map((scenario) => (
            <Table.Row
              id={`manual-run-scenario-${scenario.id}`}
              key={scenario.id}
              tabIndex={0}
              draggable={!completed && !writesBlocked}
              onDragStart={(event) => handleDragStart(scenario.id, event)}
              onDragOver={handleDragOver}
              onDrop={(event) => handleDrop(scenario.id, event)}
              onDragEnd={handleDragEnd}
              onKeyDown={(event) => onScenarioKeyDown(scenario, event)}
              bg={
                selectedScenarioIds.includes(scenario.id)
                  ? 'blue.50'
                  : scenario.result === MANUAL_RUN_RESULT.PASSED
                    ? green_100
                    : scenario.result === MANUAL_RUN_RESULT.FAILED
                      ? red_100
                      : scenario.result === MANUAL_RUN_RESULT.BLOCKED
                        ? yellow_100
                        : scenario.result === MANUAL_RUN_RESULT.SKIPPED
                          ? grey_skipped
                          : undefined
              }
            >
              <Table.Cell
                color="fg.muted"
                cursor={completed ? 'default' : 'grab'}
                aria-label={`Drag ${scenario.title} to reorder`}
                title="Drag to reorder"
              >
                ⠿
              </Table.Cell>
              <Table.Cell textAlign="center" verticalAlign="middle">
                <input
                  aria-label={`Select ${scenario.title}`}
                  type="checkbox"
                  style={{ width: '16px', height: '16px', display: 'block', margin: 'auto' }}
                  disabled={completed}
                  checked={selectedScenarioIds.includes(scenario.id)}
                  onChange={(event) =>
                    setSelectedScenarioIds((current) =>
                      event.target.checked ? [...current, scenario.id] : current.filter((id) => id !== scenario.id),
                    )
                  }
                />
              </Table.Cell>
              <Table.Cell>
                <HStack gap={1}>
                  {RESULTS.map((result) => {
                    const palettes = {
                      passed: 'green',
                      failed: 'red',
                      blocked: 'orange',
                      skipped: 'gray',
                    } as const;
                    const icons = {
                      passed: FiCheck,
                      failed: FiX,
                      blocked: FiSlash,
                      skipped: FiSkipForward,
                    } as const;
                    const ResultIcon = icons[result];
                    const isSelected = scenario.result === result;
                    const selectedColor = selectedResultColors[result];
                    const background = isSelected ? selectedColor : 'bg.panel';
                    const borderColor = isSelected ? selectedColor : 'border.main';
                    const hoverStyle = isSelected && selectedColor ? { bg: selectedColor } : undefined;

                    return (
                      <Button
                        key={result}
                        size="xs"
                        minW="30px"
                        w="30px"
                        h="30px"
                        p={0}
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="18px"
                        lineHeight="1"
                        colorPalette={palettes[result]}
                        variant={isSelected ? 'solid' : 'outline'}
                        bg={background}
                        borderColor={borderColor}
                        _hover={hoverStyle}
                        aria-label={`${scenario.title}: mark ${resultLabels[result]}`}
                        aria-pressed={isSelected}
                        title={`${resultLabels[result]} (${result[0].toUpperCase()}). ${resultExplanations[result]} ${isSelected ? 'Select again to reset this scenario to Untested.' : `Select to mark this scenario ${resultLabels[result]}.`}`}
                        disabled={completed || writesBlocked}
                        onClick={() => onUpdateResult(scenario, result)}
                      >
                        <ResultIcon size={18} strokeWidth={2.5} aria-hidden="true" />
                      </Button>
                    );
                  })}
                </HStack>
              </Table.Cell>
              <Table.Cell>{scenario.sourceScenarioKey}</Table.Cell>
              <Table.Cell>
                <VStack align="start" gap={0} minW={0}>
                  <HStack gap={1} align="center" maxW="full" minW={0}>
                    <Box
                      asChild
                      fontWeight="medium"
                      minW={0}
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      title={scenario.title}
                    >
                      <Link
                        to={`/manual-test-runs/${encodeURIComponent(runId)}/scenarios/${encodeURIComponent(scenario.id)}`}
                        aria-label={`Open ${scenario.title}`}
                      >
                        {scenario.title}
                      </Link>
                    </Box>
                    <Button
                      size="xs"
                      variant="ghost"
                      minW="5"
                      h="5"
                      p={0}
                      flexShrink={0}
                      aria-label={`Instructions for ${scenario.title}`}
                      aria-expanded={expandedScenarioId === scenario.id}
                      onClick={() => handleToggleInstructions(scenario.id)}
                    >
                      ⓘ
                    </Button>
                  </HStack>
                  {expandedScenarioId === scenario.id && (
                    <Box py={2} whiteSpace="pre-wrap">
                      {INSTRUCTION_FIELDS.map(([label, field]) => {
                        const value = scenario[field];
                        return (
                          value && (
                            <Box key={field} mb={2}>
                              <Text fontWeight="semibold">{label}</Text>
                              <Text>{value}</Text>
                            </Box>
                          )
                        );
                      })}
                      <Text fontWeight="semibold">Steps</Text>
                      {scenario.steps.length ? (
                        [...scenario.steps]
                          .sort((a, b) => a.position - b.position)
                          .map((step, index) => (
                            <Box key={step.id} mt={2}>
                              <Text>
                                {index + 1}. {step.action}
                              </Text>
                              <Text color="fg.muted">Expected: {step.expectedResult || 'Not specified'}</Text>
                            </Box>
                          ))
                      ) : (
                        <Text color="fg.muted">No steps captured.</Text>
                      )}
                    </Box>
                  )}
                </VStack>
              </Table.Cell>
              <Table.Cell fontSize="13px" overflowWrap="anywhere">
                {scenario.folderPath ?? 'Unfiled'}
              </Table.Cell>
              <Table.Cell>
                <AssigneePicker
                  scenario={scenario}
                  users={users}
                  disabled={completed || writesBlocked}
                  onOpen={onLoadUsers}
                  onChange={(assigneeId) => onUpdateAssignee(scenario.id, assigneeId)}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};
