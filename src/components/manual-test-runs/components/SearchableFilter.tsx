// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useState, type KeyboardEvent } from 'react';
import { Box, Button, HStack, Input, Popover, Portal, Text, VStack } from '@chakra-ui/react';
import { FiChevronDown, FiSearch } from 'react-icons/fi';

interface SearchableFilterProps {
  label: string;
  value: string[];
  options: Array<{ value: string; label: string; count?: number }>;
  onChange: (value: string[]) => void;
}

export const SearchableFilter = ({ label, value, options, onChange }: SearchableFilterProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const matches = options.filter((option) =>
    option.label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  const toggle = (optionValue: string) =>
    onChange(value.includes(optionValue) ? value.filter((item) => item !== optionValue) : [...value, optionValue]);
  const close = () => {
    setOpen(false);
    setSearch('');
  };
  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && matches[0]) {
      event.preventDefault();
      toggle(matches[0].value);
    }
  };
  const handleOpenChange = ({ open: nextOpen }: { open: boolean }) => {
    setOpen(nextOpen);
    if (!nextOpen) setSearch('');
  };

  const handleClear = () => {
    onChange([]);
    close();
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={handleOpenChange}
    >
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          bg="bg.card"
          borderColor={value.length ? 'border.active' : undefined}
          color={value.length ? 'text.primary' : undefined}
          minW="90px"
          maxW="250px"
          justifyContent="space-between"
          fontSize="sm"
        >
          {value.length ? `${label}: ${value.length}` : label}
          <FiChevronDown aria-hidden="true" />
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="260px" maxW="calc(100vw - 32px)" bg="bg.card" p={0}>
            <Box position="relative" px={3} borderBottomWidth="1px" borderColor="border.main">
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
                size="sm"
                aria-label={`Search ${label} options`}
                placeholder={`Type to find ${label === 'Assignee' ? 'an assignee' : label === 'Status' ? 'a status' : 'a folder'}`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={onSearchKeyDown}
                ps={7}
                border={0}
                focusRing="none"
              />
            </Box>
            <Popover.Body p={1} maxH="240px" overflowY="auto">
              <VStack align="stretch" gap={0}>
                {matches.map((option) => (
                  <HStack as="label" key={option.value} px={2} py={1.5} cursor="pointer" justify="space-between">
                    <HStack gap={2} minW={0}>
                      <input
                        type="checkbox"
                        aria-label={option.label}
                        checked={value.includes(option.value)}
                        onChange={() => toggle(option.value)}
                      />
                      <Text as="span" fontSize="sm" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                        {option.label}
                      </Text>
                    </HStack>
                    {option.count !== undefined && (
                      <Text flexShrink={0} fontSize="xs" color="text.secondary">
                        {option.count}
                      </Text>
                    )}
                  </HStack>
                ))}
                {matches.length === 0 && (
                  <Text fontSize="sm" color="text.secondary" px={2} py={2}>
                    No matches for “{search}”
                  </Text>
                )}
              </VStack>
            </Popover.Body>
            <HStack justify="space-between" p={2} borderTopWidth="1px" borderColor="border.main">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClear}
              >
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
