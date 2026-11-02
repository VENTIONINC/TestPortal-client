// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState } from 'react';
import { Box, Button, HStack, Input, Popover, Portal, Text } from '@chakra-ui/react';
import { FiLayers, FiList, FiPlus, FiSearch } from 'react-icons/fi';

import {
  useGetApiV2TestSuitesQuery,
  usePostApiV2TestSuitesMutation,
  usePostApiV2TestSuitesBySuiteIdMembersMutation,
} from '@/redux/apis/extendedApi';

import { executeScenarioOperation, type ScenarioOperationReport } from '../utils';

interface SuitePickerProps {
  projectId: string;
  selectedIds: string[];
  disabled?: boolean;
  onComplete: (report: ScenarioOperationReport, selection: string[]) => void;
  onBusyChange?: (busy: boolean) => void;
}

export const SuitePicker = ({ projectId, selectedIds, disabled, onComplete, onBusyChange }: SuitePickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uncertainName, setUncertainName] = useState('');
  const lock = useRef(false);
  const [retrySuite, setRetrySuite] = useState<{ id: string; name: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    data: suites,
    isLoading,
    isFetching,
    isError,
  } = useGetApiV2TestSuitesQuery({ projectId }, { skip: !open, refetchOnMountOrArgChange: true });
  const [createSuite] = usePostApiV2TestSuitesMutation();
  const [addMembers] = usePostApiV2TestSuitesBySuiteIdMembersMutation();
  const filtered = (suites ?? []).filter((suite) =>
    suite.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );

  const add = async (suiteId: string, ids: string[]) => {
    const report = await executeScenarioOperation(ids, (scenarioIds) =>
      addMembers({ suiteId, body: { projectId, scenarioIds } }).unwrap(),
    );
    onComplete(report, ids);
    if (report.failedIds.length || report.unattemptedIds.length || report.uncertainIds.length) {
      setError(
        `${report.errorMessage ?? 'Could not add scenarios.'}${report.uncertainIds.length ? ' Check unknown outcomes before retrying.' : ' Please try again.'}`,
      );
    } else {
      setRetrySuite(null);
      setOpen(false);
    }
  };
  const run = async (suite?: { id: string; name: string }) => {
    if (lock.current || !selectedIds.length) return;
    lock.current = true;
    setBusy(true);
    onBusyChange?.(true);
    setError('');
    const ids = [...selectedIds];
    try {
      let target = suite;
      if (!target) {
        const name = search.trim();
        if (!name) return;
        const created = await createSuite({ body: { projectId, name } }).unwrap();
        target = { id: created.id, name };
        setRetrySuite(target);
      }
      await add(target.id, ids);
    } catch (cause) {
      const status = cause && typeof cause === 'object' && 'status' in cause ? Number(cause.status) : NaN;
      if (status >= 400 && status < 500) setError('Could not create the suite. Please try again.');
      else {
        setUncertainName(search.trim().toLocaleLowerCase());
        setError('The creation outcome is unknown. Close and reopen the picker to refresh suites before trying again.');
      }
    } finally {
      lock.current = false;
      setBusy(false);
      onBusyChange?.(false);
    }
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={({ open: next }) => {
        if (!busy) {
          setOpen(next);
          if (next) {
            setSearch('');
            setError('');
            setRetrySuite(null);
            setUncertainName('');
          }
        }
      }}
      positioning={{ placement: 'top' }}
      initialFocusEl={() => inputRef.current}
    >
      <Popover.Trigger asChild>
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled || busy}
          color="inherit"
          _hover={{ bg: 'whiteAlpha.200', _dark: { bg: 'blackAlpha.200' } }}
          _expanded={{ bg: 'whiteAlpha.200', _dark: { bg: 'blackAlpha.200' } }}
        >
          <FiLayers aria-hidden="true" /> Add to suite
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            w="300px"
            maxW="calc(100vw - 24px)"
            bg="bg.card"
            color="text.primary"
            p={2}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && !busy) setOpen(false);
            }}
          >
            <Popover.Body p={0}>
              <Text fontSize="xs" color="text.secondary" px={1} pb={2}>
                Add {selectedIds.length} selected to a suite
              </Text>
              <Box position="relative">
                <Box
                  position="absolute"
                  left="10px"
                  top="50%"
                  transform="translateY(-50%)"
                  color="text.secondary"
                  pointerEvents="none"
                >
                  <FiSearch aria-hidden="true" />
                </Box>
                <Input
                  ref={inputRef}
                  aria-label="Find or create a suite"
                  placeholder="Find or create a suite"
                  value={search}
                  onChange={(event) => setSearch(event.currentTarget.value)}
                  disabled={busy}
                  size="sm"
                  pl="32px"
                />
              </Box>
              {isLoading && (
                <Text fontSize="sm" p={2}>
                  Loading suites…
                </Text>
              )}
              {isError && (
                <Text role="alert" fontSize="sm" color="fg.error" p={2}>
                  Suites could not be loaded.
                </Text>
              )}
              {!isLoading && !isError && suites && (
                <Box maxH="250px" overflowY="auto" mt={1}>
                  {filtered.map((suite) => {
                    const members = suite.members ?? [];
                    const already = members.filter((member) => selectedIds.includes(member.testScenarioId)).length;
                    return (
                      <Button
                        key={suite.id}
                        variant="ghost"
                        w="full"
                        h="auto"
                        minH="44px"
                        justifyContent="flex-start"
                        px={2}
                        py={1}
                        disabled={busy}
                        onClick={() => void run({ id: suite.id, name: suite.name })}
                      >
                        <HStack align="center" gap={3} w="full">
                          <FiList aria-hidden="true" />
                          <Box textAlign="left" minW={0}>
                            <Text fontSize="sm" fontWeight="medium" whiteSpace="normal">
                              {suite.name}
                            </Text>
                            <Text fontSize="xs" fontWeight="normal" color="text.secondary">
                              {members.length} scenario{members.length === 1 ? '' : 's'}
                              {already ? ` · ${already} of ${selectedIds.length} already in suite` : ''}
                            </Text>
                          </Box>
                        </HStack>
                      </Button>
                    );
                  })}
                  {!filtered.length &&
                    search.trim() &&
                    !isFetching &&
                    search.trim().toLocaleLowerCase() !== uncertainName &&
                    (!retrySuite || retrySuite.name.toLocaleLowerCase() !== search.trim().toLocaleLowerCase()) && (
                      <Button
                        variant="ghost"
                        color="blue.500"
                        w="full"
                        justifyContent="flex-start"
                        h="auto"
                        py={2}
                        whiteSpace="normal"
                        disabled={busy}
                        onClick={() => void run()}
                      >
                        <FiPlus aria-hidden="true" /> Create suite “{search.trim()}” and add {selectedIds.length}
                      </Button>
                    )}
                  {!filtered.length && !search.trim() && (
                    <Text fontSize="sm" color="text.secondary" p={2}>
                      No suites yet. Enter a name to create one.
                    </Text>
                  )}
                </Box>
              )}
              {error && (
                <Text role="alert" color="fg.error" fontSize="sm" p={2}>
                  {error}
                </Text>
              )}
              {retrySuite && error && (
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => void run(retrySuite)}>
                  Retry adding to {retrySuite.name}
                </Button>
              )}
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};
