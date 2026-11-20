// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { Box, Button, HStack, Input, Popover, Text, VStack } from '@chakra-ui/react';
import { FiChevronDown, FiSearch } from 'react-icons/fi';

import type { GetApiV2TestSuitesApiResponse } from '@/redux/apis/generatedApi';

interface ScenarioSuiteFilterProps {
  suites: GetApiV2TestSuitesApiResponse;
  suiteIds: string[];
  loading: boolean;
  hasError: boolean;
  onToggleSuite: (id: string) => void;
  onClear: () => void;
}

export const ScenarioSuiteFilter = ({
  suites,
  suiteIds,
  loading,
  hasError,
  onToggleSuite,
  onClear,
}: ScenarioSuiteFilterProps) => {
  const [suiteOpen, setSuiteOpen] = useState(false);
  const [suiteSearch, setSuiteSearch] = useState('');

  const handleOpenChange = ({ open }: { open: boolean }) => {
    setSuiteOpen(open);
    if (!open) setSuiteSearch('');
  };

  const handleClose = () => {
    setSuiteOpen(false);
    setSuiteSearch('');
  };

  const handleClearSuites = () => {
    onClear();
    handleClose();
  };

  return (
    <Popover.Root
      open={suiteOpen}
      onOpenChange={handleOpenChange}
      positioning={{ placement: 'bottom-end' }}
    >
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          bg="bg.card"
          h="40px"
          maxW="250px"
          borderColor={suiteIds.length ? 'border.active' : undefined}
        >
          <Text as="span" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            Suite
            {suiteIds.length
              ? `: ${suiteIds.length === 1 ? (suites.find((suite) => suite.id === suiteIds[0])?.name ?? '1') : suiteIds.length}`
              : ''}
          </Text>
          <FiChevronDown aria-hidden="true" />
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content w="260px" bg="bg.card" p={0}>
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
              aria-label="Search suites"
              placeholder="Type to find a suite"
              size="sm"
              value={suiteSearch}
              onChange={(event) => setSuiteSearch(event.target.value)}
              ps={7}
              border={0}
              focusRing="none"
            />
          </Box>
          <Popover.Body p={1} maxH="240px" overflowY="auto">
            <VStack align="stretch" gap={0}>
              {loading && (
                <Text px={2} py={2} color="text.secondary" fontSize="sm">
                  Loading suites…
                </Text>
              )}
              {hasError && (
                <Text px={2} py={2} color="text.secondary" fontSize="sm">
                  Suites are unavailable.
                </Text>
              )}
              {suites
                .filter((item) => item.name.toLocaleLowerCase().includes(suiteSearch.trim().toLocaleLowerCase()))
                .map((item) => (
                  <HStack as="label" key={item.id} px={2} py={1.5} cursor="pointer" justify="space-between">
                    <HStack gap={2} minW={0}>
                      <input
                        type="checkbox"
                        aria-label={item.name}
                        checked={suiteIds.includes(item.id)}
                        onChange={() => onToggleSuite(item.id)}
                      />
                      <Text as="span" fontSize="sm" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                        {item.name}
                      </Text>
                    </HStack>
                    <Text flexShrink={0} fontSize="xs" color="text.secondary">
                      {item.members?.length ?? '–'}
                    </Text>
                  </HStack>
                ))}
              {!loading &&
                !hasError &&
                !suites.some((item) =>
                  item.name.toLocaleLowerCase().includes(suiteSearch.trim().toLocaleLowerCase()),
                ) && (
                  <Text px={2} py={2} color="text.secondary" fontSize="sm">
                    No suites found
                  </Text>
                )}
            </VStack>
          </Popover.Body>
          <HStack justify="space-between" p={2} borderTopWidth="1px" borderColor="border.main">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearSuites}
            >
              Clear
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleClose}
            >
              Done
            </Button>
          </HStack>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
};
