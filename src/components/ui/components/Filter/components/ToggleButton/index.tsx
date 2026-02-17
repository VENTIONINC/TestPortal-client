import { Button, ButtonProps } from '@chakra-ui/react';
import { FiFilter } from 'react-icons/fi';

import { useFilterContext } from '@/contexts/FilterContext';

interface FilterToggleButtonProps extends ButtonProps {
  onClick: () => void;
}

export const FilterToggleButton = ({ onClick, ...props }: FilterToggleButtonProps) => {
  const { showFilters } = useFilterContext();

  return (
    <Button size="sm" variant="secondary" data-active={showFilters ? '' : undefined} onClick={onClick} {...props}>
      <FiFilter /> Filter
    </Button>
  );
};
