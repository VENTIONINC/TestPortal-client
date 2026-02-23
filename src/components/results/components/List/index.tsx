import { useEffect, useRef, useState } from 'react';
import { Mark, Spinner, Box, Stack, Heading, Flex } from '@chakra-ui/react';

import { Checkbox } from '@/components/ui';
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

  const allEntries = Array.from(unfilteredResultsMap.entries());
  const visibleEntries = allEntries.slice(0, visibleCount);
  const hasMore = visibleCount < allEntries.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [unfilteredResultsMap]);

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
    <Box bg="bg.section" borderRadius="xl">
      <Stack>
        <Box mx={4} mt={4} mb="8px" borderBottom="1px solid" borderColor="border.main">
          <Heading fontSize="lg" mb={4}>
            Results
          </Heading>
          <Flex p="3px 16px 1px" mb={4}>
            <Box mr={2}>
              <Checkbox
                checked={activeDaysResultsIds.length !== 0 && selectedCount === activeDaysResultsIds.length}
                onCheckedChange={handleSelectAll}
              >
                Selected <Mark fontWeight={600}>{selectedCount}</Mark>
                <span>/</span>
                <Mark fontWeight={600}>{activeDaysResultsIds.length}</Mark>
              </Checkbox>
            </Box>
            <Box>
              <BulkActions selectedResults={selectedResults} />
            </Box>
          </Flex>

          {isFetching && <Spinner />}
        </Box>

        <Stack align="stretch" gap={6} flex={1} overflowY="auto" overflowX="hidden">
          {visibleEntries.map(([specKey, { spec, executions: unfilteredExecutions }]) => {
            const filteredExecutions = results.get(specKey)?.executions || [];
            return (
              <ResultSpecSection
                key={spec.id}
                spec={spec}
                executions={filteredExecutions}
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
      </Stack>
    </Box>
  );
};
