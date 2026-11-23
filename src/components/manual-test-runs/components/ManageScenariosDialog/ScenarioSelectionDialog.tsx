// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Grid, HStack, Input, Text, VStack } from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

import { Dialog, DialogBody, DialogFooter } from '@/components/ui';

import { ScenarioFolderList } from './ScenarioFolderList';
import { ScenarioSelectionTable } from './ScenarioSelectionTable';
import type { ExistingRunScenario } from './ScenarioSelectionTable';
import { ScenarioSuiteFilter } from './ScenarioSuiteFilter';
import { useManageScenarioFilters } from './hooks/useManageScenarioFilters';
import { useManageScenarioSelection } from './hooks/useManageScenarioSelection';

interface ScenarioSelectionDialogProps {
  projectId: string;
  title: string;
  existing: ExistingRunScenario[];
  saving?: boolean;
  saveBlocked?: boolean;
  error?: string;
  onSave: (ids: string[]) => void;
  onClose: () => void;
  removedResults?: ExistingRunScenario[];
  onSelectionChange?: () => void;
  initialIds?: string[];
  pickerMode?: boolean;
  finalFocusEl?: () => HTMLElement | null;
}

export const ScenarioSelectionDialog = ({
  projectId,
  title,
  existing,
  saving,
  saveBlocked,
  error,
  onSave,
  onClose,
  removedResults = [],
  onSelectionChange,
  initialIds,
  pickerMode = false,
  finalFocusEl,
}: ScenarioSelectionDialogProps) => {
  const {
    rows,
    folder,
    folders,
    total,
    search,
    suiteIds,
    suites,
    suitesLoading,
    suitesHaveError,
    page,
    totalPages,
    isFetching,
    hasError,
    isLoading,
    changeFolder,
    changeSearch,
    toggleSuite,
    clearSuites,
    setPage,
  } = useManageScenarioFilters(projectId);

  const { ids, added, removed, toggleScenario, togglePage } = useManageScenarioSelection({
    existing,
    initialIds,
    onSelectionChange,
  });
  const hasWarning = removedResults.length > 0;
  const resultBreakdown = (['passed', 'failed', 'blocked', 'skipped'] as const)
    .map((result) => ({ result, count: removedResults.filter((item) => item.result === result).length }))
    .filter((item) => item.count > 0)
    .map((item) => `${item.count} ${item.result}`)
    .join(', ');

  const handleClose = () => {
    if (!saving) onClose();
  };

  return (
    <Dialog
      title={title}
      onClose={handleClose}
      closeOnEscape={!saving}
      closeOnInteractOutside={!saving}
      closeTriggerProps={{ disabled: saving }}
      finalFocusEl={finalFocusEl}
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
          <ScenarioFolderList folders={folders} folder={folder} total={total} onFolderChange={changeFolder} />

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
                  onChange={(event) => changeSearch(event.target.value)}
                />
              </Box>

              <ScenarioSuiteFilter
                suites={suites}
                suiteIds={suiteIds}
                loading={suitesLoading}
                hasError={suitesHaveError}
                onToggleSuite={toggleSuite}
                onClear={clearSuites}
              />
            </HStack>

            {hasError ? (
              <Text role="alert">Could not load scenarios.</Text>
            ) : isLoading ? (
              <Text>Loading scenarios…</Text>
            ) : (
              <ScenarioSelectionTable
                rows={rows}
                ids={ids}
                existing={existing}
                fetching={isFetching}
                disabled={saving}
                onToggleScenario={toggleScenario}
                onTogglePage={(allSelected) => togglePage(rows, allSelected)}
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
          {hasWarning && (
            <Text role="alert" color="fg.error">
              Removing these scenarios will also remove {removedResults.length} saved results ({resultBreakdown}). Save
              these changes?
            </Text>
          )}
          {error && (
            <Text role="alert" color="fg.error">
              {error}
            </Text>
          )}

          <HStack justify="space-between">
            <Text fontSize="sm" color="fg.muted" aria-live="polite">
              {pickerMode ? `${ids.length} selected` : `${added} to add as Untested · ${removed} to remove`}
            </Text>
            <HStack>
              <Button variant="ghost" onClick={handleClose} disabled={saving}>
                Cancel
              </Button>
              <Button
                colorPalette="blue"
                onClick={() => onSave(ids)}
                loading={saving}
                disabled={saving || saveBlocked || (!pickerMode && (ids.length === 0 || (!added && !removed)))}
              >
                {pickerMode ? 'Done' : hasWarning ? 'Remove results and save' : 'Save changes'}
              </Button>
            </HStack>
          </HStack>
        </VStack>
      </DialogFooter>
    </Dialog>
  );
};
