// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from 'react';
import { Box, Button, Grid, HStack, Input, Text, VStack } from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';
import {
  useGetApiV2TestScenariosQuery,
  useLazyGetApiV2TestScenariosQuery,
  useGetApiV2TestScenarioFoldersQuery,
  useGetApiV2TestSuitesQuery,
} from '@/redux/apis/generatedApi';
import type { TestScenarioSummary } from '@/redux/apis/generatedApi';

import { ScenarioFolderList } from './ScenarioFolderList';
import { ScenarioSelectionTable } from './ScenarioSelectionTable';
import type { ExistingRunScenario } from './ScenarioSelectionTable';
import { ScenarioSuiteFilter } from './ScenarioSuiteFilter';

interface ManageScenariosDialogProps {
  projectId: string;
  runTitle: string;
  existing: ExistingRunScenario[];
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
}: ManageScenariosDialogProps) => {
  const [ids, setIds] = useState(() => initialIds ?? existing.map((item) => item.sourceScenarioId));
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [suiteIds, setSuiteIds] = useState<string[]>([]);
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
          <ScenarioFolderList
            folders={folders.currentData ?? []}
            folder={folder}
            total={totalScenarios.currentData?.total ?? 0}
            onFolderChange={(id) => {
              setFolder(id);
              setPage(1);
            }}
          />
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
              <ScenarioSuiteFilter
                suites={suites.currentData ?? []}
                suiteIds={suiteIds}
                loading={suites.isLoading}
                hasError={Boolean(suites.error)}
                onToggleSuite={(id) => {
                  setSuiteIds((current) =>
                    current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
                  );
                  setPage(1);
                }}
                onClear={() => {
                  setSuiteIds([]);
                  setPage(1);
                }}
              />
            </HStack>
            {scenarios.error || (suiteIds.length > 0 && filterError) ? (
              <Text role="alert">Could not load scenarios.</Text>
            ) : scenarios.isLoading || (suiteIds.length > 0 && (filterLoading || scenarios.isFetching)) ? (
              <Text>Loading scenarios…</Text>
            ) : (
              <ScenarioSelectionTable
                rows={rows}
                ids={ids}
                existing={existing}
                fetching={scenarios.isFetching}
                onToggleScenario={toggle}
                onTogglePage={(allSelected) => {
                  onSelectionChange?.();
                  setIds((current) =>
                    allSelected
                      ? current.filter((id) => !rows.some((row) => row.id === id))
                      : [...new Set([...current, ...rows.map((row) => row.id)])],
                  );
                }}
              />
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
