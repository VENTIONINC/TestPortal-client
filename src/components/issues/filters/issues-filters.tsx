import { ChangeEvent, useEffect, useState } from 'react';
import { StackProps, Box } from '@chakra-ui/react';

import { Input, NativeSelect } from '@/components/ui';
import { FiltersContainer, FiltersGroup, FiltersTitle, FiltersRow } from '@/components/filters';
import { initialFilters, useIssuesActions, useIssuesFilters } from '@/redux/slices/issues';
import { IssueCategory, IssueFilters } from '@/types';
import { ISSUE_CATEGORY_LABELS } from '@/utils';

export const IssuesFilters = (props: StackProps) => {
  const globalFilters = useIssuesFilters();
  const [localFilters, setLocalFilters] = useState(globalFilters);

  const { setFilters } = useIssuesActions();

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setLocalFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearch = () => {
    setFilters({ ...localFilters, page: 1 });
  };

  const isClearable = (filters: Partial<IssueFilters>) => {
    return Object.keys(filters).some(
      (key) => filters[key as keyof IssueFilters] !== initialFilters[key as keyof IssueFilters],
    );
  };

  const handleSetFilters = (filters: Partial<IssueFilters>) => {
    setFilters({ ...filters, page: 1 });
  };

  useEffect(() => {
    setLocalFilters(globalFilters);
  }, [globalFilters]);

  return (
    <FiltersContainer {...props}>
      <FiltersTitle
        title="Filters"
        clearable={isClearable(globalFilters)}
        onClear={() => handleSetFilters(initialFilters)}
      />
      <FiltersGroup title="Spec Filters" handleSearch={handleSearch}>
        <FiltersRow>
          <Input label="Tags:" name="tag" value={localFilters.tag} onChange={handleFilterChange} />
        </FiltersRow>

        <FiltersRow>
          <Input label="Spec ID:" name="specId" value={localFilters.specId} onChange={handleFilterChange} />
        </FiltersRow>

        <FiltersRow>
          <Input label="Spec File:" name="specFile" value={localFilters.specFile} onChange={handleFilterChange} />
        </FiltersRow>
        <FiltersRow>
          <Input label="Spec Name:" name="specName" value={localFilters.specName} onChange={handleFilterChange} />
        </FiltersRow>
      </FiltersGroup>

      <FiltersGroup title="Execution Filters" handleSearch={handleSearch}>
        <FiltersRow>
          <Input
            label="Environment:"
            name="environment"
            value={localFilters.environment}
            onChange={handleFilterChange}
          />
        </FiltersRow>
        <FiltersRow>
          <Input label="Type:" name="type" value={localFilters.type} onChange={handleFilterChange} />
        </FiltersRow>
      </FiltersGroup>

      <FiltersGroup title="Issue Filters" handleSearch={handleSearch}>
        <FiltersRow>
          <NativeSelect
            label="Category:"
            name="category"
            value={localFilters.category}
            onChange={handleFilterChange}
            items={[
              { value: '', label: 'All' },
              ...Object.values(IssueCategory).map((category) => ({
                value: category,
                label: ISSUE_CATEGORY_LABELS[category],
              })),
            ]}
          />
        </FiltersRow>

        <FiltersRow>
          <Input label="Name:" name="name" value={localFilters.name} onChange={handleFilterChange} />
        </FiltersRow>
      </FiltersGroup>

      <FiltersGroup title="Statistics Filters" handleSearch={handleSearch}>
        <FiltersRow>
          <Box display="flex" flexDirection="row" gap={4}>
            <Input
              label="From:"
              name="statFrom"
              value={localFilters.statFrom}
              onChange={handleFilterChange}
              type="date"
            />
            <Input label="To:" name="statTo" value={localFilters.statTo} onChange={handleFilterChange} type="date" />
          </Box>
        </FiltersRow>
      </FiltersGroup>
    </FiltersContainer>
  );
};
