// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { Box, HStack, Table, Text } from '@chakra-ui/react';

import type { ManualTestRunScenarioResult, TestScenarioSummary } from '@/redux/apis/generatedApi';

const resultColors: Record<ManualTestRunScenarioResult, { bg: string; color: string }> = {
  passed: { bg: 'green.subtle', color: 'green.fg' },
  failed: { bg: 'red.subtle', color: 'red.fg' },
  blocked: { bg: 'orange.subtle', color: 'orange.fg' },
  untested: { bg: 'gray.subtle', color: 'fg.muted' },
  skipped: { bg: 'gray.subtle', color: 'fg.muted' },
};
const priorityColors = {
  high: { bg: 'status.attention.bg', color: 'orange.fg' },
  medium: { bg: 'status.total.bg', color: 'blue.fg' },
  low: { bg: 'status.neutral.bg', color: 'fg.muted' },
};

export interface ExistingRunScenario {
  sourceScenarioId: string;
  result: ManualTestRunScenarioResult;
}

interface ScenarioSelectionTableProps {
  rows: TestScenarioSummary[];
  ids: string[];
  existing: ExistingRunScenario[];
  fetching: boolean;
  disabled?: boolean;
  onToggleScenario: (id: string) => void;
  onTogglePage: (allSelected: boolean) => void;
}

export const ScenarioSelectionTable = ({
  rows,
  ids,
  existing,
  fetching,
  disabled,
  onToggleScenario,
  onTogglePage,
}: ScenarioSelectionTableProps) => {
  const allSelected = rows.length > 0 && rows.every((row) => ids.includes(row.id));
  return (
    <Box
      borderWidth="1px"
      borderColor="border.main"
      borderRadius="md"
      overflow="auto"
      flex="1"
      minH={0}
      aria-busy={fetching}
    >
      <Table.Root size="sm" minW="620px">
        <Table.Header>
          <Table.Row bg="bg.subtle">
            <Table.ColumnHeader colSpan={6}>
              <HStack>
                <input
                  type="checkbox"
                  aria-label="Select all scenarios on this page"
                  checked={allSelected}
                  disabled={disabled}
                  ref={(el) => {
                    if (el) el.indeterminate = !allSelected && rows.some((row) => ids.includes(row.id));
                  }}
                  onChange={() => onTogglePage(allSelected)}
                />
                <Text fontSize="sm" fontWeight="medium">
                  Select all {rows.length} shown
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  · {existing.length} already in the run
                </Text>
              </HStack>
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => {
            const result = existing.find((item) => item.sourceScenarioId === row.id)?.result;
            return (
              <Table.Row key={row.id} bg={ids.includes(row.id) ? 'blue.50' : undefined}>
                <Table.Cell>
                  <input
                    type="checkbox"
                    aria-label={`Select ${row.title}`}
                    checked={ids.includes(row.id)}
                    disabled={disabled}
                    onChange={() => onToggleScenario(row.id)}
                  />
                </Table.Cell>
                <Table.Cell color="fg.muted">{row.scenarioKey}</Table.Cell>
                <Table.Cell fontWeight="medium">{row.title}</Table.Cell>
                <Table.Cell color="fg.muted">{row.folderName ?? 'Unfiled'}</Table.Cell>
                <Table.Cell>
                  {result && (
                    <Text
                      as="span"
                      display="inline-block"
                      borderRadius="full"
                      px={2}
                      py="1px"
                      fontSize="xs"
                      bg={resultColors[result].bg}
                      color={resultColors[result].color}
                    >
                      {result[0].toUpperCase() + result.slice(1)}
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {row.priority && (
                    <Text
                      as="span"
                      display="inline-block"
                      borderRadius="full"
                      px={2}
                      py="1px"
                      fontSize="xs"
                      bg={priorityColors[row.priority].bg}
                      color={priorityColors[row.priority].color}
                    >
                      {row.priority[0].toUpperCase() + row.priority.slice(1)}
                    </Text>
                  )}
                </Table.Cell>
              </Table.Row>
            );
          })}
          {!rows.length && (
            <Table.Row>
              <Table.Cell colSpan={6}>No scenarios match these filters.</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};
