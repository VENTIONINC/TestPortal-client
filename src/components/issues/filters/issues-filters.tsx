import { ChangeEvent, useEffect, useState } from 'react';
import { Button, StackProps } from '@chakra-ui/react';

import { Input, NativeSelect } from '@/components/ui';
import { FiltersContainer, FiltersGroup } from '@/components/filters';
import { initialFilters, useIssuesActions, useIssuesFilters } from '@/redux/slices/issues';
import { IssueCategory, IssueFilters } from '@/types';

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
        <Input label="Tags:" name="tag" value={localFilters.tag} onChange={handleFilterChange} />
        <Input label="Spec ID:" name="specId" value={localFilters.specId} onChange={handleFilterChange} />
        <Input label="Spec File:" name="specFile" value={localFilters.specFile} onChange={handleFilterChange} />
        <Input label="Spec Name:" name="specName" value={localFilters.specName} onChange={handleFilterChange} />
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

      <FiltersGroup
        title="Issue Filters"
        clearable={isClearable({ category: localFilters.category, name: localFilters.name })}
        onClear={() => handleSetFilters({ category: initialFilters.category, name: initialFilters.name })}
      >
        <NativeSelect
          label="Category:"
          name="category"
          value={localFilters.category}
          onChange={handleFilterChange}
          items={[
            { value: '', label: 'All' },
            ...Object.values(IssueCategory).map((category) => ({ value: category, label: category })),
          ]}
        />
        <Input label="Name:" name="name" value={localFilters.name} onChange={handleFilterChange} />
        <Button onClick={handleSearch}>Apply</Button>
      </FiltersGroup>

      <FiltersGroup
        title="Statistics Filters"
        clearable={isClearable({ statFrom: localFilters.statFrom, statTo: localFilters.statTo })}
        onClear={() => handleSetFilters({ statFrom: initialFilters.statFrom, statTo: initialFilters.statTo })}
      >
        <Input label="From:" name="statFrom" value={localFilters.statFrom} onChange={handleFilterChange} type="date" />
        <Input label="To:" name="statTo" value={localFilters.statTo} onChange={handleFilterChange} type="date" />
        <Button onClick={handleSearch}>Apply</Button>
      </FiltersGroup>
    </FiltersContainer>
  );
};
