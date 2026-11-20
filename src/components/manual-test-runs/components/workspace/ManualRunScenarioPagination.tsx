// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ChangeEvent } from 'react';
import { Box, HStack, IconButton, Text } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import { NativeSelect } from '@/components/ui';

import type { useManualRunScenarioFilters } from '../useManualRunScenarioFilters';

interface ManualRunScenarioPaginationProps {
  filters: Pick<
    ReturnType<typeof useManualRunScenarioFilters>,
    'scenarioPage' | 'scenarioPageSize' | 'scenarioPageCount' | 'setScenarioPage' | 'setScenarioPageSize'
  >;
  total: number;
}

export const ManualRunScenarioPagination = ({ filters, total }: ManualRunScenarioPaginationProps) => {
  const { scenarioPage, scenarioPageCount, scenarioPageSize, setScenarioPage, setScenarioPageSize } = filters;
  const firstRow = (scenarioPage - 1) * scenarioPageSize + 1;
  const lastRow = Math.min(scenarioPage * scenarioPageSize, total);
  const summary = total ? `${firstRow}–${lastRow} of ${total}` : 'No scenarios match these filters.';
  const previousPageDisabled = scenarioPage <= 1;
  const nextPageDisabled = scenarioPage >= scenarioPageCount;

  const handleScenarioPageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setScenarioPageSize(Number(event.target.value));
    setScenarioPage(1);
  };

  const handlePreviousScenarioPage = () => {
    setScenarioPage((page) => page - 1);
  };

  const handleNextScenarioPage = () => {
    setScenarioPage((page) => page + 1);
  };

  return (
    <HStack justify="space-between" wrap="wrap">
      <Text fontSize="sm" color="text.secondary">
        {summary}
      </Text>
      <HStack as="nav" aria-label="Run scenarios pagination" gap={2}>
        <Text fontSize="sm" color="text.secondary" whiteSpace="nowrap">
          Rows per page
        </Text>
        <Box w="64px">
          <NativeSelect
            aria-label="Rows per page"
            h="8"
            bg="bg.card"
            ps={2}
            value={scenarioPageSize}
            onChange={handleScenarioPageSizeChange}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </NativeSelect>
        </Box>
        <IconButton
          size="sm"
          variant="outline"
          aria-label="Previous page"
          disabled={previousPageDisabled}
          onClick={handlePreviousScenarioPage}
        >
          <FiChevronLeft />
        </IconButton>
        <IconButton
          size="sm"
          variant="outline"
          aria-label="Next page"
          disabled={nextPageDisabled}
          onClick={handleNextScenarioPage}
        >
          <FiChevronRight />
        </IconButton>
      </HStack>
    </HStack>
  );
};
