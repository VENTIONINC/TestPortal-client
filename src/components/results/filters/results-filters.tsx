import { ChangeEvent } from 'react';
import { StackProps } from '@chakra-ui/react';

import { Input, NativeSelect } from '@/components/ui';
import { FiltersContainer, FiltersGroup } from '@/components/filters';
import { initialFilters, useResultsActions, useResultsFilters } from '@/redux/slices/results';
import { ResultsFilters as ResultsFiltersType, ResultStatus } from '@/types';

export const ResultsFilters = (props: StackProps) => {
  const filters = useResultsFilters();

  const { setFilters } = useResultsActions();

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({ [e.target.name]: e.target.value, page: 1 });
  };

  const isClearable = (filters: Partial<ResultsFiltersType>) => {
    return Object.keys(filters).some(
      (key) => filters[key as keyof ResultsFiltersType] !== initialFilters[key as keyof ResultsFiltersType],
    );
  };

  const handleSetFilters = (filters: Partial<ResultsFiltersType>) => {
    setFilters({ ...filters, page: 1 });
  };

  return (
    <FiltersContainer {...props}>
      <FiltersGroup
        title="Result Filters"
        clearable={isClearable({
          status: filters.status,
          reviewStatus: filters.reviewStatus,
          errorMessage: filters.errorMessage,
          from: filters.from,
          to: filters.to,
        })}
        onClear={() =>
          handleSetFilters({
            status: initialFilters.status,
            reviewStatus: initialFilters.reviewStatus,
            errorMessage: initialFilters.errorMessage,
            from: initialFilters.from,
            to: initialFilters.to,
          })
        }
      >
        <NativeSelect
          label="Status:"
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          items={[
            { value: '', label: 'All' },
            ...Object.values(ResultStatus).map((status) => ({
              value: status,
              label: status.charAt(0).toUpperCase() + status.slice(1),
            })),
          ]}
        />
        <NativeSelect
          label="Review status:"
          name="reviewStatus"
          value={filters.reviewStatus}
          onChange={handleFilterChange}
          items={[
            { value: '', label: 'All' },
            { value: 'completed', label: 'Completed' },
            { value: 'inCompleted', label: 'Not Completed' },
          ]}
        />
        <Input label="Error message" name="errorMessage" value={filters.errorMessage} onChange={handleFilterChange} />
        <Input label="From" name="from" value={filters.from} onChange={handleFilterChange} type="date" />
        <Input label="To:" name="to" value={filters.to} onChange={handleFilterChange} type="date" />
      </FiltersGroup>

      <FiltersGroup
        title="Issue Filters"
        clearable={isClearable({ issueName: filters.issueName })}
        onClear={() => handleSetFilters({ issueName: initialFilters.issueName })}
      >
        <Input label="Issue name:" name="issueName" value={filters.issueName} onChange={handleFilterChange} />
      </FiltersGroup>

      <FiltersGroup
        title="Spec Filters"
        clearable={isClearable({
          tag: filters.tag,
          specId: filters.specId,
          specFile: filters.specFile,
          specName: filters.specName,
        })}
        onClear={() =>
          handleSetFilters({
            tag: initialFilters.tag,
            specId: initialFilters.specId,
            specFile: initialFilters.specFile,
            specName: initialFilters.specName,
          })
        }
      >
        <Input label="Tag:" name="tag" value={filters.tag} onChange={handleFilterChange} />
        <Input label="Spec ID:" name="specId" value={filters.specId} onChange={handleFilterChange} />
        <Input label="Spec file:" name="specFile" value={filters.specFile} onChange={handleFilterChange} />
        <Input label="Spec name:" name="specName" value={filters.specName} onChange={handleFilterChange} />
      </FiltersGroup>

      <FiltersGroup
        title="Execution Filters"
        clearable={isClearable({ environment: filters.environment, type: filters.type })}
        onClear={() => handleSetFilters({ environment: initialFilters.environment, type: initialFilters.type })}
      >
        <Input label="Environment:" name="environment" value={filters.environment} onChange={handleFilterChange} />
        <Input label="Type:" name="type" value={filters.type} onChange={handleFilterChange} />
      </FiltersGroup>
    </FiltersContainer>
  );
};
