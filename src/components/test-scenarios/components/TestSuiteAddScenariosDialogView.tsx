// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Grid, Heading, HStack, Input, Table, Text, VStack } from '@chakra-ui/react';
import { FiCheckCircle, FiSearch } from 'react-icons/fi';

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
  emptyState: 'already-added' | 'no-results';
  onToggleScenario: (id: string) => void;
  onTogglePage: () => void;
  onClearSelection: () => void;
  onClearFilters: () => void;
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
  emptyState,
  onToggleScenario,
  onTogglePage,
  onClearSelection,
  onClearFilters,
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
    contentProps={{ maxW: '820px', w: 'calc(100vw - 2rem)', maxH: '86vh' }}
  >
    <DialogBody overflowY="auto">
      <VStack align="stretch" gap={4}>
        <Text color="text.secondary">Choose project scenarios to include in this suite.</Text>
        <Grid templateColumns={{ base: '1fr', md: 'minmax(0, 1fr) 240px' }} alignItems="end" gap={3}>
          <Input
            aria-label="Search available scenarios"
            placeholder="Search title or scenario key"
            value={search}
            bg="bg.input"
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            minW="0"
          />
          <NativeSelect
            label="Folder"
            aria-label="Filter scenarios by folder"
            value={folderId}
            onChange={(event) => onFolderChange(event.currentTarget.value)}
            w="100%"
          >
            <option value="">All folders</option>
            <option value="__unfiled__">Unfiled</option>
            {folderOptions.map((folder) => (
              <option key={folder.id} value={folder.id}>{`${'　'.repeat(folder.depth)}${folder.name}`}</option>
            ))}
          </NativeSelect>
        </Grid>

        {error ? (
          <Text role="alert" color="fg.error">{error}</Text>
        ) : isLoading ? (
          <Text py={8} textAlign="center" color="text.secondary">Loading scenarios…</Text>
        ) : scenarios.length === 0 ? (
          <VStack gap={2} py={9} px={4} borderWidth="1px" borderStyle="dashed" borderColor="border.main" borderRadius="lg" textAlign="center">
            <Box p={3} borderRadius="full" bg="bg.subtle" color="text.secondary">
              {emptyState === 'already-added' ? <FiCheckCircle size={22} /> : <FiSearch size={22} />}
            </Box>
            <Heading size="sm">{emptyState === 'already-added' ? 'Already in this suite' : 'No scenarios found'}</Heading>
            <Text maxW="460px" color="text.secondary" fontSize="sm">
              {emptyState === 'already-added'
                ? 'Every scenario on this page is already included. Try another folder or clear the filters to find more.'
                : 'Try a different search or folder. You can also clear the filters to browse all project scenarios.'}
            </Text>
            {(search || folderId) && <Button size="sm" variant="outline" onClick={onClearFilters}>Clear filters</Button>}
          </VStack>
        ) : (
          <Box borderWidth="1px" borderColor="border.main" borderRadius="md" overflow="auto" maxH="360px">
            <Table.Root size="sm" minW="560px">
              <Table.Header>
                <Table.Row bg="bg.subtle" position="sticky" top="0" zIndex="1">
                  <Table.ColumnHeader w="48px" px={3}>
                    <input
                      type="checkbox"
                      aria-label="Select all scenarios on this page"
                      checked={allPageSelected}
                      ref={(element) => { if (element) element.indeterminate = somePageSelected; }}
                      onChange={onTogglePage}
                    />
                  </Table.ColumnHeader>
                  <Table.ColumnHeader px={3} bg="bg.subtle">Scenario key</Table.ColumnHeader>
                  <Table.ColumnHeader px={3} bg="bg.subtle">Title</Table.ColumnHeader>
                  <Table.ColumnHeader px={3} bg="bg.subtle">Folder</Table.ColumnHeader>
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
    <DialogFooter borderTopWidth="1px" borderColor="border.main" justifyContent="stretch">
      <HStack w="100%" justify="space-between" gap={3} flexWrap="wrap">
        <HStack gap={3}>
          <Text fontSize="sm" color="text.secondary" aria-live="polite">
            {selectedIds.length} selected{selectedIds.length === 100 ? ' · Limit 100 per action' : ''}
          </Text>
          {selectedIds.length > 0 && <Button size="xs" variant="ghost" onClick={onClearSelection}>Clear selection</Button>}
        </HStack>
        <HStack>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="primary" loading={isAdding} disabled={selectedIds.length === 0 || isAdding} onClick={onAdd}>
            Add {selectedIds.length} scenario{selectedIds.length === 1 ? '' : 's'}
          </Button>
        </HStack>
      </HStack>
    </DialogFooter>
  </Dialog>
);
