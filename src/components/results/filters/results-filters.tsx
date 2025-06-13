import { ChangeEvent, PropsWithChildren } from 'react';
import { Circle, StackProps, Text, useDisclosure, VStack } from '@chakra-ui/react';
import { LuArrowBigLeft } from 'react-icons/lu';

import { Input, NativeSelect } from '@/components/ui';
import { useResultsActions, useResultsFilters } from '@/redux/slices/results';

export const ResultsFilters = (props: StackProps) => {
  const { open, onToggle } = useDisclosure({ defaultOpen: true });

  const filters = useResultsFilters();

  const { setFilters } = useResultsActions();

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
      <FiltersGroup title="Result Filters" open={open}>
        <NativeSelect
          label="Status:"
          name="status"
          placeholder="Select status"
          value={filters.status}
          onChange={handleFilterChange}
          items={[
            { value: '', label: 'All' },
            { value: 'passed', label: 'Passed' },
            { value: 'failed', label: 'Failed' },
            { value: 'skipped', label: 'Skipped' },
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

      <FiltersGroup title="Issue Filters" open={open}>
        <Input label="Issue name:" name="issueName" value={filters.issueName} onChange={handleFilterChange} />
      </FiltersGroup>

      <FiltersGroup title="Spec Filters" open={open}>
        <Input label="Tag:" name="tag" value={filters.tag} onChange={handleFilterChange} />
        <Input label="Spec ID:" name="specId" value={filters.specId} onChange={handleFilterChange} />
        <Input label="Spec file:" name="specFile" value={filters.specFile} onChange={handleFilterChange} />
        <Input label="Spec name:" name="specName" value={filters.specName} onChange={handleFilterChange} />
      </FiltersGroup>

      <FiltersGroup title="Execution Filters" open={open}>
        <Input label="Environment:" name="environment" value={filters.environment} onChange={handleFilterChange} />
        <Input label="Type:" name="type" value={filters.type} onChange={handleFilterChange} />
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
