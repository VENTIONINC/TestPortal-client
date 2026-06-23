// import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Box, Flex, Icon, Text, Circle } from '@chakra-ui/react';
import { FiAlertTriangle, FiInfo } from 'react-icons/fi';

import {
  useGetApiV2IssuesWithStatsQuery,
  useGetApiV2ProjectsByProjectIdDashboardQuery,
  type ProjectCategoryWeights,
  type GetApiV2IssuesWithStatsApiResponse,
} from '@/redux/apis/generatedApi';
import { useSelectedProject } from '@/hooks';
// import { getIssueCategoryStyle } from '@/utils';
// import { IssueCategory } from '@/types';
import { ProgressBar, ProgressRoot } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_ENVIRONMENT = 'staging';

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Weight multiplier helper respecting settings or spec defaults
const getWeightMultiplier = (category: string | undefined, projectWeights: ProjectCategoryWeights | undefined) => {
  const cat = category?.toLowerCase();

  if (projectWeights) {
    if (cat === 'bug') return projectWeights.bug / 100;
    if (cat === 'infra' || cat === 'environment') return projectWeights.infra / 100;
    if (cat === 'script') return projectWeights.script / 100;
    if (cat === 'performance') return projectWeights.performance / 100;
    return (projectWeights.other ?? 100) / 100;
  }

  // Fallback to spec defaults
  if (cat === 'bug') return 1.5;
  if (cat === 'performance') return 1.0;
  if (cat === 'infra' || cat === 'environment') return 0.3;
  if (cat === 'script') return 0.2;
  return 0.1;
};

// Calculate IWQS from issues list and category weights
const calculateIWQS = (
  issues: GetApiV2IssuesWithStatsApiResponse['issues'] | undefined,
  projectWeights: ProjectCategoryWeights | undefined,
) => {
  if (!issues || issues.length === 0) {
    return { weightedSum: 0, totalLinkedFailures: 0, score: 100 };
  }

  let weightedSum = 0;
  let totalLinkedFailures = 0;

  issues.forEach((issue) => {
    const occurrenceCount = issue.statistics?.occurrenceCount ?? 0;
    const impactedTestsCount = issue.statistics?.impactedTestsCount ?? 0;
    const multiplier = getWeightMultiplier(issue.category, projectWeights);

    weightedSum += impactedTestsCount * multiplier;
    totalLinkedFailures += occurrenceCount;
  });

  if (totalLinkedFailures === 0) {
    return { weightedSum, totalLinkedFailures, score: 100 };
  }

  const rawScore = (1 - weightedSum / totalLinkedFailures) * 100;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  return { weightedSum, totalLinkedFailures, score };
};

