// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo, useState, type FormEvent, type MouseEvent } from 'react';
import { Box, Button, Heading, HStack, Input, Link as ChakraLink, Table, Text, Textarea, VStack } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router';

import { Alert, ContextMenuButton, Dialog, DialogBody, DialogFooter, Pagination, Skeleton, Wrap } from '@/components/ui';

import { getTestScenarioDetailPath } from '../constants';
import type { TestScenarioPagination, TestScenarioSummary } from '../types';

export interface CatalogFolder {
  id: string;
  name: string;
  parentId: string | null;
  position?: number;
  scenarioCount: number;
  children?: unknown[];
}

export interface CatalogSuite {
  id: string;
  name: string;
  description: string | null;
  purpose: string | null;
  release: string | null;
  members?: Array<{ testScenarioId: string }>;
}

export interface TestScenarioCatalogViewProps {
  scenarios: TestScenarioSummary[];
  pagination: TestScenarioPagination;
  isLoading: boolean;
  error?: unknown;
  onPageChange: (page: number) => void;
  onCreateScenario?: () => void;
  onContextMenu?: (event: MouseEvent<HTMLButtonElement>, scenario: TestScenarioSummary) => void;
  search: string;
  onSearchChange: (value: string) => void;
  sort: 'recently_created' | 'recently_updated' | 'title_asc';
  onSortChange: (value: 'recently_created' | 'recently_updated' | 'title_asc') => void;
  scope: { kind: 'all' | 'unfiled' | 'folder' | 'suite'; id?: string };
  onScopeChange: (scope: { kind: 'all' | 'unfiled' | 'folder' | 'suite'; id?: string }) => void;
  folders: CatalogFolder[];
  suites: CatalogSuite[];
  organizationLoading: boolean;
  organizationError?: unknown;
  selectedIds: string[];
  toggleSelected: (id: string) => void;
  onMoveSelected: (folderId: string | null) => Promise<void>;
  onAddSelectedToSuite: (suiteId: string) => Promise<void>;
  onRemoveSelectedFromSuite: () => Promise<void>;
  onReorderSuite: (suiteId: string, scenarioIds: string[]) => Promise<void>;
  onCreateFolder: (name: string, parentId: string | null) => Promise<unknown>;
  onUpdateFolder: (folderId: string, body: { name?: string; parentId?: string | null; position?: number }) => Promise<unknown>;
  onDeleteFolder: (folderId: string, disposition: 'parent' | 'unfiled') => Promise<void>;
  onCreateSuite: (body: { name: string; description?: string | null; purpose?: string | null; release?: string | null }) => Promise<unknown>;
  onUpdateSuite: (suiteId: string, body: { name?: string; description?: string | null; purpose?: string | null; release?: string | null }) => Promise<unknown>;
  onDeleteSuite: (suiteId: string) => Promise<void>;
  includeDescendants: boolean;
  onIncludeDescendantsChange: (value: boolean) => void;
}

const formatScenarioDate = (timestamp: string) => new Date(timestamp).toLocaleString('en-US');

const TABLE_CELL_PADDING = { px: 4, py: 4 } as const;

const flattenFolders = (folders: CatalogFolder[]): Array<CatalogFolder & { depth: number }> => {
  const flattened: Array<CatalogFolder & { depth: number }> = [];
  const visit = (folder: CatalogFolder, depth: number) => {
    flattened.push({ ...folder, depth });
    for (const child of folder.children ?? []) {
      if (typeof child === 'object' && child !== null && 'id' in child && 'name' in child) visit(child as CatalogFolder, depth + 1);
    }
  };
  folders.forEach((folder) => visit(folder, 0));
  return flattened;
};

