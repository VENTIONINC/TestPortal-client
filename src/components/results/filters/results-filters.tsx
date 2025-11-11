import { ChangeEvent } from 'react';
import { StackProps } from '@chakra-ui/react';

import { Input, NativeSelect } from '@/components/ui';
import { FiltersContainer, FiltersGroup } from '@/components/filters';
import { initialFilters, useResultsActions, useResultsFilters } from '@/redux/slices/results';
import { ResultsFilters as ResultsFiltersType } from '@/types';
import { calculateDateDiff, adjustDateToWeekRange } from '@/utils/dateUtils';

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

    if (name === 'from' || name === 'to') {
      const updatedFilters = { ...filters, [name]: value };

      if (value && updatedFilters.from && updatedFilters.to) {
        const diff = calculateDateDiff(updatedFilters.from, updatedFilters.to);

        if (diff > 7) {
          if (name === 'from') {
            updatedFilters.to = adjustDateToWeekRange(value, true);
          } else {
            updatedFilters.from = adjustDateToWeekRange(value, false);
          }
        }
      }

      updateFilters(updatedFilters);
    } else {
      updateFilters({ ...filters, [name]: value });
    }
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
        onClear={() => clearFilterGroup(['status', 'reviewStatus', 'errorMessage', 'from', 'to'])}
      >
        <NativeSelect
          label="Status:"
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          items={getStatusOptions()}
        />
        <NativeSelect
          label="Review status:"
          name="reviewStatus"
          value={filters.reviewStatus}
          onChange={handleFilterChange}
          items={REVIEW_STATUS_OPTIONS}
        />
        <Input label="Error message" name="errorMessage" value={filters.errorMessage} onChange={handleFilterChange} />
        <Input label="From" name="from" value={filters.from} onChange={handleFilterChange} type="date" />
        <Input label="To:" name="to" value={filters.to} onChange={handleFilterChange} type="date" />
      </FiltersGroup>

      <FiltersGroup
        title="Issue Filters"
        clearable={isClearable({ issueName: filters.issueName })}
        onClear={() => clearFilterGroup(['issueName'])}
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
        onClear={() => clearFilterGroup(['tag', 'specId', 'specFile', 'specName'])}
      >
        <Input label="Tag:" name="tag" value={filters.tag} onChange={handleFilterChange} />
        <Input label="Spec ID:" name="specId" value={filters.specId} onChange={handleFilterChange} />
        <Input label="Spec file:" name="specFile" value={filters.specFile} onChange={handleFilterChange} />
        <Input label="Spec name:" name="specName" value={filters.specName} onChange={handleFilterChange} />
      </FiltersGroup>

      <FiltersGroup
        title="Execution Filters"
        clearable={isClearable({ environment: filters.environment, type: filters.type })}
        onClear={() => clearFilterGroup(['environment', 'type'])}
      >
        <Input label="Environment:" name="environment" value={filters.environment} onChange={handleFilterChange} />
        <Input label="Type:" name="type" value={filters.type} onChange={handleFilterChange} />
      </FiltersGroup>

    </FiltersContainer>
  );
};
