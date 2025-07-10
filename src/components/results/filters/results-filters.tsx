import { ChangeEvent, useEffect, useState } from 'react';
import { Button, StackProps } from '@chakra-ui/react';

import { Input, NativeSelect } from '@/components/ui';
import { FiltersContainer, FiltersGroup } from '@/components/filters';
import { initialFilters, useResultsActions, useResultsFilters } from '@/redux/slices/results';
import { ResultsFilters as ResultsFiltersType } from '@/types';

import { getStatusOptions } from './helpers';
import { REVIEW_STATUS_OPTIONS } from './constants';
import { ResultsFileUpload } from '../file-upload';

export const ResultsFilters = (props: StackProps) => {
  const globalFilters = useResultsFilters();
  const [localFilters, setLocalFilters] = useState(globalFilters);

  const { setFilters } = useResultsActions();

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setLocalFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearch = () => {
    setFilters({ ...localFilters, page: 1 });
  };

  const isClearable = (filters: Partial<ResultsFiltersType>) => {
    return Object.keys(filters).some(
      (key) => filters[key as keyof ResultsFiltersType] !== initialFilters[key as keyof ResultsFiltersType],
    );
  };

  const handleSetFilters = (filters: Partial<ResultsFiltersType>) => {
    setFilters({ ...filters, page: 1 });
  };

  useEffect(() => {
    setLocalFilters(globalFilters);
  }, [globalFilters]);

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
        <Input
          label="Error message"
          name="errorMessage"
          value={localFilters.errorMessage}
          onChange={handleFilterChange}
        />
        <Input label="From" name="from" value={localFilters.from} onChange={handleFilterChange} type="date" />
        <Input label="To:" name="to" value={localFilters.to} onChange={handleFilterChange} type="date" />
        <Button onClick={handleSearch}>Apply</Button>
      </FiltersGroup>

      <FiltersGroup
        title="Issue Filters"
        clearable={isClearable({ issueName: localFilters.issueName })}
        onClear={() => handleSetFilters({ issueName: initialFilters.issueName })}
      >
        <Input label="Issue name:" name="issueName" value={localFilters.issueName} onChange={handleFilterChange} />
        <Button onClick={handleSearch}>Apply</Button>
      </FiltersGroup>

      <FiltersGroup
        title="Spec Filters"
        clearable={isClearable({
          tag: localFilters.tag,
          specId: localFilters.specId,
          specFile: localFilters.specFile,
          specName: localFilters.specName,
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
        <Input label="Tag:" name="tag" value={localFilters.tag} onChange={handleFilterChange} />
        <Input label="Spec ID:" name="specId" value={localFilters.specId} onChange={handleFilterChange} />
        <Input label="Spec file:" name="specFile" value={localFilters.specFile} onChange={handleFilterChange} />
        <Input label="Spec name:" name="specName" value={localFilters.specName} onChange={handleFilterChange} />
        <Button onClick={handleSearch}>Apply</Button>
      </FiltersGroup>

      <FiltersGroup
        title="Execution Filters"
        clearable={isClearable({ environment: localFilters.environment, type: localFilters.type })}
        onClear={() => handleSetFilters({ environment: initialFilters.environment, type: initialFilters.type })}
      >
        <Input label="Environment:" name="environment" value={localFilters.environment} onChange={handleFilterChange} />
        <Input label="Type:" name="type" value={localFilters.type} onChange={handleFilterChange} />
        <Button onClick={handleSearch}>Apply</Button>
      </FiltersGroup>

      <ResultsFileUpload />
    </FiltersContainer>
  );
};
