// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Grid, HStack, Input, Table, Text, VStack } from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

import { Dialog, DialogBody, DialogFooter, Pagination } from '@/components/ui';

import type { TestScenarioSummary } from '../types';

export interface ScenarioFolderOption {
  id: string;
  name: string;
  depth: number;
  scenarioCount?: number;
}

export interface TestSuiteAddScenariosDialogViewProps {
  suiteName: string;
  folderOptions: ScenarioFolderOption[];
  unfiledScenarioCount: number;
  totalScenarioCount: number;
  currentTotal: number;
  search: string;
  onSearchChange: (value: string) => void;
  folderId: string;
  onFolderChange: (value: string) => void;
  scenarios: TestScenarioSummary[];
  selectedIds: string[];
  existingIds: string[];
  emptyState: 'already-added' | 'no-results';
  onToggleScenario: (id: string) => void;
  onTogglePage: () => void;
  onClearFilters: () => void;
  allPageSelected: boolean;
  somePageSelected: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  isUpdating?: boolean;
  error?: string;
  isAdding: boolean;
  hasChanges: boolean;
  onAdd: () => void;
  onClose: () => void;
}

export const TestSuiteAddScenariosDialogView = ({
  suiteName,
  folderOptions,
  unfiledScenarioCount,
  totalScenarioCount,
  currentTotal,
  search,
  onSearchChange,
  folderId,
  onFolderChange,
  scenarios,
  selectedIds,
  existingIds,
  onToggleScenario,
  onTogglePage,
  allPageSelected,
  somePageSelected,
  page,
  totalPages,
  onPageChange,
  isLoading,
  isUpdating = false,
  error,
  isAdding,
  hasChanges,
  onAdd,
  onClose,
}: TestSuiteAddScenariosDialogViewProps) => (
  <Dialog
    title={`Manage scenarios in ${suiteName}`}
    onClose={onClose}
    size="xl"
    contentProps={{ maxW: '1100px', w: 'calc(100vw - 2rem)', maxH: '86vh', bg: 'bg.card' }}
    headerProps={{ borderBottomWidth: '1px', borderColor: 'border.main' }}
  >
    <DialogBody overflow="hidden" p={0}>
      <Grid templateColumns={{ base: '1fr', md: '210px minmax(0, 1fr)' }} templateRows={{ base: '140px minmax(0, 1fr)', md: 'minmax(440px, 1fr)' }} minH="440px" maxH="calc(86vh - 132px)">
        <VStack align="stretch" gap={1} p={2} borderEndWidth={{ base: 0, md: '1px' }} borderBottomWidth={{ base: '1px', md: 0 }} borderColor="border.main" overflowY="auto">
          <Button size="sm" variant={folderId === '' ? 'subtle' : 'ghost'} colorPalette={folderId === '' ? 'blue' : undefined} justifyContent="space-between" onClick={() => onFolderChange('')}>
            <Text>All scenarios</Text><Text color="text.muted" fontSize="xs">{totalScenarioCount}</Text>
          </Button>
          {folderOptions.map((folder) => (
            <Button key={folder.id} size="sm" variant={folderId === folder.id ? 'subtle' : 'ghost'} colorPalette={folderId === folder.id ? 'blue' : undefined} justifyContent="space-between" ps={`${12 + folder.depth * 12}px`} onClick={() => onFolderChange(folder.id)}>
              <Text textAlign="left" lineClamp={1}>{folder.name}</Text><Text color="text.muted" fontSize="xs">{folder.scenarioCount ?? 0}</Text>
            </Button>
          ))}
          <Button size="sm" variant={folderId === '__unfiled__' ? 'subtle' : 'ghost'} colorPalette={folderId === '__unfiled__' ? 'blue' : undefined} justifyContent="space-between" onClick={() => onFolderChange('__unfiled__')}>
            <Text>No folder</Text><Text color="text.muted" fontSize="xs">{unfiledScenarioCount}</Text>
          </Button>
        </VStack>

        <VStack align="stretch" gap={2} p={3} minW="0" overflow="hidden">
          <Box position="relative">
          <Box position="absolute" insetStart={3} top="50%" transform="translateY(-50%)" zIndex={1} color="text.muted" pointerEvents="none">
            <FiSearch aria-hidden="true" size={14} />
          </Box>
          <Input
            aria-label="Search available scenarios"
            placeholder="Search by title or key"
            value={search}
            bg="bg.card"
            ps={9}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            minW="0"
          />
          </Box>

        {error ? (
          <Text role="alert" color="fg.error">
            {error}
          </Text>
        ) : isLoading ? (
          <Text py={8} textAlign="center" color="text.secondary">
            Loading scenarios…
          </Text>
        ) : (
          <Box borderWidth="1px" borderColor="border.main" borderRadius="md" overflow="auto" flex="1" minH="0" aria-busy={isUpdating}>
            <Table.Root size="sm" minW="620px">
              <Table.Header>
                <Table.Row bg="bg.subtle" position="sticky" top="0" zIndex="1">
                  <Table.ColumnHeader px={3} colSpan={5}>
                    <HStack gap={2} align="center" css={{ '& input[type="checkbox"]:disabled:not(:checked):not(:indeterminate)': { appearance: 'none', width: '13px', height: '13px', background: 'white', border: '1px solid #cbd5e0', borderRadius: '2px' } }}>
                    <input
                      type="checkbox"
                      aria-label={`Select all ${currentTotal} shown`}
                      disabled={isUpdating || !scenarios.some((scenario) => !selectedIds.includes(scenario.id))}
                      checked={allPageSelected}
                      ref={(element) => {
                        if (element) element.indeterminate = somePageSelected;
                      }}
                      onChange={onTogglePage}
                    />
                    <Text as="span" fontSize="xs" fontWeight="medium">Select all {currentTotal} shown</Text>
                    {scenarios.length > 0 && <Text as="span" color="text.secondary" fontSize="xs">· {existingIds.length} already in suite</Text>}
                    </HStack>
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {scenarios.length === 0 && (
                  <Table.Row>
                    <Table.Cell colSpan={5} textAlign="center" py={12} color="text.secondary" borderBottomWidth="0">
                      No scenarios match the search in this folder
                    </Table.Cell>
                  </Table.Row>
                )}
                {scenarios.map((scenario) => (
                  <Table.Row key={scenario.id} bg={existingIds.includes(scenario.id) && !selectedIds.includes(scenario.id) ? 'orange.subtle' : selectedIds.includes(scenario.id) && !existingIds.includes(scenario.id) ? 'blue.subtle' : undefined} _hover={{ bg: 'bg.subtle' }}>
                    <Table.Cell px={3} colSpan={1}>
                      <input
                        type="checkbox"
                        aria-label={`Select ${scenario.title}`}
                        disabled={isUpdating}
                        checked={selectedIds.includes(scenario.id)}
                        onChange={() => onToggleScenario(scenario.id)}
                      />
                    </Table.Cell>
                    <Table.Cell px={3} color="text.secondary" textDecoration={!selectedIds.includes(scenario.id) && existingIds.includes(scenario.id) ? 'line-through' : undefined}>
                      {scenario.scenarioKey ?? '—'}
                    </Table.Cell>
                    <Table.Cell px={3} fontWeight="medium" textDecoration={!selectedIds.includes(scenario.id) && existingIds.includes(scenario.id) ? 'line-through' : undefined}>
                      {scenario.title}
                    </Table.Cell>
                    <Table.Cell px={3} color="text.secondary" textDecoration={!selectedIds.includes(scenario.id) && existingIds.includes(scenario.id) ? 'line-through' : undefined}>
                      {scenario.folderName ?? 'Unfiled'}
                    </Table.Cell>
                    <Table.Cell px={3} textAlign="right" textDecoration={!selectedIds.includes(scenario.id) && existingIds.includes(scenario.id) ? 'line-through' : undefined}>
                      {existingIds.includes(scenario.id) && selectedIds.includes(scenario.id) ? (
                        <Text display="inline-block" px={2} py={0.5} borderRadius="full" bg="bg.subtle" color="text.secondary" fontSize="xs">In suite</Text>
                      ) : null}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}

        {!error && !isLoading && totalPages > 1 && (
          <HStack justify="space-between" flexWrap="wrap">
            <Text color="text.secondary" fontSize="sm">
              Page {page} of {totalPages}
            </Text>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(nextPage) => { if (!isUpdating) onPageChange(nextPage); }} />
          </HStack>
        )}
        </VStack>
      </Grid>
    </DialogBody>
    <DialogFooter borderTopWidth="1px" borderColor="border.main" justifyContent="stretch">
      <HStack w="100%" justify="space-between" gap={3} flexWrap="wrap">
        <Text fontSize="sm" color="text.secondary" aria-live="polite">
          {selectedIds.filter((id) => !existingIds.includes(id)).length} to add at the end · {existingIds.filter((id) => !selectedIds.includes(id)).length} to remove
        </Text>
        <HStack>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            loading={isAdding}
            disabled={!hasChanges || isAdding}
            onClick={onAdd}
          >
            {hasChanges ? 'Save changes' : 'No changes yet'}
          </Button>
        </HStack>
      </HStack>
    </DialogFooter>
  </Dialog>
);
