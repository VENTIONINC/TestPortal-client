// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { Box, Button, HStack, IconButton, Input, Portal, Popover, Text, VStack } from '@chakra-ui/react';
import { FiCheck, FiChevronDown, FiSearch, FiX } from 'react-icons/fi';

import { Tooltip } from '@/components/ui';

import { TagFilter } from '../../tags';
import type { TestScenarioCatalogViewProps } from './types';
import { priorityColors, shortAuthorName, type PriorityValue } from './utils';

interface PriorityFilterProps {
  value: string;
  counts?: Partial<Record<PriorityValue, number | undefined>>;
  onChange: (value: string) => void;
}

const PriorityFilter = ({ value, counts, onChange }: PriorityFilterProps) => {
  const [open, setOpen] = useState(false);
  const values: PriorityValue[] = ['high', 'medium', 'low'];
  const selected = value ? (value.split(',') as PriorityValue[]) : [];
  const selectedPriority = selected.length === 1 ? selected[0] : undefined;
  const priorityLabel = (priority: PriorityValue) => priority.charAt(0).toUpperCase() + priority.slice(1);
  const handleClearSearch = () => {
    onChange('');
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={({ open: nextOpen }) => setOpen(nextOpen)}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          bg={'bg.card'}
          borderColor={selected.length ? 'border.active' : undefined}
          color={selected.length ? 'text.primary' : undefined}
          minW="110px"
          justifyContent="space-between"
          fontSize="sm"
        >
          {selectedPriority ? (
            <HStack as="span" gap={2}>
              <Text as="span">Priority:</Text>
              <Text
                as="span"
                px={2}
                borderRadius="full"
                fontSize="xs"
                bg={priorityColors[selectedPriority].bg}
                color={priorityColors[selectedPriority].color}
              >
                {priorityLabel(selectedPriority)}
              </Text>
            </HStack>
          ) : selected.length > 1 ? (
            `Priority: ${selected.length}`
          ) : (
            'Priority'
          )}{' '}
          <FiChevronDown />
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="220px" bg="bg.card" p={2}>
            <Popover.Body p={1}>
              <VStack align="stretch" gap={1}>
                {values.map((item) => (
                  <HStack as="label" key={item} px={2} py={1} cursor="pointer" justify="space-between">
                    <HStack gap={2}>
                      <input
                        type="checkbox"
                        aria-label={item.charAt(0).toUpperCase() + item.slice(1)}
                        checked={selected.includes(item)}
                        onChange={() =>
                          onChange(
                            values
                              .filter((entry) =>
                                entry === item ? !selected.includes(entry) : selected.includes(entry),
                              )
                              .join(','),
                          )
                        }
                      />
                      <Text
                        as="span"
                        px={2}
                        borderRadius="full"
                        fontSize="xs"
                        bg={priorityColors[item].bg}
                        color={priorityColors[item].color}
                      >
                        {priorityLabel(item)}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="text.secondary">
                      {counts?.[item] ?? '–'}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Popover.Body>
            <HStack justify="space-between" pt={2} borderTopWidth="1px" borderColor="border.main">
              <Button size="sm" variant="ghost" onClick={handleClearSearch}>
                Clear
              </Button>
              <Button size="sm" variant="primary" onClick={() => setOpen(false)}>
                Done
              </Button>
            </HStack>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

interface AuthorFilterProps {
  value: string[];
  authors: Array<{ id: string; name: string; email: string; scenarioCount?: number }>;
  loading: boolean;
  error?: unknown;
  onChange: (value: string[]) => void;
}

const AuthorFilter = ({ value, authors, loading, error, onChange }: AuthorFilterProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selectedAuthors = authors.filter((author) => value.includes(author.id));
  const matchingAuthors = authors.filter((author) =>
    `${author.name} ${author.email}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  const selectedAuthor = selectedAuthors[0];
  const label =
    value.length === 1
      ? `Author: ${selectedAuthor?.name ? shortAuthorName(selectedAuthor.name) : selectedAuthor?.email || '1'}`
      : value.length
        ? `Author: ${value.length}`
        : 'Author';
  const close = () => {
    setOpen(false);
    setSearch('');
  };

  const handleOpenChange = ({ open: nextOpen }: { open: boolean }) => {
    setOpen(nextOpen);
    if (!nextOpen) setSearch('');
  };

  const handleClearSelection = () => {
    onChange([]);
    close();
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          bg={'bg.card'}
          borderColor={value.length ? 'border.active' : undefined}
          color={value.length ? 'text.primary' : undefined}
          minW="90px"
          maxW="250px"
          justifyContent="space-between"
          fontSize="sm"
        >
          <Text as="span" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            {label}
          </Text>
          <FiChevronDown aria-hidden="true" />
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="260px" bg="bg.card" p={0}>
            <Box position="relative" px={3} py={0} borderBottomWidth="1px" borderColor="border.main">
              <Box
                position="absolute"
                insetStart={3}
                top="50%"
                transform="translateY(-50%)"
                zIndex={1}
                color="text.muted"
                pointerEvents="none"
              >
                <FiSearch aria-hidden="true" size={13} />
              </Box>
              <Input
                aria-label="Search authors"
                placeholder="Type to find an author"
                size="sm"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                ps={7}
                border={0}
                focusRing="none"
              />
            </Box>
            <Popover.Body p={1} maxH="240px" overflowY="auto">
              <VStack align="stretch" gap={0}>
                {loading && (
                  <Text px={2} py={2} color="text.secondary" fontSize="sm">
                    {authors.length ? 'Updating author counts…' : 'Loading authors…'}
                  </Text>
                )}
                {Boolean(error) && (
                  <Text px={2} py={2} color="text.secondary" fontSize="sm">
                    Author counts are unavailable.
                  </Text>
                )}
                {matchingAuthors.length ? (
                  matchingAuthors.map((author) => (
                    <HStack as="label" key={author.id} px={2} py={1.5} cursor="pointer" justify="space-between">
                      <HStack gap={2} minW={0}>
                        <input
                          type="checkbox"
                          aria-label={author.name || author.email}
                          checked={value.includes(author.id)}
                          onChange={() =>
                            onChange(
                              value.includes(author.id)
                                ? value.filter((id) => id !== author.id)
                                : [...value, author.id],
                            )
                          }
                        />
                        <Text as="span" fontSize="sm" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                          {author.name || author.email}
                        </Text>
                      </HStack>
                      <Text flexShrink={0} fontSize="xs" color="text.secondary">
                        {author.scenarioCount ?? (loading ? '…' : '–')}
                      </Text>
                    </HStack>
                  ))
                ) : !loading && !error ? (
                  <Text px={2} py={2} color="text.secondary" fontSize="sm">
                    No authors found
                  </Text>
                ) : null}
              </VStack>
            </Popover.Body>
            <HStack justify="space-between" p={2} borderTopWidth="1px" borderColor="border.main">
              <Button size="sm" variant="ghost" onClick={handleClearSelection}>
                Clear
              </Button>
              <Button size="sm" variant="primary" onClick={close}>
                Done
              </Button>
            </HStack>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

interface ScenarioSortSelectProps {
  value: TestScenarioCatalogViewProps['sort'];
  onChange: (value: TestScenarioCatalogViewProps['sort']) => void;
  allowRunOrder: boolean;
}

const ScenarioSortSelect = ({ value, onChange, allowRunOrder }: ScenarioSortSelectProps) => {
  const [open, setOpen] = useState(false);
  const options: Array<{ value: typeof value; label: string }> = [
    { value: 'scenarioKey', label: 'Key' },
    { value: 'title', label: 'Title' },
    { value: 'folder', label: 'Folder' },
    { value: 'updatedAt', label: 'Updated' },
    { value: 'createdBy', label: 'Author' },
  ];
  const selectedLabel = options.find((option) => option.value === value)?.label ?? 'Run order';

  return (
    <Popover.Root open={open} onOpenChange={({ open: nextOpen }) => setOpen(nextOpen)}>
      <Popover.Trigger asChild>
        <Button
          aria-label={`Sort: ${selectedLabel}`}
          variant="outline"
          bg="bg.card"
          borderColor={
            (allowRunOrder ? Boolean(value) : Boolean(value && value !== 'updatedAt')) ? 'border.active' : undefined
          }
          minW="152px"
          justifyContent="space-between"
          fontSize="sm"
        >
          <Text as="span">Sort: {selectedLabel}</Text>
          <FiChevronDown aria-hidden="true" />
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="132px" bg="bg.card" p={1}>
            <Popover.Body p={0}>
              <VStack align="stretch" gap={0}>
                {(allowRunOrder ? [{ value: undefined, label: 'Run order' }, ...options] : options).map((option) => {
                  const selected = option.value === value;
                  const handleSelectOption = () => {
                    onChange(option.value);
                    setOpen(false);
                  };

                  return (
                    <Button
                      key={option.value ?? 'run-order'}
                      variant="ghost"
                      size="sm"
                      justifyContent="space-between"
                      fontWeight={selected ? 'semibold' : 'normal'}
                      color={selected ? 'blue.600' : undefined}
                      bg={selected ? 'blue.50' : undefined}
                      _hover={{ bg: selected ? 'blue.100' : 'bg.subtle' }}
                      _dark={selected ? { color: 'blue.200', bg: 'blue.900', _hover: { bg: 'blue.800' } } : undefined}
                      aria-current={selected ? 'true' : undefined}
                      onClick={handleSelectOption}
                    >
                      {option.label}
                      {selected && <FiCheck aria-hidden="true" />}
                    </Button>
                  );
                })}
              </VStack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

interface SortDirectionIconProps {
  direction: 'asc' | 'desc';
}

const SortDirectionIcon = ({ direction }: SortDirectionIconProps) => {
  const widths = direction === 'desc' ? [9, 7, 5] : [5, 7, 9];

  return (
    <svg
      aria-hidden="true"
      width="22.5"
      height="22.5"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {widths.map((width, index) => (
        <line key={index} x1="2.5" y1={5 + index * 5} x2={2.5 + width} y2={5 + index * 5} />
      ))}
      {direction === 'desc' ? <path d="M16 3.5v12m-3-3 3 3 3-3" /> : <path d="M16 16.5v-12m-3 3 3-3 3 3" />}
    </svg>
  );
};

const filterLabels: Record<keyof TestScenarioCatalogViewProps['columnFilters'], string> = {
  scenarioKey: 'Scenario key',
  title: 'Title',
  details: 'Details',
  folder: 'Folder',
  createdBy: 'Created by',
};

interface CatalogFiltersProps extends Pick<
  TestScenarioCatalogViewProps,
  'projectId' | 'tagIds' | 'tagCounts' | 'onTagChange'
> {
  hidden: boolean;
  showFilters: boolean;
  allowRunOrder: boolean;
  search: string;
  onSearchChange: TestScenarioCatalogViewProps['onSearchChange'];
  priority: string;
  priorityCounts?: TestScenarioCatalogViewProps['priorityCounts'];
  onPriorityChange: TestScenarioCatalogViewProps['onPriorityChange'];
  selectedAuthorIds: string[];
  authors: TestScenarioCatalogViewProps['authors'];
  authorsLoading: boolean;
  authorsError?: unknown;
  onAuthorChange: TestScenarioCatalogViewProps['onAuthorChange'];
  sort: TestScenarioCatalogViewProps['sort'];
  sortDirection: TestScenarioCatalogViewProps['sortDirection'];
  onSortChange: TestScenarioCatalogViewProps['onSortChange'];
  onSortDirectionChange: TestScenarioCatalogViewProps['onSortDirectionChange'];
  activeColumnFilters: Array<[keyof TestScenarioCatalogViewProps['columnFilters'], string]>;
  onColumnFilterChange: TestScenarioCatalogViewProps['onColumnFilterChange'];
}

export const CatalogFilters = ({
  projectId,
  tagIds,
  tagCounts,
  onTagChange,
  hidden,
  showFilters,
  allowRunOrder,
  search,
  onSearchChange,
  priority,
  priorityCounts,
  onPriorityChange,
  selectedAuthorIds,
  authors,
  authorsLoading,
  authorsError,
  onAuthorChange,
  sort,
  sortDirection,
  onSortChange,
  onSortDirectionChange,
  activeColumnFilters,
  onColumnFilterChange,
}: CatalogFiltersProps) => {
  const handleClearFilters = () => {
    activeColumnFilters.forEach(([field]) => onColumnFilterChange(field, ''));
    onSearchChange('');
  };

  return (
    <VStack align="stretch" gap={2} display={hidden ? 'none' : undefined}>
      <HStack gap={2} flexWrap="wrap">
        <Box
          position="relative"
          flex={{ base: '1 1 100%', md: '0 1 260px' }}
          w={{ base: '100%', md: '260px' }}
          maxW="100%"
        >
          <Box
            position="absolute"
            insetStart={3}
            top="50%"
            transform="translateY(-50%)"
            zIndex={1}
            color="text.muted"
            pointerEvents="none"
          >
            <FiSearch aria-hidden="true" size={14} />
          </Box>
          <Input
            aria-label="Search scenarios"
            placeholder="Search by title or key"
            value={search}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            ps={9}
            pe={search ? 9 : 3}
            bg="bg.card"
            borderColor={search.trim() ? 'border.active' : undefined}
          />
          {search && (
            <IconButton
              position="absolute"
              insetEnd={1}
              top="50%"
              transform="translateY(-50%)"
              size="xs"
              variant="ghost"
              aria-label="Clear scenario search"
              onClick={() => onSearchChange('')}
            >
              <FiX />
            </IconButton>
          )}
        </Box>
        {showFilters ? (
          <>
            <PriorityFilter value={priority} counts={priorityCounts} onChange={onPriorityChange} />
            <AuthorFilter
              value={selectedAuthorIds}
              authors={authors}
              loading={authorsLoading}
              error={authorsError}
              onChange={onAuthorChange}
            />
            {projectId && (
              <TagFilter projectId={projectId} selectedIds={tagIds} counts={tagCounts} onChange={onTagChange} />
            )}
            <Box flex="1 1 auto" minW={0} />
            <ScenarioSortSelect value={sort} onChange={onSortChange} allowRunOrder={allowRunOrder} />
            <Tooltip content={sortDirection === 'desc' ? 'Descending' : 'Ascending'}>
              <IconButton
                aria-label={`Sort ${sortDirection === 'desc' ? 'descending' : 'ascending'}`}
                disabled={!sort}
                variant="outline"
                bg="bg.card"
                color="text.primary"
                borderColor={sort && sortDirection !== 'desc' ? 'border.active' : 'border.main'}
                h="40px"
                w="40px"
                minW="40px"
                p={0}
                borderRadius="md"
                _hover={{ bg: 'bg.subtle', borderColor: 'border.active' }}
                onClick={() => onSortDirectionChange(sortDirection === 'desc' ? 'asc' : 'desc')}
              >
                <SortDirectionIcon direction={sortDirection} />
              </IconButton>
            </Tooltip>
          </>
        ) : null}
        {(search.trim() || activeColumnFilters.length > 0) && (
          <Text fontSize="xs" color="text.muted">
            {activeColumnFilters.length + Number(Boolean(search.trim()))} search{' '}
            {activeColumnFilters.length + Number(Boolean(search.trim())) === 1 ? 'term' : 'terms'} active
          </Text>
        )}
      </HStack>
      {activeColumnFilters.length > 0 && (
        <HStack gap={2} flexWrap="wrap" aria-label="Active scenario filters">
          {activeColumnFilters.map(([field, value]) => (
            <Button
              key={field}
              size="xs"
              variant="subtle"
              colorPalette="blue"
              borderRadius="full"
              onClick={() => onColumnFilterChange(field, '')}
            >
              {filterLabels[field]}: {value}
              <FiX aria-hidden="true" />
            </Button>
          ))}
          {activeColumnFilters.length + Number(Boolean(search.trim())) > 1 && (
            <Button size="xs" variant="ghost" color="text.muted" onClick={handleClearFilters}>
              Clear all
            </Button>
          )}
        </HStack>
      )}
    </VStack>
  );
};
