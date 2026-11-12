// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Link, useParams } from 'react-router';
import { Box, Heading, Text } from '@chakra-ui/react';

import { PATHS } from '@/types/paths';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { ManualTestRunHistoryContainer } from '@/components/manual-test-runs';

export const ManualTestRunHistoryBoundary = () => {
  const { selectedProjectId } = useSelectedProject();
  const { runId, scenarioId } = useParams<{ runId?: string; scenarioId?: string }>();
  const normalizedRunId = runId?.trim() || undefined;

  if (!selectedProjectId) return null;

  if (scenarioId) return <Box p={6}><Heading size="md">Scenario-specific history is no longer available</Heading><Text mt={2}>Manual runs can now contain multiple scenarios. Browse project runs to find the run you need.</Text><Box mt={4}><Link to={PATHS.MANUAL_TEST_RUNS}>View project runs</Link></Box></Box>;

  return <ManualTestRunHistoryContainer key={selectedProjectId} projectId={selectedProjectId} selectedRunId={normalizedRunId} />;
};
