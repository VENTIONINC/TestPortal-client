import { useEffect, useRef, useState } from 'react';
import { Mark, Spinner, Text, Box, Stack, Heading, Flex } from '@chakra-ui/react';

import { Checkbox, Wrap } from '@/components/ui';
import { BulkActions } from '@/components/BulkActions';
import { BaseResult, ResultExecution, ResultSpec } from '@/types';

import { ResultSpecSection } from '../Section';

const PAGE_SIZE = 20;

interface ResultEntry {
  spec: ResultSpec;
  executions: { execution: ResultExecution; results: BaseResult[] }[];
}

interface ResultsListProps {
  activeDaysResultsIds: string[];
  handleSelectAll: () => void;
  selectedCount: number;
  selectedResults: BaseResult[];
  isFetching: boolean;
  results: Map<string, ResultEntry>;
  unfilteredResultsMap: Map<string, ResultEntry>;
}

export const ResultsList = ({
  activeDaysResultsIds,
  handleSelectAll,
  selectedCount,
  selectedResults,
  isFetching,
  results,
  unfilteredResultsMap,
}: ResultsListProps) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const allEntries = Array.from(results.entries());
  const visibleEntries = allEntries.slice(0, visibleCount);
  const hasMore = visibleCount < allEntries.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [results]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allEntries.length));
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, allEntries.length]);

  return (
    <Wrap>
      <Stack>
        <Box>
          <Heading>Results</Heading>
          <Flex aline="center">
            <Box mr={2}>
              <Checkbox
                checked={activeDaysResultsIds.length !== 0 && selectedCount === activeDaysResultsIds.length}
                onCheckedChange={handleSelectAll}
              >
                Select all
              </Checkbox>
            </Box>
            <Box>
              <BulkActions selectedResults={selectedResults} />
            </Box>
          </Flex>

          <Text textStyle="sm">
            Shown <Mark fontWeight={600}>{activeDaysResultsIds.length}</Mark>. Selected{' '}
            <Mark fontWeight={600}>{selectedCount}</Mark>
          </Text>

          {isFetching && <Spinner />}
        </Box>
        <Box>
          <Stack
            align="stretch"
            gap={4}
            flex={1}
            overflowY="auto"
            overflowX="hidden"
            css={{
              '&::-webkit-scrollbar': { width: '8px' },
              '&::-webkit-scrollbar-track': {
                background: 'var(--chakra-colors-gray-100)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'var(--chakra-colors-gray-300)',
                borderRadius: '4px',
                '&:hover': { background: 'var(--chakra-colors-gray-400)' },
              },
            }}
          >
            {visibleEntries.map(([specKey, { spec, executions }]) => {
              const unfilteredExecutions = unfilteredResultsMap.get(specKey)?.executions || [];
              return (
                <ResultSpecSection
                  key={spec.id}
                  spec={spec}
                  executions={executions}
                  allExecutions={unfilteredExecutions}
                />
              );
            })}

            {hasMore && (
              <Box ref={sentinelRef} display="flex" justifyContent="center" py={4}>
                <Spinner size="sm" />
              </Box>
            )}
          </Stack>
        </Box>
      </Stack>
    </Wrap>
  );
};
