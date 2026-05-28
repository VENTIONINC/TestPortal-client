// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Box, IconButton } from '@chakra-ui/react';
import { FiFilter } from 'react-icons/fi';
import { LuArrowLeftToLine } from 'react-icons/lu';

import { useFilterContext } from '@/contexts/FilterContext';
import { FilterConfigSection } from '@/types/filter';

import { Fields, FiltersHeader, FiltersContainer } from '../components';

const FILTER_PANEL_WIDTH = '357px';
const FILTER_COLLAPSED_WIDTH = '72px';
const PANEL_TRANSITION = '0.32s cubic-bezier(0.22, 1, 0.36, 1)';

type FilterValues = Record<string, string>;

interface FilterContainerProps {
  config: FilterConfigSection[];
  filters: FilterValues;
  initialFilters: FilterValues;
  onApplyFilters: (filters: FilterValues) => void;
}

export const FilterContainer = ({ config, filters, initialFilters, onApplyFilters }: FilterContainerProps) => {
  const { showFilters, toggleFilters } = useFilterContext();
  const { handleSubmit, reset } = useFormContext<FilterValues>();

  const isClearable = useMemo(() => {
    return Object.keys(filters).some((key) => filters[key] !== initialFilters[key]);
  }, [filters, initialFilters]);

  const handleClear = useCallback(() => {
    reset(initialFilters);
    onApplyFilters({ ...initialFilters });
  }, [initialFilters, onApplyFilters, reset]);

  const onSubmit = useCallback(
    (data: FilterValues) => {
      onApplyFilters(data);
    },
    [onApplyFilters],
  );

  return (
    <Box
      width={showFilters ? FILTER_PANEL_WIDTH : FILTER_COLLAPSED_WIDTH}
      transition={`width ${PANEL_TRANSITION}`}
      flexShrink={0}
      borderRight="1px solid"
      borderColor="border.main"
      position="sticky"
      top="66px"
      h="calc(100vh - 66px)"
      zIndex={10}
      bg="bg.section"
      display="flex"
      flexDirection="column"
       
    >
      <Box flex="1" minH="0" display="grid" width={showFilters ? FILTER_PANEL_WIDTH : FILTER_COLLAPSED_WIDTH}>
        {/* Collapsed View */}
        <Box
          gridArea="1 / 1"
          opacity={showFilters ? 0 : 1}
          pointerEvents={showFilters ? 'none' : 'auto'}
          transform={showFilters ? 'translateX(-12px)' : 'translateX(0px)'}
          transition={`opacity 0.18s ease, transform ${PANEL_TRANSITION}`}
        >
          <FiltersContainer as="aside" width={FILTER_COLLAPSED_WIDTH}>
            <Box display="flex" justifyContent="center">
              <IconButton aria-label="Open filters" variant="ghost" size="sm" onClick={toggleFilters}>
                <FiFilter size={16} />
              </IconButton>
            </Box>
          </FiltersContainer>
        </Box>

        {/* Expanded View */}
        <Box
          gridArea="1 / 1"
          opacity={showFilters ? 1 : 0}
          pointerEvents={showFilters ? 'auto' : 'none'}
          transform={showFilters ? 'translateX(0px)' : 'translateX(-24px)'}
          transition={`opacity 0.2s ease, transform ${PANEL_TRANSITION}`}
          display="flex"
          flexDirection="column"
          h="100%"
          minH="0"
          position={showFilters ? 'sticky' : 'absolute'}
          
        >
          <FiltersHeader
            title="Filters"
            clearable={isClearable}
            onClear={handleClear}
            leadingAction={
              <IconButton aria-label="Close filters" variant="ghost" size="md" ml={2} onClick={toggleFilters}>
                <LuArrowLeftToLine size={20} />
              </IconButton>
            }
          />
          <Box
            flex="1"
            overflowY="auto"
            px="4"
            css={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            <Fields config={config} onApply={handleSubmit(onSubmit)} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
