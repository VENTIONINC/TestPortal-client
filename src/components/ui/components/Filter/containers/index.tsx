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

  console.log('isClearable, ', isClearable)
  return (
    <Box
      width={showFilters ? FILTER_PANEL_WIDTH : FILTER_COLLAPSED_WIDTH}
      transition={`width ${PANEL_TRANSITION}`}
      overflow="hidden"
      flexShrink={0}
      borderRight="1px solid"
      
      borderColor="border.main"
    >
      <Box display="grid" width={FILTER_PANEL_WIDTH} h="100%">
        <Box
          gridArea="1 / 1"
          opacity={showFilters ? 0 : 1}
          pointerEvents={showFilters ? 'none' : 'auto'}
          transform={showFilters ? 'translateX(-12px)' : 'translateX(0px)'}
          transition={`opacity 0.18s ease, transform ${PANEL_TRANSITION}`}
        >
          <FiltersContainer as="aside" width={FILTER_COLLAPSED_WIDTH}>
            <Box w="100%"  display="flex" justifyContent="center">
              <IconButton aria-label="Open filters" variant="ghost" size="sm" onClick={toggleFilters}>
                <FiFilter size={16} />
              </IconButton>
            </Box>
          </FiltersContainer>
        </Box>

        <Box
          gridArea="1 / 1"
          opacity={showFilters ? 1 : 0}
          pointerEvents={showFilters ? 'auto' : 'none'}
          transform={showFilters ? 'translateX(0px)' : 'translateX(-24px)'}
          transition={`opacity 0.2s ease, transform ${PANEL_TRANSITION}`}
        >
          <FiltersContainer as="aside" width={FILTER_PANEL_WIDTH} >
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
            <Fields config={config} onApply={handleSubmit(onSubmit)} />
          </FiltersContainer>
        </Box>
      </Box>
    </Box>
  );
};
