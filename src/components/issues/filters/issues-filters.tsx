import { ChangeEvent } from 'react';
import { StackProps } from '@chakra-ui/react';

import { Input, NativeSelect } from '@/components/ui';
import { FiltersContainer, FiltersGroup } from '@/components/filters';
import { initialFilters, useIssuesActions, useIssuesFilters } from '@/redux/slices/issues';
import { IssueCategory, IssueFilters } from '@/types';

export const IssuesFilters = (props: StackProps) => {
  const filters = useIssuesFilters();

  const { setFilters } = useIssuesActions();

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({ [e.target.name]: e.target.value, page: 1 });
  };

  const isClearable = (filters: Partial<IssueFilters>) => {
    return Object.keys(filters).some(
      (key) => filters[key as keyof IssueFilters] !== initialFilters[key as keyof IssueFilters],
    );
  };

  const handleSetFilters = (filters: Partial<IssueFilters>) => {
    setFilters({ ...filters, page: 1 });
  };

  return (
    <FiltersContainer {...props}>
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
        <Input label="Tags:" name="tag" value={filters.tag} onChange={handleFilterChange} />
        <Input label="Spec ID:" name="specId" value={filters.specId} onChange={handleFilterChange} />
        <Input label="Spec File:" name="specFile" value={filters.specFile} onChange={handleFilterChange} />
        <Input label="Spec Name:" name="specName" value={filters.specName} onChange={handleFilterChange} />
      </FiltersGroup>

      <FiltersGroup
        title="Execution Filters"
        clearable={isClearable({ environment: filters.environment, type: filters.type })}
        onClear={() => handleSetFilters({ environment: initialFilters.environment, type: initialFilters.type })}
      >
        <Input label="Environment:" name="environment" value={filters.environment} onChange={handleFilterChange} />
        <Input label="Type:" name="type" value={filters.type} onChange={handleFilterChange} />
      </FiltersGroup>

      <FiltersGroup
        title="Issue Filters"
        clearable={isClearable({ category: filters.category, name: filters.name })}
        onClear={() => handleSetFilters({ category: initialFilters.category, name: initialFilters.name })}
      >
        <NativeSelect
          label="Category:"
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          items={[
            { value: '', label: 'All' },
            ...Object.values(IssueCategory).map((category) => ({ value: category, label: category })),
          ]}
        />
        <Input label="Name:" name="name" value={filters.name} onChange={handleFilterChange} />
      </FiltersGroup>

      <FiltersGroup
        title="Statistics Filters"
        clearable={isClearable({ statFrom: filters.statFrom, statTo: filters.statTo })}
        onClear={() => handleSetFilters({ statFrom: initialFilters.statFrom, statTo: initialFilters.statTo })}
      >
        <Input label="From:" name="statFrom" value={filters.statFrom} onChange={handleFilterChange} type="date" />
        <Input label="To:" name="statTo" value={filters.statTo} onChange={handleFilterChange} type="date" />
      </FiltersGroup>
    </FiltersContainer>
  );
};
