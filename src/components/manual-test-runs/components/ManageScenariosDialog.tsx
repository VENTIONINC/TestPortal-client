// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from 'react';
import { Box, Button, Grid, HStack, Input, Popover, Table, Text, VStack } from '@chakra-ui/react';
import { FiChevronDown, FiSearch } from 'react-icons/fi';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import {
  useGetApiV2TestScenariosQuery,
  useLazyGetApiV2TestScenariosQuery,
  useGetApiV2TestScenarioFoldersQuery,
  useGetApiV2TestSuitesQuery,
} from '@/redux/apis/generatedApi';
import type { ManualTestRunScenarioResult, TestScenarioSummary } from '@/redux/apis/generatedApi';

interface FolderNode {
  id: string;
  name: string;
  scenarioCount?: number;
  children?: FolderNode[];
}
const flattenFolders = (folders: FolderNode[], depth = 0): Array<FolderNode & { depth: number }> =>
  folders.flatMap((folder) => [{ ...folder, depth }, ...flattenFolders(folder.children ?? [], depth + 1)]);

interface Props {
  projectId: string;
  runTitle: string;
  existing: { sourceScenarioId: string; result: ManualTestRunScenarioResult }[];
  saving: boolean;
  onSave: (ids: string[]) => void;
  onClose: () => void;
  warning?: boolean;
  onSelectionChange?: () => void;
  initialIds?: string[];
  pickerMode?: boolean;
}

