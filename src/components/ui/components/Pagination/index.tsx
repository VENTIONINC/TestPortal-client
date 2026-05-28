// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { HStack, Button, IconButton, Text, Box } from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: 'full' | 'simple';
  size?: 'sm' | 'md';
}

const DOTS = '...';

const usePagination = ({ currentPage, totalPages, siblingCount = 1 }: { currentPage: number, totalPages: number, siblingCount?: number }) => {
  return useMemo(() => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, DOTS, totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return [];
  }, [currentPage, totalPages, siblingCount]);
};

export const Pagination = ({ currentPage, totalPages, onPageChange, variant = 'full', size = 'md' }: PaginationProps) => {
  const paginationRange = usePagination({ currentPage, totalPages });

  if (currentPage === 0 || paginationRange.length < 1) {
    return null;
  }

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const isSmall = size === 'sm';
  const btnSize = isSmall ? 'xs' : 'sm';
  const btnHeight = isSmall ? 8 : 9;
  const btnMinW = isSmall ? 8 : 9;
  const iconSize = isSmall ? 14 : 16;
  
  const activeBg = 'button.groupButton.selected.bg';
  const defaultBg = 'button.groupButton.default.bg';
  const activeBorderColor = 'button.groupButton.selected.borderColor';
  const defaultBorderColor = 'border.main';

  return (
    <HStack gap={isSmall ? 1 : 2}>
      <IconButton
        variant="ghost"
        size={btnSize}
        onClick={handlePrev}
        disabled={currentPage === 1}
        aria-label="Previous Page"
        color="text.secondary"
        _hover={{ color: 'text.main', bg: 'bg.hover' }}
      >
        <LuChevronLeft size={iconSize} />
      </IconButton>

      {variant === 'full' ? (
        <HStack gap={isSmall ? 1.5 : 2}>
          {paginationRange.map((pageNumber, index) => {
            if (pageNumber === DOTS) {
              return (
                <Box key={`dots-${index}`} px={1}>
                  <Text color="text.secondary" fontSize={isSmall ? 'sm' : 'md'}>&#8230;</Text>
                </Box>
              );
            }

            const isActive = pageNumber === currentPage;

            return (
              <Button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber as number)}
                variant="outline"
                size={btnSize}
                minW={btnMinW}
                height={btnHeight}
                p={0}
                fontWeight={500}
                bg={isActive ? activeBg : 'transparent'}
                borderColor={isActive ? activeBorderColor : defaultBorderColor}
                color={isActive ? 'text.main' : 'text.secondary'}
                _hover={!isActive ? { bg: defaultBg, color: 'text.main' } : undefined}
                transition="all 0.2s"
              >
                {pageNumber}
              </Button>
            );
          })}
        </HStack>
      ) : (
        <Text fontSize={isSmall ? 'sm' : 'md'} color="text.main" fontWeight={500} px={2}>
          {currentPage} of {totalPages}
        </Text>
      )}

      <IconButton
        variant="ghost"
        size={btnSize}
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
        color="text.secondary"
        _hover={{ color: 'text.main', bg: 'bg.hover' }}
      >
        <LuChevronRight size={iconSize} />
      </IconButton>
    </HStack>
  );
};
