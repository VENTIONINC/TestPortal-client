import { ChangeEvent } from 'react';
import { StackProps } from '@chakra-ui/react';

import { Input, NativeSelect, DateRangePicker } from '@/components/ui';
// import { FiltersContainer, FiltersGroup, FiltersTitle, FiltersRow } from '@/components/filters';
import { initialFilters, useResultsActions, useResultsFilters } from '@/redux/slices/results';
import { ResultsFilters as ResultsFiltersType } from '@/types';

import { getStatusOptions } from './helpers';
import { REVIEW_STATUS_OPTIONS } from './constants';

const isClearable = (filters: Partial<ResultsFiltersType>) => {
  return Object.keys(filters).some(
    (key) => filters[key as keyof ResultsFiltersType] !== initialFilters[key as keyof ResultsFiltersType],
  );
};

export const ResultsFilters = (props: StackProps) => {
  const filters = useResultsFilters();
  const { updateFilters, clearFilterGroup } = useResultsActions();

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFilters({ ...filters, [name]: value });
  };

  const handleSearch = () => {
    updateFilters({ ...filters });
  };

  return null;
  // return (
  //   <FiltersContainer {...props}>
  //     <FiltersTitle
  //       title="Filters"
  //       clearable={isClearable(filters)}
  //       onClear={() => clearFilterGroup(Object.keys(initialFilters) as (keyof ResultsFiltersType)[])}
  //     />
  //     <FiltersGroup handleSearch={handleSearch} title="Result Filters">
  //       <FiltersRow>
  //         <NativeSelect
  //           label="Status:"
  //           name="status"
  //           value={filters.status}
  //           onChange={handleFilterChange}
  //           items={getStatusOptions()}
  //         />
  //       </FiltersRow>

  //       <FiltersRow>
  //         <NativeSelect
  //           label="Review status:"
  //           name="reviewStatus"
  //           value={filters.reviewStatus}
  //           onChange={handleFilterChange}
  //           items={REVIEW_STATUS_OPTIONS}
  //         />
  //       </FiltersRow>

  //       <FiltersRow>
  //         <Input label="Error message" name="errorMessage" value={filters.errorMessage} onChange={handleFilterChange} />
  //       </FiltersRow>

  //       <FiltersRow>
  //         <DateRangePicker
  //           label="Date range:"
  //           name="dateRange"
  //           fromValue={filters.from}
  //           toValue={filters.to}
  //           onChangeFrom={(value) => updateFilters({ ...filters, from: value })}
  //           onChangeTo={(value) => updateFilters({ ...filters, to: value })}
  //           maxRangeDays={7}
  //         />
  //       </FiltersRow>
  //     </FiltersGroup>

  //     <FiltersGroup title="Issue Filters" handleSearch={handleSearch}>
  //       <FiltersRow>
  //         <Input label="Issue name:" name="issueName" value={filters.issueName} onChange={handleFilterChange} />
  //       </FiltersRow>
  //     </FiltersGroup>

  //     <FiltersGroup title="Spec Filters" handleSearch={handleSearch}>
  //       <FiltersRow>
  //         <Input label="Tag:" name="tag" value={filters.tag} onChange={handleFilterChange} />
  //       </FiltersRow>
  //       <FiltersRow>
  //         <Input label="Spec ID:" name="specId" value={filters.specId} onChange={handleFilterChange} />
  //       </FiltersRow>
  //       <FiltersRow>
  //         <Input label="Spec file:" name="specFile" value={filters.specFile} onChange={handleFilterChange} />
  //       </FiltersRow>
  //       <FiltersRow>
  //         <Input label="Spec name:" name="specName" value={filters.specName} onChange={handleFilterChange} />
  //       </FiltersRow>
  //     </FiltersGroup>

  //     <FiltersGroup title="Execution Filters" handleSearch={handleSearch}>
  //       <FiltersRow>
  //         <Input label="Environment:" name="environment" value={filters.environment} onChange={handleFilterChange} />
  //       </FiltersRow>
  //       <FiltersRow>
  //         <Input label="Type:" name="type" value={filters.type} onChange={handleFilterChange} />
  //       </FiltersRow>
  //     </FiltersGroup>
  //   </FiltersContainer>
  // );
};
