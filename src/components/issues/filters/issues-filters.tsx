import { ChangeEvent, PropsWithChildren } from 'react';
import { Circle, StackProps, Text, useDisclosure, VStack } from '@chakra-ui/react';
import { LuArrowBigLeft } from 'react-icons/lu';

import { Input, NativeSelect } from '@/components/ui';
import { useIssuesActions, useIssuesFilters } from '@/redux/slices/issues';
import { IssueCategory } from '@/types';

export const IssuesFilters = (props: StackProps) => {
  const { open, onToggle } = useDisclosure({ defaultOpen: true });

  const filters = useIssuesFilters();

  const { setFilters } = useIssuesActions();

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({ [e.target.name]: e.target.value, page: 1 });
  };

  return (
    <VStack
      gap={4}
      align="stretch"
      w="100%"
      maxW={open ? 64 : 0}
      pos="relative"
      transition="max-width 0.3s ease-in-out"
      {...props}
    >
      <FiltersGroup title="Spec Filters" open={open}>
        <Input label="Tags:" name="tag" value={filters.tag} onChange={handleFilterChange} />
        <Input label="Spec ID:" name="specId" value={filters.specId} onChange={handleFilterChange} />
        <Input label="Spec File:" name="specFile" value={filters.specFile} onChange={handleFilterChange} />
        <Input label="Spec Name:" name="specName" value={filters.specName} onChange={handleFilterChange} />
      </FiltersGroup>

      <FiltersGroup title="Execution Filters" open={open}>
        <Input label="Environment:" name="environment" value={filters.environment} onChange={handleFilterChange} />
        <Input label="Type:" name="type" value={filters.type} onChange={handleFilterChange} />
      </FiltersGroup>

      <FiltersGroup title="Issue Filters" open={open}>
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

      <FiltersGroup title="Statistics Filters" open={open}>
        <Input label="From:" name="statFrom" value={filters.statFrom} onChange={handleFilterChange} type="date" />
        <Input label="To:" name="statTo" value={filters.statTo} onChange={handleFilterChange} type="date" />
      </FiltersGroup>

      <Circle onClick={onToggle} pos="absolute" top={0} right={-5} bg="blue.600" color="white" p={2} cursor="pointer">
        <LuArrowBigLeft
          size={24}
          style={{
            transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.3s ease-in-out',
          }}
        />
      </Circle>
    </VStack>
  );
};

const FiltersGroup = ({ title, open, children }: PropsWithChildren<{ title: string; open: boolean }>) => {
  return (
    <VStack
      align="stretch"
      border="1px solid"
      borderColor="gray.400"
      borderRadius="md"
      p={open ? 4 : 0}
      overflowX="clip"
      transition="padding 0.3s ease-in-out"
    >
      <Text fontWeight={700}>{title}</Text>
      {children}
    </VStack>
  );
};
