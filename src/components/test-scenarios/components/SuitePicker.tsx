// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState } from 'react';
import { Box, Button, HStack, IconButton, Input, Popover, Portal, Text } from '@chakra-ui/react';
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
  onComplete: (report: ScenarioOperationReport, selection: string[]) => void | Promise<void>;
  onBusyChange?: (busy: boolean) => void;
  compact?: boolean;
}

const BulkSuitePicker = ({ projectId, selectedIds, disabled, onComplete, onBusyChange, compact }: SuitePickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uncertainName, setUncertainName] = useState('');
  const lock = useRef(false);
  const [retrySuite, setRetrySuite] = useState<{ id: string; name: string } | null>(null);
  const [refreshRequired, setRefreshRequired] = useState(false);
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
    await onComplete(report, ids);
    if (report.failedIds.length || report.unattemptedIds.length || report.uncertainIds.length) {
      setError(
        `${report.errorMessage ?? 'Could not add scenarios.'}${report.uncertainIds.length ? ' Close and reopen the picker to refresh memberships before trying again.' : ' Please try again.'}`,
      );
      setRefreshRequired(report.uncertainIds.length > 0);
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
            setRefreshRequired(false);
          }
        }
      }}
      positioning={{ placement: 'top' }}
      initialFocusEl={() => inputRef.current}
    >
      <Popover.Trigger asChild>
        {compact ? (
          <IconButton size="xs" variant="outline" borderStyle="dashed" borderRadius="full"
            aria-label="Add to suite" disabled={disabled || busy}><FiPlus /></IconButton>
        ) : (
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
        )}
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
                  maxLength={200}
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
                    const duplicateName = suites?.filter((candidate) => candidate.name.toLocaleLowerCase() === suite.name.toLocaleLowerCase()).length ?? 0;
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
                        disabled={busy || refreshRequired || already === selectedIds.length}
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
                              {duplicateName > 1 ? ` · suite ${suite.id.slice(0, 8)}` : ''}
                              {already ? ` · ${already} of ${selectedIds.length} already in suite` : ''}
                            </Text>
                          </Box>
                        </HStack>
                      </Button>
                    );
                  })}
                  {search.trim() &&
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
                        disabled={busy || refreshRequired}
                        onClick={() => void run()}
                      >
                        <FiPlus aria-hidden="true" /> {filtered.length ? 'Create another suite' : 'Create suite'} “{search.trim()}” and add {selectedIds.length}
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
                <Button size="sm" variant="ghost" disabled={busy || refreshRequired} onClick={() => void run(retrySuite)}>
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

interface DraftSuitePickerProps {
  mode: 'draft';
  suites: Array<{ id: string; name: string; members?: unknown[] }>;
  selectedIds: string[];
  selectedNewNames: string[];
  disabled?: boolean;
  onSelect: (suite: { id: string; name: string; isNew?: boolean }) => void;
}

const DraftSuitePicker = ({ suites, selectedIds, selectedNewNames, disabled, onSelect }: DraftSuitePickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const name = search.trim();
  const filtered = suites.filter((suite) => suite.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()));
  const exists = selectedNewNames.some(
    (item) => item.toLocaleLowerCase() === name.toLocaleLowerCase(),
  );
  const select = (suite: { id: string; name: string; isNew?: boolean }) => {
    onSelect(suite);
    setOpen(false);
  };
  return (
    <Popover.Root open={open} onOpenChange={({ open: next }) => { setOpen(next); if (next) setSearch(''); }}
      positioning={{ placement: 'bottom-start' }} initialFocusEl={() => inputRef.current}>
      <Popover.Trigger asChild>
        <IconButton type="button" variant="outline" size="xs" borderStyle="dashed" borderRadius="full"
          aria-label="Select suites" disabled={disabled}><FiPlus /></IconButton>
      </Popover.Trigger>
      <Portal><Popover.Positioner><Popover.Content w="300px" maxW="calc(100vw - 24px)" bg="bg.card" p={2}>
        <Popover.Body p={0}>
          <Input ref={inputRef} aria-label="Find or create a suite" placeholder="Find or create a suite"
            value={search} maxLength={200} size="sm" disabled={disabled} onChange={(event) => setSearch(event.currentTarget.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }} />
          <Box maxH="250px" overflowY="auto" mt={1}>
            {filtered.map((suite) => (
              <Button type="button" key={suite.id} variant="ghost" w="full" h="auto" minH="44px"
                justifyContent="flex-start" px={2} py={1}
                disabled={disabled || selectedIds.includes(suite.id)}
                onClick={() => select({ id: suite.id, name: suite.name })}>
                <HStack gap={3}><FiList aria-hidden="true" /><Box textAlign="left">
                  <Text fontSize="sm">{suite.name}</Text>
                  <Text fontSize="xs" color="text.secondary">
                    {suite.members?.length ?? 0} scenarios
                    {suites.filter((candidate) => candidate.name.toLocaleLowerCase() === suite.name.toLocaleLowerCase()).length > 1
                      ? ` · suite ${suite.id.slice(0, 8)}`
                      : ''}
                  </Text>
                </Box></HStack>
              </Button>
            ))}
            {name && !exists && <Button type="button" variant="ghost" color="blue.500" w="full" disabled={disabled}
              justifyContent="flex-start" onClick={() => select({ id: `suite-draft-${crypto.randomUUID()}`, name, isNew: true })}>
              <FiPlus /> Create suite “{name}”
            </Button>}
            {!name && !suites.length && <Text fontSize="sm" color="text.secondary" p={2}>No suites yet. Enter a name to create one.</Text>}
          </Box>
        </Popover.Body>
      </Popover.Content></Popover.Positioner></Portal>
    </Popover.Root>
  );
};

export const SuitePicker = (props: SuitePickerProps | DraftSuitePickerProps) =>
  'mode' in props ? <DraftSuitePicker {...props} /> : <BulkSuitePicker {...props} />;