export const ProductQualityWidget = () => {
  const { project, selectedProjectId } = useSelectedProject();
  const [searchParams] = useSearchParams();
  const period = searchParams.get('period') || '30';

  const parsedPeriod = Number.parseInt(period, 10);
  const periodDays = Number.isFinite(parsedPeriod) && parsedPeriod > 0 ? parsedPeriod : 30;

  // Date ranges
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodEnd.getDate() - Math.max(periodDays - 1, 0));

  const prevPeriodEnd = new Date(periodStart);
  const prevPeriodStart = new Date(prevPeriodEnd);
  prevPeriodStart.setDate(prevPeriodEnd.getDate() - Math.max(periodDays - 1, 0));

  const statFrom = formatLocalDate(periodStart);
  const statTo = formatLocalDate(periodEnd);
  const prevStatFrom = formatLocalDate(prevPeriodStart);
  const prevStatTo = formatLocalDate(prevPeriodEnd);

  // 1. Fetch current period issues stats
  const { data: currentIssuesData, isLoading: isLoadingCurrentIssues } = useGetApiV2IssuesWithStatsQuery(
    { projectId: selectedProjectId, statFrom, statTo, limit: 1000 },
    { skip: !selectedProjectId },
  );

  // 2. Fetch previous period issues stats
  const { data: prevIssuesData, isLoading: isLoadingPrevIssues } = useGetApiV2IssuesWithStatsQuery(
    { projectId: selectedProjectId, statFrom: prevStatFrom, statTo: prevStatTo, limit: 1000 },
    { skip: !selectedProjectId },
  );

  // 3. Fetch double period dashboard summary to extract raw failures counts
  const { data: doubleDashboardData, isLoading: isLoadingDashboard } = useGetApiV2ProjectsByProjectIdDashboardQuery(
    {
      projectId: selectedProjectId,
      environment: DEFAULT_ENVIRONMENT,
      period: String(periodDays * 2),
      granularity: 'daily',
    },
    { skip: !selectedProjectId },
  );

  const isLoading = isLoadingCurrentIssues || isLoadingPrevIssues || isLoadingDashboard;

  if (isLoading) {
    return (
      <Flex direction="column" justify="center" align="center" h="100%" minH="220px" gap={4}>
        <Skeleton w="120px" h="120px" borderRadius="full" />
        <Skeleton w="80px" h="20px" borderRadius="md" />
        <Skeleton w="180px" h="12px" borderRadius="md" />
      </Flex>
    );
  }

  // Extract total runs and failures from double dashboard history
  const history = doubleDashboardData?.history ?? [];
  let totalRuns = 0;
  let totalFailures = 0;
  let prevFailures = 0;

  const nowTime = periodEnd.getTime();
  const midPointTime = periodStart.getTime();
  const startPointTime = prevPeriodStart.getTime();

  history.forEach((row) => {
    const rowTime = new Date(row.date).getTime();
    const failed = row.metrics?.failed ?? 0;
    const runs = row.metrics?.total ?? 0;

    if (rowTime >= midPointTime && rowTime <= nowTime) {
      totalRuns += runs;
      totalFailures += failed;
    } else if (rowTime >= startPointTime && rowTime < midPointTime) {
      prevFailures += failed;
    }
  });

  // Calculate current period IWQS
  const { totalLinkedFailures, score: currentIWQS } = calculateIWQS(
    currentIssuesData?.issues,
    project?.categoryWeights,
  );

  // Calculate previous period IWQS
  const { totalLinkedFailures: prevLinkedFailures, score: prevIWQS } = calculateIWQS(
    prevIssuesData?.issues,
    project?.categoryWeights,
  );

  // State 4: No runs in period
  if (totalRuns === 0) {
    return (
      <Flex direction="column" justify="center" align="center" h="100%" minH="220px" textAlign="center" gap={3}>
        <Circle size="48px" bg="bg.subtle" border="1px solid" borderColor="border.muted">
          <Icon as={FiInfo} color="fg.muted" boxSize={5} />
        </Circle>
        <Text fontSize="sm" fontWeight="bold" color="fg.muted">
          No test runs in selected period.
        </Text>
      </Flex>
    );
  }

  // Linked failures calculations
  const linkedFailures = Math.min(totalFailures, totalLinkedFailures);
  const unlinkedFailures = Math.max(0, totalFailures - linkedFailures);

  const linkedRate = totalFailures === 0 ? 100 : (linkedFailures / totalFailures) * 100;
  const unlinkedRate = totalFailures === 0 ? 0 : (unlinkedFailures / totalFailures) * 100;

  // State 3: Triage threshold not met (< 80% linked)
  if (linkedRate < 80) {
    return (
      <Flex direction="column" justify="center" align="center" h="100%" minH="220px" px={4} gap={4}>
        <Flex align="center" gap={2} w="full" justify="center">
          <Icon as={FiAlertTriangle} color="status.warning" boxSize={5} />
          <Text fontSize="sm" fontWeight="bold" color="fg">
            Not enough data — {linkedRate.toFixed(1)}% linked.
          </Text>
        </Flex>
        <Text fontSize="xs" color="fg.muted" textAlign="center" maxW="280px" mb={1}>
          Need 80%+ linked failures to calculate quality score. Please triage unlinked failures.
        </Text>
        <ProgressRoot value={linkedRate} max={100} size="sm" w="full" colorPalette="amber">
          <ProgressBar bg="bg.subtle" h="8px" borderRadius="full" />
        </ProgressRoot>
        <Text fontSize="10px" fontWeight="bold" color="status.warning" alignSelf="flex-end">
          {linkedFailures} / {totalFailures} linked
        </Text>
      </Flex>
    );
  }

  // Delta calculation (State 1 vs State 2)
  const hasPrevData = prevFailures > 0 && (prevLinkedFailures / prevFailures) * 100 >= 80;
  const delta = hasPrevData ? currentIWQS - prevIWQS : null;

  // Gauge setup
  const radius = 75;
  const strokeWidth = 12;
  const semiCircumference = Math.PI * radius; // 235.62
  const circumference = 2 * Math.PI * radius; // 471.24
  const strokeDashoffset = semiCircumference - (currentIWQS / 100) * semiCircumference;

  const getGaugeColor = (val: number) => {
    if (val <= 50) return 'var(--chakra-colors-dashboard-red)';
    if (val <= 75) return 'var(--chakra-colors-dashboard-yellow)';
    return 'var(--chakra-colors-dashboard-green)';
  };

  const getUnlinkedColor = (rate: number) => {
    if (rate < 20) return 'fg.muted';
    if (rate < 40) return 'status.warning';
    return 'status.danger';
  };

  const unlinkedColor = getUnlinkedColor(unlinkedRate);

  return (
    <Flex direction="column" align="center" justify="space-between" h="100%" minH="220px" py={1}>
      {/* SVG Arc Gauge */}
      <Box position="relative" w="200px" h="100px" mb={2}>
        <svg width="200px" height="110px" viewBox="0 0 200 110">
          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="var(--chakra-colors-border-muted)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${semiCircumference} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(180 100 100)"
          />
          {/* Active Filled Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke={getGaugeColor(currentIWQS)}
            strokeWidth={strokeWidth}
            strokeDasharray={`${semiCircumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(180 100 100)"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.8s ease' }}
          />
        </svg>

        {/* Score & Delta Centered */}
        <Flex
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          direction="column"
          align="center"
          justify="center"
          pointerEvents="none"
        >
          <Flex align="baseline" gap={2}>
            <Text fontSize="4xl" fontWeight="black" color="fg" lineHeight="1">
              {currentIWQS}%
            </Text>
            {delta !== null && (
              <Box
                px={1.5}
                py={0.5}
                borderRadius="md"
                fontSize="xs"
                fontWeight="black"
                bg={delta > 0 ? 'rgba(31, 230, 71, 0.1)' : delta < 0 ? 'rgba(255, 69, 69, 0.1)' : 'bg.subtle'}
                color={delta > 0 ? 'status.success' : delta < 0 ? 'status.danger' : 'fg.muted'}
                border="1px solid"
                borderColor={
                  delta > 0 ? 'rgba(31, 230, 71, 0.2)' : delta < 0 ? 'rgba(255, 69, 69, 0.2)' : 'border.muted'
                }
              >
                {delta > 0 ? `+${delta}%` : `${delta}%`}
              </Box>
            )}
          </Flex>
          {delta === null && (
            <Text fontSize="9px" fontWeight="bold" color="fg.muted" mt={1}>
              No previous period data
            </Text>
          )}
        </Flex>
      </Box>

      {/* Triage Failure Indicator */}
      <Flex direction="column" align="center" gap={1} w="full" mt="auto">
        <Text fontSize="xs" fontWeight="bold" color={unlinkedColor} textAlign="center">
          {unlinkedRate.toFixed(1)}% failures pending triage
        </Text>
        {unlinkedRate >= 20 && (
          <Text fontSize="9px" fontWeight="semibold" color="fg.muted" textAlign="center">
            {unlinkedFailures} unassigned failure errors
          </Text>
        )}
      </Flex>
    </Flex>
  );
};
