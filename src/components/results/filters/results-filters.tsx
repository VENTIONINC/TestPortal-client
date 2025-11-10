import { ChangeEvent, useEffect, useState } from 'react';
import { Button, StackProps } from '@chakra-ui/react';

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
  const globalFilters = useResultsFilters();
  const [localFilters, setLocalFilters] = useState(globalFilters);

  const { updateFilters, clearFilterGroup } = useResultsActions();

  useEffect(() => {
    setLocalFilters(globalFilters);
  }, [globalFilters]);


  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'from' || name === 'to') {
      setLocalFilters((prev) => {
        const updatedFilters = { ...prev, [name]: value };

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

        return updatedFilters;
      });
    } else {
      setLocalFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleApplyFilters = () => {
    updateFilters(localFilters);
  };


  return (
    <FiltersContainer {...props}>
      <FiltersGroup
        title="Result Filters"
        clearable={isClearable({
          status: localFilters.status,
          reviewStatus: localFilters.reviewStatus,
          errorMessage: localFilters.errorMessage,
          from: localFilters.from,
          to: localFilters.to,
        })}
        onClear={() => clearFilterGroup(['status', 'reviewStatus', 'errorMessage', 'from', 'to'])}
      >
        <NativeSelect
          label="Status:"
          name="status"
          value={localFilters.status}
          onChange={handleFilterChange}
          items={getStatusOptions()}
        />
        <NativeSelect
          label="Review status:"
          name="reviewStatus"
          value={localFilters.reviewStatus}
          onChange={handleFilterChange}
          items={REVIEW_STATUS_OPTIONS}
        />
        <Input label="Error message" name="errorMessage" value={localFilters.errorMessage} onChange={handleFilterChange} />
        <Input label="From" name="from" value={localFilters.from} onChange={handleFilterChange} type="date" />
        <Input label="To:" name="to" value={localFilters.to} onChange={handleFilterChange} type="date" />
        <Button onClick={handleApplyFilters}>Apply</Button>
      </FiltersGroup>

      <FiltersGroup
        title="Issue Filters"
        clearable={isClearable({ issueName: localFilters.issueName })}
        onClear={() => clearFilterGroup(['issueName'])}
      >
        <Input label="Issue name:" name="issueName" value={localFilters.issueName} onChange={handleFilterChange} />
        <Button onClick={handleApplyFilters}>Apply</Button>
      </FiltersGroup>

      <FiltersGroup
        title="Spec Filters"
        clearable={isClearable({
          tag: localFilters.tag,
          specId: localFilters.specId,
          specFile: localFilters.specFile,
          specName: localFilters.specName,
        })}
        onClear={() => clearFilterGroup(['tag', 'specId', 'specFile', 'specName'])}
      >
        <Input label="Tag:" name="tag" value={localFilters.tag} onChange={handleFilterChange} />
        <Input label="Spec ID:" name="specId" value={localFilters.specId} onChange={handleFilterChange} />
        <Input label="Spec file:" name="specFile" value={localFilters.specFile} onChange={handleFilterChange} />
        <Input label="Spec name:" name="specName" value={localFilters.specName} onChange={handleFilterChange} />
        <Button onClick={handleApplyFilters}>Apply</Button>
      </FiltersGroup>

      <FiltersGroup
        title="Execution Filters"
        clearable={isClearable({ environment: localFilters.environment, type: localFilters.type })}
        onClear={() => clearFilterGroup(['environment', 'type'])}
      >
        <Input label="Environment:" name="environment" value={localFilters.environment} onChange={handleFilterChange} />
        <Input label="Type:" name="type" value={localFilters.type} onChange={handleFilterChange} />
        <Button onClick={handleApplyFilters}>Apply</Button>
      </FiltersGroup>

    </FiltersContainer>
  );
};