const LoadingState = () => (
  <VStack align="stretch" gap={4} aria-label="Loading Test Scenarios">
    <Text color="text.secondary">Loading Test Scenarios...</Text>
    <Box overflowX="auto">
      <Table.Root size="sm" variant="outline" minW="1040px">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader {...TABLE_CELL_PADDING}>Scenario key</Table.ColumnHeader>
            <Table.ColumnHeader {...TABLE_CELL_PADDING}>Title</Table.ColumnHeader>
            <Table.ColumnHeader {...TABLE_CELL_PADDING}>Details</Table.ColumnHeader>
            <Table.ColumnHeader {...TABLE_CELL_PADDING}>Created by</Table.ColumnHeader>
            <Table.ColumnHeader {...TABLE_CELL_PADDING}>Created</Table.ColumnHeader>
            <Table.ColumnHeader {...TABLE_CELL_PADDING}>Updated</Table.ColumnHeader>
            <Table.ColumnHeader {...TABLE_CELL_PADDING} />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {[1, 2, 3].map((index) => (
            <Table.Row key={index}>
              <Table.Cell {...TABLE_CELL_PADDING}>
                <Skeleton h="5" loading={true} />
              </Table.Cell>
              <Table.Cell {...TABLE_CELL_PADDING}>
                <Skeleton h="5" loading={true} />
              </Table.Cell>
              <Table.Cell {...TABLE_CELL_PADDING}>
                <Skeleton h="5" loading={true} />
              </Table.Cell>
              <Table.Cell {...TABLE_CELL_PADDING}>
                <Skeleton h="5" loading={true} />
              </Table.Cell>
              <Table.Cell {...TABLE_CELL_PADDING}>
                <Skeleton h="5" loading={true} />
              </Table.Cell>
              <Table.Cell {...TABLE_CELL_PADDING}>
                <Skeleton h="5" loading={true} />
              </Table.Cell>
              <Table.Cell {...TABLE_CELL_PADDING}>
                <Skeleton h="5" loading={true} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  </VStack>
);

const ErrorState = () => (
  <Alert.Root status="error" role="alert">
    <Alert.Indicator />
    <Alert.Content>
      <Alert.Title>Failed to load Test Scenarios</Alert.Title>
      <Alert.Description>Please try again in a moment.</Alert.Description>
    </Alert.Content>
  </Alert.Root>
);

const EmptyState = () => (
  <VStack py={8}>
    <Text color="text.muted">No Test Scenarios are available for this project.</Text>
  </VStack>
);

const ScenarioTable = ({
  scenarios,
  selectedIds,
  onToggleSelected,
  onContextMenu,
}: {
  scenarios: TestScenarioSummary[];
  selectedIds: string[];
  onToggleSelected: (id: string) => void;
  onContextMenu?: TestScenarioCatalogViewProps['onContextMenu'];
}) => (
  <Box overflowX="auto">
    <Table.Root size="sm" variant="outline" minW="1040px">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader {...TABLE_CELL_PADDING}>Select</Table.ColumnHeader>
          <Table.ColumnHeader {...TABLE_CELL_PADDING}>Scenario key</Table.ColumnHeader>
          <Table.ColumnHeader {...TABLE_CELL_PADDING}>Title</Table.ColumnHeader>
          <Table.ColumnHeader {...TABLE_CELL_PADDING}>Details</Table.ColumnHeader>
          <Table.ColumnHeader {...TABLE_CELL_PADDING}>Created by</Table.ColumnHeader>
          <Table.ColumnHeader {...TABLE_CELL_PADDING}>Created</Table.ColumnHeader>
          <Table.ColumnHeader {...TABLE_CELL_PADDING}>Updated</Table.ColumnHeader>
          <Table.ColumnHeader {...TABLE_CELL_PADDING} />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {scenarios.map((scenario) => (
          <Table.Row key={scenario.id} data-testid={`test-scenario-${scenario.id}`}>
            <Table.Cell {...TABLE_CELL_PADDING}><input type="checkbox" aria-label={`Select ${scenario.title}`} checked={selectedIds.includes(scenario.id)} onChange={() => onToggleSelected(scenario.id)} /></Table.Cell>
            <Table.Cell {...TABLE_CELL_PADDING} maxW="180px" whiteSpace="pre-wrap" overflowWrap="anywhere">
              {scenario.scenarioKey ?? 'N/A'}
            </Table.Cell>
            <Table.Cell {...TABLE_CELL_PADDING}>
              <ChakraLink asChild fontWeight="medium" color="text.main">
                <RouterLink to={getTestScenarioDetailPath(scenario.id)}>{scenario.title}</RouterLink>
              </ChakraLink>
            </Table.Cell>
            <Table.Cell {...TABLE_CELL_PADDING} maxW="320px" whiteSpace="pre-wrap" overflowWrap="anywhere">
              {scenario.details ?? 'No details'}
            </Table.Cell>
            <Table.Cell {...TABLE_CELL_PADDING}>
              <VStack align="start" gap={0}>
                <Text>{scenario.createdBy.name}</Text>
                <Text color="text.secondary" fontSize="sm" overflowWrap="anywhere">
                  {scenario.createdBy.email}
                </Text>
              </VStack>
            </Table.Cell>
            <Table.Cell {...TABLE_CELL_PADDING} color="text.secondary">
              {formatScenarioDate(scenario.createdAt)}
            </Table.Cell>
            <Table.Cell {...TABLE_CELL_PADDING} color="text.secondary">
              {formatScenarioDate(scenario.updatedAt)}
            </Table.Cell>
            <Table.Cell {...TABLE_CELL_PADDING} textAlign="end" w="1%">
              <ContextMenuButton
                aria-label={`Actions for ${scenario.title}`}
                onClick={(event) => onContextMenu?.(event, scenario)}
              />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  </Box>
);

const PaginationSummary = ({ pagination }: { pagination: TestScenarioPagination }) => {
  const firstItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const lastItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <HStack justify="flex-end" align="center" gap={4} flexWrap="wrap" w="100%">
      <Text color="text.secondary" fontSize="sm" textAlign="right">
        Showing {firstItem}-{lastItem} of {pagination.total} Test Scenarios
      </Text>
    </HStack>
  );
};

export const TestScenarioCatalogView = memo(function TestScenarioCatalogView({
  scenarios,
  pagination,
  isLoading,
  error,
  onPageChange,
  onCreateScenario,
  onContextMenu,
  search,
  onSearchChange,
  sort,
  onSortChange,
  scope,
  onScopeChange,
  folders,
  suites,
  organizationLoading,
  organizationError,
  selectedIds,
  toggleSelected,
  onMoveSelected,
  onAddSelectedToSuite,
  onRemoveSelectedFromSuite,
  onReorderSuite,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onCreateSuite,
  onUpdateSuite,
  onDeleteSuite,
  includeDescendants,
  onIncludeDescendantsChange,
}: TestScenarioCatalogViewProps) {
  const [createDialog, setCreateDialog] = useState<'folder' | 'suite' | 'rename-folder' | 'edit-suite' | null>(null);
  const [createName, setCreateName] = useState('');
  const [createPurpose, setCreatePurpose] = useState('');
  const [createRelease, setCreateRelease] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const folderRows = flattenFolders(folders);
  const selectedFolder = scope.kind === 'folder' ? folderRows.find((folder) => folder.id === scope.id) : undefined;
  const selectedSuite = scope.kind === 'suite' ? suites.find((suite) => suite.id === scope.id) : undefined;
  const breadcrumbs = selectedFolder ? [...folderRows.filter((folder) => {
    let current: (typeof folderRows)[number] | undefined = selectedFolder;
    while (current) {
      if (current.id === folder.id) return true;
      current = folderRows.find((candidate) => candidate.id === current?.parentId);
    }
    return false;
  })].sort((a, b) => a.depth - b.depth) : [];
  const openCreateDialog = (kind: 'folder' | 'suite') => {
    setCreateName('');
    setCreatePurpose('');
    setCreateRelease('');
    setCreateDescription('');
    setCreateError(null);
    setCreateDialog(kind);
  };
  const openEditFolderDialog = () => {
    if (!selectedFolder) return;
    setCreateName(selectedFolder.name);
    setCreatePurpose('');
    setCreateRelease('');
    setCreateDescription('');
    setCreateError(null);
    setCreateDialog('rename-folder');
  };
  const openEditSuiteDialog = () => {
    if (!selectedSuite) return;
    setCreateName(selectedSuite.name);
    setCreatePurpose(selectedSuite.purpose ?? '');
    setCreateRelease(selectedSuite.release ?? '');
    setCreateDescription(selectedSuite.description ?? '');
    setCreateError(null);
    setCreateDialog('edit-suite');
  };
  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!createDialog || !createName.trim() || isCreating) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      if (createDialog === 'folder') {
        await onCreateFolder(createName.trim(), selectedFolder?.id ?? null);
      } else if (createDialog === 'suite') {
        await onCreateSuite({
          name: createName.trim(),
          purpose: createPurpose.trim() || undefined,
          release: createRelease.trim() || undefined,
          description: createDescription.trim() || undefined,
        });
      } else if (createDialog === 'rename-folder' && selectedFolder) {
        await onUpdateFolder(selectedFolder.id, { name: createName.trim() });
      } else if (createDialog === 'edit-suite' && selectedSuite) {
        await onUpdateSuite(selectedSuite.id, {
          name: createName.trim(),
          purpose: createPurpose.trim() || null,
          release: createRelease.trim() || null,
          description: createDescription.trim() || null,
        });
      }
      setCreateDialog(null);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsCreating(false);
    }
  };
  return (
    <Wrap my={4} mx={6} p={4}>
      <VStack align="stretch" gap={4} w="100%">
        <HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
          <VStack align="start" gap={2}>
            <Heading fontSize="lg">Test Scenarios</Heading>
          </VStack>
          <Button aria-label="Create Test Scenario" variant="primary" onClick={onCreateScenario}>
            <FiPlus />
            Create Test Scenario
          </Button>
        </HStack>

        <HStack align="start" gap={6} flexWrap="wrap">
          <VStack align="stretch" minW="220px" gap={2} aria-label="Scenario organization">
            <Button variant={scope.kind === 'all' ? 'subtle' : 'ghost'} onClick={() => onScopeChange({ kind: 'all' })}>All scenarios</Button>
            <Button variant={scope.kind === 'unfiled' ? 'subtle' : 'ghost'} onClick={() => onScopeChange({ kind: 'unfiled' })}>Unfiled</Button>
            <Text fontWeight="semibold">Folders</Text>
            <Button size="sm" variant="outline" onClick={() => openCreateDialog('folder')}>New folder{selectedFolder ? ' inside selected folder' : ''}</Button>
            {selectedFolder && <HStack flexWrap="wrap">
              <Button size="xs" onClick={openEditFolderDialog}>Rename</Button>
              <Button size="xs" onClick={() => {
                const parentId = window.prompt('Move under folder UUID, or leave blank for the root', selectedFolder.parentId ?? '');
                if (parentId !== null) void onUpdateFolder(selectedFolder.id, { parentId: parentId.trim() || null }).catch((error: unknown) => window.alert(String(error)));
              }}>Move</Button>
              <Button size="xs" disabled={!selectedFolder.position} aria-label="Move folder up" onClick={() => void onUpdateFolder(selectedFolder.id, { position: Math.max(0, (selectedFolder.position ?? 0) - 1) }).catch((error: unknown) => window.alert(String(error)))}>↑</Button>
              <Button size="xs" aria-label="Move folder down" onClick={() => void onUpdateFolder(selectedFolder.id, { position: (selectedFolder.position ?? 0) + 1 }).catch((error: unknown) => window.alert(String(error)))}>↓</Button>
              <Button size="xs" onClick={() => {
                const disposition = window.prompt('Move direct scenarios to parent or unfiled? Enter parent or unfiled. Child folders will be promoted.', 'parent');
                if (disposition === 'parent' || disposition === 'unfiled') {
                  if (window.confirm(`Delete ${selectedFolder.name}? Child folders will be promoted.`)) void onDeleteFolder(selectedFolder.id, disposition).catch((error: unknown) => window.alert(String(error)));
                }
              }}>Delete</Button>
            </HStack>}
            {organizationLoading ? <Text>Loading folders…</Text> : organizationError ? <Text role="alert">Folders could not be loaded.</Text> : folderRows.map((folder) => (
              <Button key={folder.id} variant={scope.id === folder.id ? 'subtle' : 'ghost'} justifyContent="flex-start" pl={3 + folder.depth * 4}
                aria-current={scope.id === folder.id ? 'page' : undefined} onClick={() => onScopeChange({ kind: 'folder', id: folder.id })}>
                {folder.name} ({folder.scenarioCount})
              </Button>
            ))}
            <Text fontWeight="semibold" mt={2}>Suites</Text>
            <Button size="sm" variant="outline" onClick={() => openCreateDialog('suite')}>New suite</Button>
            {selectedSuite && <HStack flexWrap="wrap">
              <Text fontSize="sm">Current selection{selectedSuite.release ? ` · ${selectedSuite.release}` : ''}</Text>
              <Button size="xs" onClick={openEditSuiteDialog}>Edit</Button>
              <Button size="xs" onClick={() => {
                if (window.confirm(`Delete suite ${selectedSuite.name}? Scenarios will remain unchanged.`)) void onDeleteSuite(selectedSuite.id).catch((error: unknown) => window.alert(String(error)));
              }}>Delete</Button>
            </HStack>}
            {selectedSuite?.members?.map((member, index, members) => (
              <HStack key={member.testScenarioId} gap={1}>
                <Text fontSize="xs" flex="1">{index + 1}. {scenarios.find((scenario) => scenario.id === member.testScenarioId)?.title ?? member.testScenarioId}</Text>
                <Button size="xs" aria-label={`Move member ${index + 1} up`} disabled={index === 0} onClick={() => {
                  const ids = members.map((item) => item.testScenarioId);
                  [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
                  void onReorderSuite(selectedSuite.id, ids).catch((error: unknown) => window.alert(String(error)));
                }}>↑</Button>
                <Button size="xs" aria-label={`Move member ${index + 1} down`} disabled={index === members.length - 1} onClick={() => {
                  const ids = members.map((item) => item.testScenarioId);
                  [ids[index + 1], ids[index]] = [ids[index], ids[index + 1]];
                  void onReorderSuite(selectedSuite.id, ids).catch((error: unknown) => window.alert(String(error)));
                }}>↓</Button>
              </HStack>
            ))}
            {organizationLoading ? <Text>Loading suites…</Text> : organizationError ? <Text role="alert">Suites could not be loaded.</Text> : suites.length === 0 ? <Text>No suites yet.</Text> : suites.map((suite) => (
              <Button key={suite.id} variant={scope.id === suite.id ? 'subtle' : 'ghost'} justifyContent="flex-start"
                aria-current={scope.id === suite.id ? 'page' : undefined} onClick={() => onScopeChange({ kind: 'suite', id: suite.id })}>
                {suite.name} ({suite.members?.length ?? 0}){suite.release ? ` · ${suite.release}` : ''}
              </Button>
            ))}
          </VStack>
          <VStack align="stretch" gap={3} flex="1" minW="0">
            {selectedFolder && <HStack aria-label="Folder breadcrumbs">
              <Button size="xs" variant="ghost" onClick={() => onScopeChange({ kind: 'all' })}>All scenarios</Button>
              {breadcrumbs.map((folder) => <Button key={folder.id} size="xs" variant="ghost" aria-current={folder.id === selectedFolder.id ? 'page' : undefined}
                onClick={() => onScopeChange({ kind: 'folder', id: folder.id })}>{folder.name}</Button>)}
            </HStack>}
            {scope.kind === 'folder' && <label><input type="checkbox" checked={includeDescendants} onChange={(event) => onIncludeDescendantsChange(event.currentTarget.checked)} /> Include subfolders</label>}
            <HStack flexWrap="wrap">
              <Input aria-label="Search scenarios" placeholder="Search title or scenario key" value={search} onChange={(event) => onSearchChange(event.currentTarget.value)} />
              <label>Sort scenarios <select aria-label="Sort scenarios" value={sort} onChange={(event) => onSortChange(event.currentTarget.value as typeof sort)}>
                <option value="recently_created">Recently created</option>
                <option value="recently_updated">Recently updated</option>
                <option value="title_asc">Title A–Z</option>
              </select></label>
            </HStack>
            {selectedIds.length > 0 && <HStack flexWrap="wrap">
              <Text>{selectedIds.length}/100 selected</Text>
              <select aria-label="Move selected scenarios to folder" id="bulk-folder-target">
                <option value="">Unfiled</option>
                {folderRows.map((folder) => <option key={folder.id} value={folder.id}>{'　'.repeat(folder.depth)}{folder.name}</option>)}
              </select>
              <Button onClick={() => {
                const target = document.querySelector<HTMLSelectElement>('#bulk-folder-target')?.value || null;
                if (window.confirm(`Move ${selectedIds.length} scenarios?`)) void onMoveSelected(target);
              }}>Move selected</Button>
              <select aria-label="Add selected scenarios to suite" id="bulk-suite-target">
                {suites.map((suite) => <option key={suite.id} value={suite.id}>{suite.name}</option>)}
              </select>
              <Button disabled={suites.length === 0} onClick={() => {
                const target = document.querySelector<HTMLSelectElement>('#bulk-suite-target')?.value;
                if (target && window.confirm(`Add ${selectedIds.length} scenarios to this suite?`)) void onAddSelectedToSuite(target);
              }}>Add to suite</Button>
              {scope.kind === 'suite' && <Button onClick={() => {
                if (window.confirm(`Remove ${selectedIds.length} scenarios from this suite?`)) void onRemoveSelectedFromSuite().catch((error: unknown) => window.alert(String(error)));
              }}>Remove from suite</Button>}
              {selectedIds.length >= 100 && <Text role="status">Operations are limited to 100 scenarios.</Text>}
            </HStack>}
          </VStack>
        </HStack>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState />
        ) : scenarios.length === 0 ? (
          <EmptyState />
        ) : (
          <VStack align="stretch" gap={4}>
            <ScenarioTable scenarios={scenarios} selectedIds={selectedIds} onToggleSelected={toggleSelected} onContextMenu={onContextMenu} />
            {pagination.totalPages > 1 && (
              <Box as="nav" aria-label="Test Scenario pagination">
                <HStack justify="center" py={2}>
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={onPageChange}
                  />
                </HStack>
              </Box>
            )}
            <PaginationSummary pagination={pagination} />
          </VStack>
        )}
      </VStack>
      {createDialog && <Dialog title={
        createDialog === 'folder' ? 'Create folder' : createDialog === 'suite' ? 'Create suite' :
          createDialog === 'rename-folder' ? 'Rename folder' : 'Edit suite'
      } onClose={() => setCreateDialog(null)}>
        <form onSubmit={(event) => void submitCreate(event)}>
          <DialogBody>
            <VStack align="stretch" gap={4}>
              <label>
                <Text mb={1}>Name</Text>
                <Input autoFocus required maxLength={120} value={createName} onChange={(event) => setCreateName(event.currentTarget.value)} />
              </label>
              {(createDialog === 'suite' || createDialog === 'edit-suite') && <>
                <label><Text mb={1}>Purpose (optional)</Text><Input value={createPurpose} onChange={(event) => setCreatePurpose(event.currentTarget.value)} /></label>
                <label><Text mb={1}>Release (optional)</Text><Input value={createRelease} onChange={(event) => setCreateRelease(event.currentTarget.value)} /></label>
                <label><Text mb={1}>Description (optional)</Text><Textarea value={createDescription} onChange={(event) => setCreateDescription(event.currentTarget.value)} /></label>
              </>}
              {createError && <Text role="alert" color="red.500">{createError}</Text>}
            </VStack>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setCreateDialog(null)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={!createName.trim() || isCreating} loading={isCreating}>
              {createDialog === 'folder' || createDialog === 'suite' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>}
    </Wrap>
  );
});
