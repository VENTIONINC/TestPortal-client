// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Badge, Box, Button, HStack, IconButton, Input, Text, VStack } from '@chakra-ui/react';
import { FiCheck, FiSearch, FiSliders, FiX } from 'react-icons/fi';

import { MANUAL_RUN_PERIOD, MANUAL_RUN_SHOW, MANUAL_RUN_STATUS } from '../../constants';
import { periods, type useManualRunList } from '../useManualRunList';
import { useRunFiltersPopover } from '../useRunFiltersPopover';

interface ManualRunSidebarFiltersProps {
  runList: Pick<
    ReturnType<typeof useManualRunList>,
    | 'noRunsYet'
    | 'runSearch'
    | 'setRunSearch'
    | 'show'
    | 'setShow'
    | 'period'
    | 'setPeriod'
    | 'dateFrom'
    | 'setDateFrom'
    | 'dateTo'
    | 'setDateTo'
    | 'activeRunFilterCount'
  >;
}

export const ManualRunSidebarFilters = ({ runList }: ManualRunSidebarFiltersProps) => {
  const {
    noRunsYet,
    runSearch,
    setRunSearch,
    show,
    setShow,
    period,
    setPeriod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    activeRunFilterCount,
  } = runList;
  const { filtersOpen, setFiltersOpen, filtersRef } = useRunFiltersPopover();

  const handleSelectShow = (value: Parameters<typeof setShow>[0]) => {
    setShow(value);
    setFiltersOpen(false);
  };

  const handleSelectPeriod = (value: Parameters<typeof setPeriod>[0]) => {
    setPeriod(value);
    if (value !== MANUAL_RUN_PERIOD.CUSTOM) setFiltersOpen(false);
  };

  if (noRunsYet) return null;

  return (
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
  );
};
