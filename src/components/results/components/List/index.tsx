// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Mark, Spinner, Box, Stack, Heading, Flex } from '@chakra-ui/react';

import { Checkbox, Skeleton } from '@/components/ui';
import { BulkActions } from '@/components/BulkActions';
import { useResultsSelection } from '@/contexts/results-selection';
import { BaseResult, ResultExecution, ResultSpec } from '@/types';

import { ResultSpecSection } from '../Section';

const PAGE_SIZE = 20;

interface ResultEntry {
  spec: ResultSpec;
  executions: { execution: ResultExecution; results: BaseResult[] }[];
}

interface ResultsListProps {
  handleSelectAll: (resultIds: string[]) => void;
  selectedCount: number;
  selectedResults: BaseResult[];
  isFetching: boolean;
  results: Map<string, ResultEntry>;
  unfilteredResultsMap: Map<string, ResultEntry>;
  activeTags: string[];
  onToggleTag: (tag: string) => void;
}

export const ResultsList = memo(
  ({
    handleSelectAll,
    selectedCount,
    selectedResults,
    isFetching,
    results,
    unfilteredResultsMap,
    activeTags,
    onToggleTag,
  }: ResultsListProps) => {
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [visibleResultIdsBySpec, setVisibleResultIdsBySpec] = useState<Record<string, string[]>>({});
    const { pruneSelection } = useResultsSelection();
    const sentinelRef = useRef<HTMLDivElement>(null);

    const allEntries = useMemo(() => Array.from(results.entries()), [results]);
    const visibleEntries = allEntries.slice(0, visibleCount);
    const hasMore = visibleCount < allEntries.length;
    const shouldReserveListHeight = allEntries.length > 0 || isFetching;
    const defaultVisibleResultIdsBySpec = useMemo(
      () =>
        Object.fromEntries(
          allEntries.map(([specKey, { executions }]) => [
            specKey,
            executions.flatMap(({ results: executionResults }) => executionResults.map(({ id }) => id)),
          ]),
        ),
      [allEntries],
    );

    useEffect(() => {
      setVisibleCount(PAGE_SIZE);
      setVisibleResultIdsBySpec(defaultVisibleResultIdsBySpec);
    }, [defaultVisibleResultIdsBySpec]);

    const handleVisibleResultIdsChange = useCallback((specKey: string, resultIds: string[]) => {
      setVisibleResultIdsBySpec((previous) => ({ ...previous, [specKey]: resultIds }));
    }, []);

    const visibleResultIds = useMemo(() => {
      return visibleEntries.flatMap(
        ([specKey]) => visibleResultIdsBySpec[specKey] ?? defaultVisibleResultIdsBySpec[specKey] ?? [],
      );
    }, [defaultVisibleResultIdsBySpec, visibleEntries, visibleResultIdsBySpec]);

    useEffect(() => {
      pruneSelection(visibleResultIds);
    }, [pruneSelection, visibleResultIds]);

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
      <Box bg="bg.section" borderRadius="xl" minH={shouldReserveListHeight ? 'calc(100vh - 200px)' : 0}>
        <Stack>
          <Box mx={4} mt={4} mb="8px" borderBottom="1px solid" borderColor="border.main">
            <Heading fontSize="lg" mb={4}>
              Results
            </Heading>
            <Flex p="3px 16px 1px" mb={4} align="center" bg="bg.section" borderRadius="md">
              <Box mr={2}>
                <Checkbox
                  checked={visibleResultIds.length !== 0 && selectedCount === visibleResultIds.length}
                  onCheckedChange={() => handleSelectAll(visibleResultIds)}
                >
                  Selected <Mark fontWeight={600}>{selectedCount}</Mark>
                  {/* <span>/</span>
                <Mark fontWeight={600}>{activeDaysResultsIds.length}</Mark> */}
                </Checkbox>
              </Box>
              <Box mb={1}>
                <BulkActions selectedResults={selectedResults} />
              </Box>
            </Flex>
          </Box>

          <Stack align="stretch" gap={6} pb={6}>
            {visibleEntries.length === 0 && isFetching && (
              <>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} loading={isFetching} minH="120px" borderRadius="xl" />
                ))}
              </>
            )}

            {visibleEntries.map(([specKey, { spec, executions: filteredExecutions }]) => {
              const unfilteredExecutions = unfilteredResultsMap.get(specKey)?.executions || [];
              return (
                <Skeleton key={spec.id} loading={isFetching} minH="120px" borderRadius="xl">
                  <ResultSpecSection
                    spec={spec}
                    executions={filteredExecutions}
                    allExecutions={unfilteredExecutions}
                    activeTags={activeTags}
                    onToggleTag={onToggleTag}
                    onVisibleResultIdsChange={handleVisibleResultIdsChange}
                  />
                </Skeleton>
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
  },
);