export const ManageScenariosDialog = ({
  projectId,
  runTitle,
  existing,
  saving,
  onSave,
  onClose,
  warning,
  onSelectionChange,
  initialIds,
  pickerMode = false,
}: Props) => {
  const [ids, setIds] = useState(() => initialIds ?? existing.map((item) => item.sourceScenarioId));
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [suiteIds, setSuiteIds] = useState<string[]>([]);
  const [suiteOpen, setSuiteOpen] = useState(false);
  const [suiteSearch, setSuiteSearch] = useState('');
  const [filteredRows, setFilteredRows] = useState<TestScenarioSummary[]>([]);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState(false);
  const [loadScenarios] = useLazyGetApiV2TestScenariosQuery();
  const [page, setPage] = useState(1);
  const scenarios = useGetApiV2TestScenariosQuery({
    projectId,
    page: suiteIds.length ? 1 : page,
    limit: 100,
    search: search || undefined,
    folderId: folder || undefined,
    includeDescendants: folder && folder !== 'unfiled' ? true : undefined,
  });
  const totalScenarios = useGetApiV2TestScenariosQuery({ projectId, page: 1, limit: 1 });
  const folders = useGetApiV2TestScenarioFoldersQuery({ projectId });
  const suites = useGetApiV2TestSuitesQuery({ projectId });
  useEffect(() => {
    if (!suiteIds.length || !scenarios.currentData || !suites.currentData) return;
    let active = true;
    const load = async () => {
      setFilterLoading(true);
      setFilterError(false);
      try {
        const first = scenarios.currentData!;
        const remaining = await Promise.all(
          Array.from({ length: first.totalPages - 1 }, (_, index) =>
            loadScenarios(
              {
                projectId,
                page: index + 2,
                limit: 100,
                search: search || undefined,
                folderId: folder || undefined,
                includeDescendants: folder && folder !== 'unfiled' ? true : undefined,
              },
              true,
            ).unwrap(),
          ),
        );
        const memberIds = new Set(
          suites
            .currentData!.filter((suite) => suiteIds.includes(suite.id))
            .flatMap((suite) => (suite.members ?? []).map((member) => member.testScenarioId)),
        );
        if (active)
          setFilteredRows(
            [first, ...remaining].flatMap((result) => result.scenarios).filter((row) => memberIds.has(row.id)),
          );
      } catch {
        if (active) setFilterError(true);
      } finally {
        if (active) setFilterLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [suiteIds, scenarios.currentData, suites.currentData, loadScenarios, projectId, search, folder]);
  const rows = suiteIds.length
    ? filteredRows.slice((page - 1) * 100, page * 100)
    : (scenarios.currentData?.scenarios ?? []);
  const totalPages = suiteIds.length
    ? Math.max(1, Math.ceil(filteredRows.length / 100))
    : (scenarios.currentData?.totalPages ?? 1);
  const original = existing.map((item) => item.sourceScenarioId);
  const added = ids.filter((id) => !original.includes(id)).length;
  const removed = original.filter((id) => !ids.includes(id)).length;
  const removedResults = existing.filter((item) => !ids.includes(item.sourceScenarioId) && item.result !== 'untested');
  const resultBreakdown = (['passed', 'failed', 'blocked', 'skipped'] as const)
    .map((result) => ({ result, count: removedResults.filter((item) => item.result === result).length }))
    .filter((item) => item.count > 0)
    .map((item) => `${item.count} ${item.result}`)
    .join(', ');
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
  const allSelected = rows.length > 0 && rows.every((row) => ids.includes(row.id));
  const toggle = (id: string) => {
    onSelectionChange?.();
    setIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };
  return (
    <Dialog
      title={pickerMode ? 'Select scenarios' : `Manage scenarios in ${runTitle}`}
      onClose={onClose}
      size="xl"
      contentProps={{
        maxW: '1100px',
        w: 'calc(100vw - 2rem)',
        h: 'min(700px, 86dvh)',
        maxH: '86vh',
        bg: 'bg.card',
        borderRadius: '16px',
      }}
      headerProps={{ borderBottomWidth: '1px', borderColor: 'border.main' }}
    >
      <DialogBody p={0} overflow="hidden" minH={0}>
        <Grid
          templateColumns={{ base: '1fr', md: '210px minmax(0, 1fr)' }}
          templateRows={{ base: '140px minmax(0, 1fr)', md: 'minmax(0, 1fr)' }}
          h="full"
          minH={0}
          maxH="calc(86vh - 132px)"
        >
          <VStack align="stretch" gap={1} p={2} borderEndWidth="1px" borderColor="border.main" overflowY="auto">
            <Button
              size="sm"
              variant={folder === '' ? 'subtle' : 'ghost'}
              colorPalette={folder === '' ? 'blue' : undefined}
              justifyContent="space-between"
              onClick={() => {
                setFolder('');
                setPage(1);
              }}
            >
              <Text>All scenarios</Text>
              <Text fontSize="xs">{totalScenarios.currentData?.total ?? 0}</Text>
            </Button>
            {flattenFolders(folders.currentData ?? []).map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={folder === item.id ? 'subtle' : 'ghost'}
                colorPalette={folder === item.id ? 'blue' : undefined}
                justifyContent="space-between"
                ps={`${12 + item.depth * 12}px`}
                onClick={() => {
                  setFolder(item.id);
                  setPage(1);
                }}
              >
                <Text lineClamp={1}>{item.name}</Text>
                <Text fontSize="xs">{item.scenarioCount ?? 0}</Text>
              </Button>
            ))}
            <Button
              size="sm"
              variant={folder === 'unfiled' ? 'subtle' : 'ghost'}
              colorPalette={folder === 'unfiled' ? 'blue' : undefined}
              justifyContent="start"
              onClick={() => {
                setFolder('unfiled');
                setPage(1);
              }}
            >
              No folder
            </Button>
          </VStack>
          <VStack align="stretch" gap={2} p={3} minW={0} overflow="hidden">
            <HStack>
              <Box position="relative" flex="1" minW={0}>
                <Box
                  position="absolute"
                  left={3}
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex={1}
                  color="text.muted"
                  pointerEvents="none"
                >
                  <FiSearch aria-hidden="true" size={14} />
                </Box>
                <Input
                  aria-label="Search available scenarios"
                  placeholder="Search by title or key"
                  pl={9}
                  h="40px"
                  bg="bg.card"
                  borderColor={search.trim() ? 'border.active' : undefined}
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
              </Box>
              <Popover.Root
                open={suiteOpen}
                onOpenChange={({ open }) => {
                  setSuiteOpen(open);
                  if (!open) setSuiteSearch('');
                }}
                positioning={{ placement: 'bottom-end' }}
              >
                <Popover.Trigger asChild>
                  <Button
                    variant="outline"
                    bg="bg.card"
                    h="40px"
                    maxW="250px"
                    borderColor={suiteIds.length ? 'border.active' : undefined}
                  >
                    <Text as="span" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      Suite{suiteIds.length ? `: ${suiteIds.length === 1 ? suites.currentData?.find((suite) => suite.id === suiteIds[0])?.name ?? '1' : suiteIds.length}` : ''}
                    </Text>
                    <FiChevronDown aria-hidden="true" />
                  </Button>
                </Popover.Trigger>
                <Popover.Positioner>
                  <Popover.Content w="260px" bg="bg.card" p={0}>
                    <Box position="relative" px={3} borderBottomWidth="1px" borderColor="border.main">
                      <Box
                        position="absolute"
                        insetStart={3}
                        top="50%"
                        transform="translateY(-50%)"
                        zIndex={1}
                        color="text.muted"
                        pointerEvents="none"
                      >
                        <FiSearch aria-hidden="true" size={13} />
                      </Box>
                      <Input
                        aria-label="Search suites"
                        placeholder="Type to find a suite"
                        size="sm"
                        value={suiteSearch}
                        onChange={(event) => setSuiteSearch(event.target.value)}
                        ps={7}
                        border={0}
                        focusRing="none"
                      />
                    </Box>
                    <Popover.Body p={1} maxH="240px" overflowY="auto">
                      <VStack align="stretch" gap={0}>
                        {suites.isLoading && (
                          <Text px={2} py={2} color="text.secondary" fontSize="sm">
                            Loading suites…
                          </Text>
                        )}
                        {suites.error && (
                          <Text px={2} py={2} color="text.secondary" fontSize="sm">
                            Suites are unavailable.
                          </Text>
                        )}
                        {(suites.currentData ?? [])
                          .filter((item) =>
                            item.name.toLocaleLowerCase().includes(suiteSearch.trim().toLocaleLowerCase()),
                          )
                          .map((item) => (
                            <HStack as="label" key={item.id} px={2} py={1.5} cursor="pointer" justify="space-between">
                              <HStack gap={2} minW={0}>
                                <input
                                  type="checkbox"
                                  aria-label={item.name}
                                  checked={suiteIds.includes(item.id)}
                                  onChange={() => {
                                    setSuiteIds((current) =>
                                      current.includes(item.id)
                                        ? current.filter((id) => id !== item.id)
                                        : [...current, item.id],
                                    );
                                    setPage(1);
                                  }}
                                />
                                <Text
                                  as="span"
                                  fontSize="sm"
                                  overflow="hidden"
                                  textOverflow="ellipsis"
                                  whiteSpace="nowrap"
                                >
                                  {item.name}
                                </Text>
                              </HStack>
                              <Text flexShrink={0} fontSize="xs" color="text.secondary">
                                {item.members?.length ?? '–'}
                              </Text>
                            </HStack>
                          ))}
                        {!suites.isLoading &&
                          !suites.error &&
                          !(suites.currentData ?? []).some((item) =>
                            item.name.toLocaleLowerCase().includes(suiteSearch.trim().toLocaleLowerCase()),
                          ) && (
                            <Text px={2} py={2} color="text.secondary" fontSize="sm">
                              No suites found
                            </Text>
                          )}
                      </VStack>
                    </Popover.Body>
                    <HStack justify="space-between" p={2} borderTopWidth="1px" borderColor="border.main">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSuiteIds([]);
                          setPage(1);
                          setSuiteOpen(false);
                          setSuiteSearch('');
                        }}
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setSuiteOpen(false);
                          setSuiteSearch('');
                        }}
                      >
                        Done
                      </Button>
                    </HStack>
                  </Popover.Content>
                </Popover.Positioner>
              </Popover.Root>
            </HStack>
            {scenarios.error || (suiteIds.length > 0 && filterError) ? (
              <Text role="alert">Could not load scenarios.</Text>
            ) : scenarios.isLoading || (suiteIds.length > 0 && (filterLoading || scenarios.isFetching)) ? (
              <Text>Loading scenarios…</Text>
            ) : (
              <Box
                borderWidth="1px"
                borderColor="border.main"
                borderRadius="md"
                overflow="auto"
                flex="1"
                minH={0}
                aria-busy={scenarios.isFetching}
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
                            ref={(el) => {
                              if (el) el.indeterminate = !allSelected && rows.some((row) => ids.includes(row.id));
                            }}
                            onChange={() => {
                              onSelectionChange?.();
                              setIds((current) =>
                                allSelected
                                  ? current.filter((id) => !rows.some((row) => row.id === id))
                                  : [...new Set([...current, ...rows.map((row) => row.id)])],
                              );
                            }}
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
                              onChange={() => toggle(row.id)}
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
            )}
            {totalPages > 1 && (
              <HStack>
                <Button size="xs" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Text>
                  Page {page} of {totalPages}
                </Text>
                <Button size="xs" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </HStack>
            )}
          </VStack>
        </Grid>
      </DialogBody>
      <DialogFooter borderTopWidth="1px" borderColor="border.main">
        <VStack w="100%" align="stretch">
          {warning && (
            <Text role="alert" color="fg.error">
              Removing these scenarios will also remove {removedResults.length} saved results ({resultBreakdown}). Save
              these changes?
            </Text>
          )}
          <HStack justify="space-between">
            <Text fontSize="sm" color="fg.muted" aria-live="polite">
              {pickerMode ? `${ids.length} selected` : `${added} to add as Untested · ${removed} to remove`}
            </Text>
            <HStack>
              <Button variant="ghost" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button
                colorPalette="blue"
                onClick={() => onSave(ids)}
                disabled={saving || (!pickerMode && (ids.length === 0 || (!added && !removed)))}
              >
                {pickerMode ? 'Done' : warning ? 'Remove results and save' : 'Save changes'}
              </Button>
            </HStack>
          </HStack>
        </VStack>
      </DialogFooter>
    </Dialog>
  );
};
