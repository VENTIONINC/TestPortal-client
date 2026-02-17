import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Box } from '@chakra-ui/react';

import { FilterConfigSection } from '@/types/filter';

import { Fields, FiltersHeader, FiltersContainer } from '../components';

const FILTER_PANEL_WIDTH = '360px';

type FilterValues = Record<string, string>;

interface FilterContainerProps {
  showFilters: boolean;
  config: FilterConfigSection[];
  filters: FilterValues;
  initialFilters: FilterValues;
  onApplyFilters: (filters: FilterValues) => void;
}

export const FilterContainer = ({
  showFilters,
  config,
  filters,
  initialFilters,
  onApplyFilters,
}: FilterContainerProps) => {
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
      width={showFilters ? FILTER_PANEL_WIDTH : '0px'}
      opacity={showFilters ? 1 : 0}
      overflow="hidden"
      transition="all 0.3s ease-in-out"
      flexShrink={0}
    >
      <FiltersContainer as="aside" width={FILTER_PANEL_WIDTH}>
        <FiltersHeader title="Filters" clearable={isClearable} onClear={handleClear} />
        <Fields config={config} onApply={handleSubmit(onSubmit)} />
      </FiltersContainer>
    </Box>
  );
};
