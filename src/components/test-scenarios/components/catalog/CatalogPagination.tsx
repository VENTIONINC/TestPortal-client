// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, HStack, IconButton, Text } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import { NativeSelect } from '@/components/ui';

import type { TestScenarioPagination } from '../../types';

interface CatalogPaginationProps {
  pagination: TestScenarioPagination;
  pageSize: number;
  pageSizes: readonly number[];
  onPageSizeChange: (value: number) => void;
  onPageChange: (page: number) => void;
}

export const CatalogPagination = ({
  pagination,
  pageSize,
  pageSizes,
  onPageSizeChange,
  onPageChange,
}: CatalogPaginationProps) => (
  <HStack justify="space-between" flexWrap="wrap" gap={3}>
    <HStack w="full" justify="space-between" gap={3} flexWrap="wrap">
      <Text color="text.secondary" fontSize="sm">
        {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}–
        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
      </Text>
      <HStack as="nav" aria-label="Test Scenario pagination" gap={2}>
        <Text color="text.secondary" fontSize="sm" whiteSpace="nowrap">
          Rows per page
        </Text>
        <Box w="64px">
          <NativeSelect
            id="scenario-page-size"
            aria-label="Rows per page"
            h="8"
            bg="bg.card"
            ps={2}
            value={String(pageSize)}
            onChange={(event) => onPageSizeChange(Number(event.currentTarget.value))}
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </NativeSelect>
        </Box>
        <IconButton
          aria-label="Previous Page"
          size="sm"
          variant="outline"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          <FiChevronLeft />
        </IconButton>
        <IconButton
          aria-label="Next Page"
          size="sm"
          variant="outline"
          disabled={pagination.page >= pagination.totalPages || pagination.totalPages === 0}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          <FiChevronRight />
        </IconButton>
      </HStack>
    </HStack>
  </HStack>
);
