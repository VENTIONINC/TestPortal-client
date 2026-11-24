// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Heading, Text } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router';

import { PATHS } from '@/types/paths';

interface ManualRunEmptyStateProps {
  hasListedRuns: boolean;
  hasAnyRuns: boolean;
  noRunsYet: boolean;
  noRunsInProgress: boolean;
  scenarioCount?: number;
}

export const ManualRunEmptyState = ({
  hasListedRuns,
  hasAnyRuns,
  noRunsYet,
  noRunsInProgress,
  scenarioCount,
}: ManualRunEmptyStateProps) => {
  const navigate = useNavigate();
  const hasScenarios = (scenarioCount ?? 0) > 0;
  const heading = hasListedRuns
    ? 'Select a run'
    : noRunsInProgress
      ? 'Nothing in progress'
      : hasAnyRuns
        ? 'No runs match these filters'
        : hasScenarios
          ? 'Start your first manual run'
          : 'Nothing to run yet';

  let description: string | undefined;
  if (hasListedRuns) {
    description = 'Choose a run from the list to view its scenarios.';
  } else if (noRunsInProgress) {
    description = 'Start a new manual run, or open Filters and set Show to Completed to look at finished ones.';
  } else if (hasScenarios) {
    description = noRunsYet
      ? 'A manual run is one pass through your scenarios where you mark each as Passed, Failed, Blocked or Skipped. Start from a suite, such as a smoke check or a regression pass, or pick scenarios one by one.'
      : 'Start from a suite or select scenarios individually.';
  } else if (scenarioCount === 0) {
    description =
      'A manual run needs scenarios. Create scenarios first, then group them into suites or pick them one by one when you start a run.';
  }

  const canCreateRun = noRunsInProgress || hasScenarios;
  const showNewRunButton = hasScenarios && !noRunsInProgress && !noRunsYet;
  const linkPath = canCreateRun ? PATHS.MANUAL_TEST_RUN_NEW : PATHS.TEST_SCENARIO_NEW;
  const linkLabel = canCreateRun ? '＋ New manual run' : '＋ New scenario';
  const handleCreateRun = () => navigate(PATHS.MANUAL_TEST_RUN_NEW);

  return (
    <Box m="auto" textAlign="center">
      <Heading size="lg">{heading}</Heading>
      <Text color="fg.muted" fontSize="sm" maxW="450px" my={3}>
        {description}
      </Text>
      {showNewRunButton ? (
        <Button colorPalette="blue" onClick={handleCreateRun}>
          New manual run
        </Button>
      ) : (
        <Box asChild color="blue.500" fontSize="sm" _hover={{ textDecoration: 'underline' }}>
          <Link to={linkPath}>{linkLabel}</Link>
        </Box>
      )}
    </Box>
  );
};
