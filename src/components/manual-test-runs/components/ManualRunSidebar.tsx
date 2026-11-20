// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Badge, Box, Button, Flex, HStack, IconButton, Input, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router';
import { FiCheck, FiSearch, FiSliders, FiX } from 'react-icons/fi';

import { PATHS } from '@/types/paths';
import { orange_300 } from '@/theme/colors/palette';

import { MANUAL_RUN_PERIOD, MANUAL_RUN_SHOW, MANUAL_RUN_STATUS } from '../constants';
import { periods, type useManualRunList } from './useManualRunList';
import { useRunFiltersPopover } from './useRunFiltersPopover';

const completedDayLabel = (day: string) => {
  if (day === 'Completed') return day;
  const date = new Date(`${day}T12:00:00`);
  if (Number.isNaN(date.getTime())) return day;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

interface ManualRunSidebarProps {
  runList: ReturnType<typeof useManualRunList>;
  selectedRunId?: string;
  onSelectRun: (runId: string) => void;
}

export const ManualRunSidebar = ({ runList, selectedRunId, onSelectRun }: ManualRunSidebarProps) => {
  const {
    listQuery,
    allRunsQuery,
    scenarioCountQuery,
    noRunsYet,
    listedRuns,
    noRunsInProgress,
    runSearch,
    setRunSearch,
    show,
    setShow,
    period,
    setPeriod,
    setDateFrom,
    setDateTo,
    dateFrom,
    dateTo,
    activeRunFilterCount,
    runPage,
    setRunPage,
    completedGroups,
    activeRuns,
    completedCount,
    inProgressCount,
  } = runList;
  const navigate = useNavigate();
  const { filtersOpen, setFiltersOpen, filtersRef } = useRunFiltersPopover();
  const renderRun = (item: (typeof listedRuns)[number]) => {
    const markedCount = item.scenarioCount - item.untestedCount;
    if (item.status === MANUAL_RUN_STATUS.COMPLETED) {
      const resultLabel =
        item.failedCount > 0
          ? 'Failed'
          : item.blockedCount > 0 || item.skippedCount > 0
            ? 'Blocked or skipped'
            : 'Passed';
      const resultColor =
        resultLabel === 'Failed' ? 'red.500' : resultLabel === 'Blocked or skipped' ? orange_300 : 'green.500';
      return (
        <Button
          key={item.id}
          variant="ghost"
          bg={selectedRunId === item.id ? 'blue.50' : undefined}
          h="auto"
          minH="0"
          w="full"
          px={2}
          py={2}
          justifyContent="flex-start"
          textAlign="left"
          onClick={() => onSelectRun(item.id)}
        >
          <HStack align="start" w="full" gap={2}>
            <Box
              boxSize="7px"
              borderRadius="full"
              bg={resultColor}
              flexShrink={0}
              mt="7px"
              role="img"
              aria-label={resultLabel}
            />
            <VStack align="stretch" gap={0} minW={0} flex="1">
              <Text fontSize="sm" fontWeight="medium" truncate title={item.title}>
                {item.title}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {item.passedCount}/{item.scenarioCount} passed
              </Text>
            </VStack>
          </HStack>
        </Button>
      );
    }
    return (
      <Button
        key={item.id}
        variant={selectedRunId === item.id ? 'subtle' : 'ghost'}
        colorPalette={selectedRunId === item.id ? 'blue' : undefined}
        bg={selectedRunId === item.id ? 'blue.50' : undefined}
        textAlign="left"
        justifyContent="flex-start"
        h="auto"
        minH="60px"
        px={2}
        py={2}
        whiteSpace="normal"
        onClick={() => onSelectRun(item.id)}
      >
        <VStack align="stretch" gap={1} w="100%">
          <Text fontSize="sm" fontWeight="medium" lineClamp={1} title={item.title}>
            {item.title}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            {new Date(item.completedAt ?? item.startedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}{' '}
            · {markedCount}/{item.scenarioCount} marked
          </Text>
          <Flex
            h="1.5"
            borderRadius="full"
            overflow="hidden"
            bg="bg.subtle"
            aria-label={`${markedCount} of ${item.scenarioCount} marked`}
          >
            {item.passedCount > 0 && <Box flex={item.passedCount} bg="green.500" />}
            {item.failedCount > 0 && <Box flex={item.failedCount} bg="red.500" />}
            {item.blockedCount > 0 && <Box flex={item.blockedCount} bg={orange_300} />}
            {item.skippedCount > 0 && <Box flex={item.skippedCount} bg="gray.500" />}
            {item.untestedCount > 0 && <Box flex={item.untestedCount} bg="gray.200" />}
          </Flex>
        </VStack>
      </Button>
    );
  };
  const handleSelectShow = (value: Parameters<typeof setShow>[0]) => {
    setShow(value);
    setFiltersOpen(false);
  };

  const handleSelectPeriod = (value: Parameters<typeof setPeriod>[0]) => {
    setPeriod(value);
    if (value !== MANUAL_RUN_PERIOD.CUSTOM) setFiltersOpen(false);
  };

  return (
    <VStack
      align="stretch"
      gap={2}
      bg="bg.panel"
      borderRightWidth={{ base: 0, lg: '1px' }}
      borderBottomWidth={{ base: '1px', lg: 0 }}
      borderColor="border"
      borderLeftRadius="lg"
      p={3}
      w={{ base: '100%', lg: '240px' }}
      flexShrink={0}
    >
      <HStack justify="space-between">
        <Text fontSize="xs" color="fg.muted">
          RUNS
        </Text>
        {((scenarioCountQuery.currentData?.total ?? 1) > 0 || Boolean(allRunsQuery.currentData?.total)) && (
          <Text
            fontSize="20px"
            color="fg.muted"
            aria-label="New manual run"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(PATHS.MANUAL_TEST_RUN_NEW)}
          >
            +
          </Text>
        )}
      </HStack>
      {!noRunsYet && (
        <HStack ref={filtersRef} gap={1} position="relative">
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
              pl={9}
              pe={runSearch ? 9 : 3}
              size="sm"
              h="36px"
              bg="bg.card"
              borderColor={runSearch.trim() ? 'border.active' : undefined}
              aria-label="Search runs"
              placeholder="Search runs"
              value={runSearch}
              onChange={(e) => setRunSearch(e.target.value)}
            />
            {runSearch && (
              <IconButton
                position="absolute"
                insetEnd={1}
                top="50%"
                transform="translateY(-50%)"
                size="xs"
                variant="ghost"
                aria-label="Clear run search"
                onClick={() => setRunSearch('')}
              >
                <FiX />
              </IconButton>
            )}
          </Box>
          <Button
            size="sm"
            h="36px"
            w="36px"
            minW="36px"
            variant="outline"
            p={0}
            position="relative"
            bg={activeRunFilterCount ? 'blue.50' : undefined}
            color={activeRunFilterCount ? 'blue.fg' : undefined}
            borderColor={filtersOpen || activeRunFilterCount ? 'blue.500' : undefined}
            aria-label={activeRunFilterCount ? `Filters, ${activeRunFilterCount} active` : 'Filters'}
            title="Filters"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="manual-run-filters"
          >
            <FiSliders />
            {activeRunFilterCount > 0 && (
              <Badge
                position="absolute"
                top="-6px"
                right="-6px"
                borderRadius="full"
                bg="blue.500"
                color="white"
                minW="18px"
                h="18px"
                p={0}
                display="grid"
                placeItems="center"
                fontSize="xs"
                aria-hidden="true"
              >
                {activeRunFilterCount}
              </Badge>
            )}
          </Button>
          {filtersOpen && (
            <Box
              id="manual-run-filters"
              position="absolute"
              top="calc(100% + 4px)"
              left={0}
              zIndex="popover"
              w="252px"
              maxW="min(252px, calc(100vw - 32px))"
              bg="bg.panel"
              borderWidth="1px"
              borderColor="border"
              borderRadius="lg"
              boxShadow="lg"
              py={1}
            >
              <Box role="radiogroup" aria-label="Show runs" px={1} pb={1}>
                <Text fontSize="xs" color="fg.muted" px={2} py={1}>
                  Show
                </Text>
                {(
                  [
                    [MANUAL_RUN_STATUS.IN_PROGRESS, 'In progress'],
                    [MANUAL_RUN_STATUS.COMPLETED, 'Completed'],
                    [MANUAL_RUN_SHOW.ALL, 'All runs'],
                  ] as const
                ).map(([value, label]) => (
                  <Button
                    key={value}
                    role="radio"
                    aria-checked={show === value}
                    variant="ghost"
                    size="sm"
                    w="100%"
                    justifyContent="space-between"
                    fontWeight="normal"
                    bg={show === value ? 'blue.50' : undefined}
                    onClick={() => handleSelectShow(value)}
                  >
                    {label}
                    {show === value && (
                      <Box color="blue.500">
                        <FiCheck />
                      </Box>
                    )}
                  </Button>
                ))}
              </Box>
              <Box role="radiogroup" aria-label="Run period" borderTopWidth="1px" borderColor="border" px={1} pt={1}>
                <Text fontSize="xs" color="fg.muted" px={2} py={1}>
                  Period
                </Text>
                {periods.map(([value, label]) => (
                  <Button
                    key={value}
                    role="radio"
                    aria-label={label}
                    aria-checked={period === value}
                    variant="ghost"
                    size="sm"
                    w="100%"
                    h="auto"
                    minH="8"
                    py={1}
                    justifyContent="space-between"
                    textAlign="left"
                    whiteSpace="normal"
                    fontWeight="normal"
                    bg={period === value ? 'blue.50' : undefined}
                    onClick={() => handleSelectPeriod(value)}
                  >
                    <Box>
                      <Text>{label}</Text>
                      {value === MANUAL_RUN_PERIOD.RECENT && (
                        <Text fontSize="xs" color="fg.muted" fontWeight="normal">
                          All runs in progress, and runs completed in the last 7 days
                        </Text>
                      )}
                    </Box>
                    {period === value && (
                      <Box color="blue.500" flexShrink={0}>
                        <FiCheck />
                      </Box>
                    )}
                  </Button>
                ))}
                {period === MANUAL_RUN_PERIOD.CUSTOM && (
                  <VStack align="stretch" gap={2} p={2}>
                    <Input
                      size="sm"
                      aria-label="Period from"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                    <Input
                      size="sm"
                      aria-label="Period to"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </VStack>
                )}
              </Box>
            </Box>
          )}
        </HStack>
      )}
      {!noRunsYet && show !== MANUAL_RUN_STATUS.COMPLETED && (
        <HStack justify="space-between" px={1} mt={2}>
          <Text fontSize="sm" fontWeight="medium">
            In progress
          </Text>
          <Text color="fg.muted" fontSize="xs">
            {inProgressCount ?? 0}
          </Text>
        </HStack>
      )}
      {listQuery.isLoading ? (
        <Text>Loading runs…</Text>
      ) : listQuery.error ? (
        <Box>
          <Text role="alert">Could not load runs.</Text>
          <Button size="sm" onClick={() => void listQuery.refetch()}>
            Retry
          </Button>
        </Box>
      ) : listedRuns.length === 0 ? (
        <VStack align="start" gap={2} mt={noRunsYet ? 2 : undefined}>
          <Text color="fg.muted" fontSize="md">
            {runSearch
              ? `No runs match “${runSearch}” for ${periods.find(([value]) => value === period)?.[1]?.toLowerCase()}.`
              : noRunsInProgress
                ? 'No runs in progress'
                : allRunsQuery.currentData?.total
                  ? 'No runs match these filters.'
                  : 'No runs yet'}
          </Text>
          {allRunsQuery.currentData?.total && period !== MANUAL_RUN_PERIOD.ANY_TIME && (
            <Button size="xs" variant="outline" onClick={() => setPeriod(MANUAL_RUN_PERIOD.ANY_TIME)}>
              Search any time
            </Button>
          )}
        </VStack>
      ) : (
        <>
          {activeRuns.map(renderRun)}
          {completedGroups.length > 0 && (
            <VStack align="stretch" gap={1} mt={2}>
              <HStack justify="space-between" px={1}>
                <Text fontSize="sm" fontWeight="medium">
                  Completed ·{' '}
                  {period === MANUAL_RUN_PERIOD.RECENT
                    ? 'last 7 days'
                    : periods.find(([value]) => value === period)?.[1]?.toLowerCase()}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {completedCount ?? 0}
                </Text>
              </HStack>
              {completedGroups.map(([day, groupRuns]) => (
                <VStack key={day} align="stretch" gap={1} mt={2}>
                  <Text fontSize="xs" color="fg.muted" px={1}>
                    {completedDayLabel(day)}
                  </Text>
                  {groupRuns.map(renderRun)}
                </VStack>
              ))}
            </VStack>
          )}
        </>
      )}
      {listQuery.currentData && listQuery.currentData.totalPages > 1 && (
        <HStack justify="space-between">
          <Button size="xs" disabled={runPage <= 1} onClick={() => setRunPage((p) => p - 1)}>
            Previous
          </Button>
          <Text fontSize="xs">
            Page {runPage} of {listQuery.currentData.totalPages}
          </Text>
          <Button
            size="xs"
            disabled={runPage >= listQuery.currentData.totalPages}
            onClick={() => setRunPage((p) => p + 1)}
          >
            Next
          </Button>
        </HStack>
      )}
    </VStack>
  );
};
