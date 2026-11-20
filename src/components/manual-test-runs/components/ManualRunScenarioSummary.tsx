// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { Box, Button, HStack, Text } from '@chakra-ui/react';

import { useLazyGetApiV2TestScenariosQuery } from '@/redux/apis/generatedApi';
import type { ManualTestRunScenarioRead, TestScenarioSummary } from '@/redux/apis/generatedApi';

type ManualRunScenarioSummaryProps = {
  projectId: string;
  selectedIds: string[];
  existing: ManualTestRunScenarioRead[];
  sourceSuiteName?: string;
  onChange: () => void;
};

export function ManualRunScenarioSummary({
  projectId,
  selectedIds,
  existing,
  sourceSuiteName,
  onChange,
}: ManualRunScenarioSummaryProps) {
  const [catalog, setCatalog] = useState<TestScenarioSummary[]>([]);
  const [loadScenarios] = useLazyGetApiV2TestScenariosQuery();

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const first = await loadScenarios({ projectId, page: 1, limit: 100 }, true).unwrap();
        const rest = await Promise.all(
          Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, index) =>
            loadScenarios({ projectId, page: index + 2, limit: 100 }, true).unwrap(),
          ),
        );

        if (active) setCatalog([first, ...rest].flatMap((page) => page.scenarios));
      } catch {
        if (active) setCatalog([]);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [projectId, loadScenarios]);

  const rows = selectedIds
    .map((id) => {
      const row = catalog.find((item) => item.id === id);
      const snapshot = existing.find((item) => item.sourceScenarioId === id);

      return row
        ? { priority: row.priority, folder: row.folderId ?? 'unfiled' }
        : snapshot
          ? { priority: snapshot.priority, folder: snapshot.folderPath ?? 'unfiled' }
          : undefined;
    })
    .filter((row) => row !== undefined);

  const counts = (['high', 'medium', 'low'] as const).map(
    (priority) =>
      `${priority[0].toUpperCase() + priority.slice(1)} ${rows.filter((row) => row.priority === priority).length}`,
  );
  const completeStats = rows.length === selectedIds.length;

  return (
    <Box>
      <Text fontSize="sm" color="fg.muted" mb={2}>
        Scenarios
      </Text>
      <HStack borderWidth="1px" borderColor="border.main" borderRadius="md" p={4} justify="space-between">
        <Box>
          <Text fontSize="16px" fontWeight="medium">
            {selectedIds.length} unique {selectedIds.length === 1 ? 'scenario' : 'scenarios'}
          </Text>
          <Text fontSize="sm" color="fg.muted">
            {selectedIds.length === 0
              ? 'Select scenarios to continue'
              : completeStats
                ? `${counts.join(' · ')} · in ${new Set(rows.map((row) => row.folder)).size} folders`
                : 'Loading scenario details…'}
          </Text>
        </Box>
        <Button variant="outline" onClick={onChange}>
          Change
        </Button>
      </HStack>
      {sourceSuiteName && (
        <Text color="fg.muted" fontSize="sm" mt={2}>
          Started from the suite “{sourceSuiteName}”.
        </Text>
      )}
    </Box>
  );
}
