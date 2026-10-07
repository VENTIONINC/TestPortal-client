// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, HStack, Input, Table, Text, VStack } from '@chakra-ui/react';

import { Dialog, DialogBody, DialogFooter, NativeSelect, Pagination } from '@/components/ui';

import type { TestScenarioSummary } from '../types';

export interface ScenarioFolderOption {
  id: string;
  name: string;
  depth: number;
}

export interface TestSuiteAddScenariosDialogViewProps {
  suiteName: string;
  folderOptions: ScenarioFolderOption[];
  search: string;
  onSearchChange: (value: string) => void;
  folderId: string;
  onFolderChange: (value: string) => void;
  scenarios: TestScenarioSummary[];
  selectedIds: string[];
  onToggleScenario: (id: string) => void;
  onTogglePage: () => void;
  allPageSelected: boolean;
  somePageSelected: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  error?: string;
  isAdding: boolean;
  onAdd: () => void;
  onClose: () => void;
}

export const TestSuiteAddScenariosDialogView = ({
  suiteName,
  folderOptions,
  search,
  onSearchChange,
  folderId,
  onFolderChange,
  scenarios,
  selectedIds,
  onToggleScenario,
  onTogglePage,
  allPageSelected,
  somePageSelected,
  page,
  totalPages,
  onPageChange,
  isLoading,
  error,
  isAdding,
  onAdd,
  onClose,
}: TestSuiteAddScenariosDialogViewProps) => (
  <Dialog
    title={`Add scenarios to ${suiteName}`}
    onClose={onClose}
    size="xl"
    contentProps={{ maxW: '900px', w: 'calc(100vw - 2rem)' }}
  >
    <DialogBody>
      <VStack align="stretch" gap={4}>
        <Text color="text.secondary">Choose project scenarios to include in this suite.</Text>
        <HStack align="end" gap={3} flexWrap="wrap">
          <Input
            aria-label="Search available scenarios"
            placeholder="Search title or scenario key"
            value={search}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            flex="1"
            minW="220px"
          />
          <NativeSelect
            label="Folder"
            aria-label="Filter scenarios by folder"
            value={folderId}
            onChange={(event) => onFolderChange(event.currentTarget.value)}
            w="240px"
          >
            <option value="">All folders</option>
            <option value="__unfiled__">Unfiled</option>
            {folderOptions.map((folder) => (
              <option key={folder.id} value={folder.id}>{`${'　'.repeat(folder.depth)}${folder.name}`}</option>
            ))}
          </NativeSelect>
        </HStack>

        {selectedIds.length > 0 && (
          <HStack justify="space-between" px={3} py={2} bg="bg.subtle" borderRadius="md">
            <Text fontWeight="semibold">{selectedIds.length} selected{selectedIds.length === 100 ? ' · Limit reached: 100 per action' : ''}</Text>
            <Button size="xs" variant="ghost" onClick={() => selectedIds.forEach(onToggleScenario)}>Clear selection</Button>
          </HStack>
        )}

        {error ? (
          <Text role="alert" color="fg.error">{error}</Text>
        ) : isLoading ? (
          <Text py={8} textAlign="center" color="text.secondary">Loading scenarios…</Text>
        ) : scenarios.length === 0 ? (
          <Text py={8} textAlign="center" color="text.secondary">No available scenarios match these filters.</Text>
        ) : (
          <Box borderWidth="1px" borderColor="border.main" borderRadius="md" overflowX="auto">
            <Table.Root size="sm" minW="560px">
              <Table.Header>
                <Table.Row bg="bg.subtle">
                  <Table.ColumnHeader w="48px" px={3}>
                    <input
                      type="checkbox"
                      aria-label="Select all scenarios on this page"
                      checked={allPageSelected}
                      ref={(element) => { if (element) element.indeterminate = somePageSelected; }}
                      onChange={onTogglePage}
                    />
                  </Table.ColumnHeader>
                  <Table.ColumnHeader px={3}>Scenario key</Table.ColumnHeader>
                  <Table.ColumnHeader px={3}>Title</Table.ColumnHeader>
                  <Table.ColumnHeader px={3}>Folder</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {scenarios.map((scenario) => (
                  <Table.Row key={scenario.id} _hover={{ bg: 'bg.subtle' }}>
                    <Table.Cell px={3}>
                      <input
                        type="checkbox"
                        aria-label={`Select ${scenario.title}`}
                        checked={selectedIds.includes(scenario.id)}
                        onChange={() => onToggleScenario(scenario.id)}
                      />
                    </Table.Cell>
                    <Table.Cell px={3} color="text.secondary">{scenario.scenarioKey ?? '—'}</Table.Cell>
                    <Table.Cell px={3} fontWeight="medium">{scenario.title}</Table.Cell>
                    <Table.Cell px={3} color="text.secondary">{scenario.folderName ?? 'Unfiled'}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}

        {!error && !isLoading && totalPages > 1 && (
          <HStack justify="space-between" flexWrap="wrap">
            <Text color="text.secondary" fontSize="sm">Page {page} of {totalPages}</Text>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
          </HStack>
        )}
      </VStack>
    </DialogBody>
    <DialogFooter>
      <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
      <Button type="button" variant="primary" loading={isAdding} disabled={selectedIds.length === 0 || isAdding} onClick={onAdd}>
        Add {selectedIds.length} scenario{selectedIds.length === 1 ? '' : 's'}
      </Button>
    </DialogFooter>
  </Dialog>
);
