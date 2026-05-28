// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Button, ButtonProps } from '@chakra-ui/react';
import { FiFilter } from 'react-icons/fi';

import { useFilterContext } from '@/contexts/FilterContext';

interface FilterToggleButtonProps extends ButtonProps {
  collapsedLabel?: string;
  expandedLabel?: string;
}

export const FilterToggleButton = ({
  collapsedLabel = 'Show filters',
  expandedLabel = 'Hide filters',
  ...props
}: FilterToggleButtonProps) => {
  const { showFilters, toggleFilters } = useFilterContext();

  return (
    <Button size="sm" variant="secondary" data-active={showFilters ? '' : undefined} onClick={toggleFilters} {...props}>
      <FiFilter />
      {showFilters ? expandedLabel : collapsedLabel}
    </Button>
  );
};
