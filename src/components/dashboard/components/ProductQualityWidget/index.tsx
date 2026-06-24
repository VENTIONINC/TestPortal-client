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
import { ProgressBar, ProgressRoot } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui';

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
      <Flex direction="column" justify="center" align="center" h="100%" minH="200px" gap={4}>
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
  let prevRuns = 0;
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
      prevRuns += runs;
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
      <Flex direction="column" justify="center" align="center" h="100%" minH="200px" textAlign="center" gap={3}>
        <Circle size="48px" bg="bg.subtle" border="1px solid" borderColor="border.muted">
          <Icon as={FiInfo} color="fg.muted" boxSize={5} />
        </Circle>
        <Flex direction="column" align="center" gap={1}>
          <Text fontSize="md" fontWeight="bold" color="fg" textAlign="center">
            No test runs
          </Text>
          <Text fontSize="xs" color="fg.muted" textAlign="center">
            No runs found in selected period.
          </Text>
        </Flex>
      </Flex>
    );
  }

  // Linked failures calculations
  const linkedFailures = Math.min(totalFailures, totalLinkedFailures);
  const unlinkedFailures = Math.max(0, totalFailures - linkedFailures);

  const linkedRate = totalFailures === 0 ? 100 : (linkedFailures / totalFailures) * 100;
  const unlinkedRate = totalFailures === 0 ? 0 : (unlinkedFailures / totalFailures) * 100;

  // Delta calculation (State 1 vs State 2)
  const prevLinkedRate = prevFailures === 0 ? 100 : (prevLinkedFailures / prevFailures) * 100;
  const hasPrevData = prevRuns > 0 && prevLinkedRate >= 80;
  const delta = hasPrevData ? currentIWQS - prevIWQS : null;

  // Triage indicator pill styling based on unlinked rate
  let pillBg = 'bg.subtle';
  let pillTextColor = 'fg.muted';
  let pillIconColor = 'fg.muted';
  let isWarningPill = false;

  if (unlinkedRate >= 40) {
    pillBg = 'rgba(239, 68, 68, 0.1)'; // Light red
    pillTextColor = 'status.error.text';
    pillIconColor = 'var(--chakra-colors-status-error-icon)';
    isWarningPill = true;
  } else if (unlinkedRate >= 20) {
    pillBg = 'rgba(245, 158, 11, 0.1)'; // Light amber
    pillTextColor = 'status.warning.text';
    pillIconColor = 'var(--chakra-colors-status-warning-icon)';
    isWarningPill = true;
  }

  // State 3: Triage threshold not met (< 80% linked)
  if (linkedRate < 80) {
    return (
      <Flex direction="column" justify="center" align="center" h="100%" minH="200px" px={4} gap={3.5}>
        <Circle size="48px" bg="rgba(245, 158, 11, 0.1)" border="1px solid" borderColor="orange.200">
          <Icon as={FiAlertTriangle} color="orange.500" boxSize={5} />
        </Circle>
        <Flex direction="column" align="center" gap={1}>
          <Text fontSize="md" fontWeight="bold" color="fg" textAlign="center">
            Not enough data
          </Text>
          <Text fontSize="xs" color="fg.muted" textAlign="center" lineHeight="1.4">
            {linkedRate.toFixed(0)}% of failures linked.
            <br />
            Need 80%+ to show score.
          </Text>
        </Flex>
        <Box w="full" px={4}>
          <ProgressRoot value={linkedRate} max={100} size="sm" w="full" colorPalette="orange">
            <ProgressBar bg="bg.subtle" h="6px" borderRadius="full" />
          </ProgressRoot>
          <Flex justify="space-between" mt={1.5} px={1}>
            <Text fontSize="10px" fontWeight="bold" color="fg.muted">
              {linkedRate.toFixed(0)}% linked
            </Text>
            <Text fontSize="10px" fontWeight="bold" color="fg.muted">
              80% needed
            </Text>
          </Flex>
        </Box>

        {/* Unlinked indicator pill (AC-12) */}
        <Flex justify="center" w="full">
          <Box
            bg={pillBg}
            borderRadius="full"
            px={3.5}
            py={1}
            display="inline-flex"
            alignItems="center"
            gap={2}
            border={isWarningPill ? 'none' : '1px solid'}
            borderColor={isWarningPill ? 'transparent' : 'border.muted'}
          >
            {isWarningPill ? (
              <Icon as={FiAlertTriangle} color={pillIconColor} boxSize="12px" />
            ) : (
              <Circle size="6px" bg={pillIconColor} />
            )}
            <Text fontSize="xs" fontWeight="bold" color={pillTextColor} letterSpacing="tight">
              {unlinkedRate.toFixed(1)}% failures pending triage
            </Text>
          </Box>
        </Flex>
      </Flex>
    );
  }

  // Gauge setup
  const radius = 100;
  const strokeWidth = 12;
  const semiCircumference = Math.PI * radius; // 314.16
  const circumference = 2 * Math.PI * radius; // 628.32
  const strokeDashoffset = semiCircumference - (currentIWQS / 100) * semiCircumference;

  const getGaugeColor = (val: number) => {
    if (val <= 50) return 'var(--chakra-colors-red-500)';
    if (val <= 75) return 'var(--chakra-colors-orange-500)';
    return 'var(--chakra-colors-blue-500)';
  };

  return (
    <Flex direction="column" align="center" justify="center" h="100%" minH="200px" py={1} gap={5}>
      {/* SVG Arc Gauge */}
      <Box position="relative" w="260px" h="125px" mb={2}>
        <svg width="260px" height="125px" viewBox="0 0 260 125">
          {/* Background Track - Rounded single arc */}
          <circle
            cx="130"
            cy="115"
            r={radius}
            fill="transparent"
            stroke="var(--chakra-colors-border-muted)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${semiCircumference} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(180 130 115)"
          />
          {/* Active Filled Arc */}
          {currentIWQS > 0 && (
            <circle
              cx="130"
              cy="115"
              r={radius}
              fill="transparent"
              stroke={getGaugeColor(currentIWQS)}
              strokeWidth={strokeWidth}
              strokeDasharray={`${semiCircumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(180 130 115)"
              style={{ transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.8s ease' }}
            />
          )}
        </svg>

        {/* Score & Delta Centered */}
        <Flex
          position="absolute"
          bottom="10px"
          left="0"
          right="0"
          direction="column"
          align="center"
          justify="center"
          pointerEvents="none"
        >
          <Text fontSize="5xl" fontWeight="black" color="fg" lineHeight="1" mb={1}>
            {currentIWQS}%
          </Text>
          <Flex align="center" gap={1.5}>
            {delta !== null ? (
              <>
                <Badge
                  variant="surface"
                  status={delta > 0 ? 'success' : delta < 0 ? 'error' : 'default'}
                  isCapitalize={false}
                  fontWeight="black"
                  fontSize="xs"
                  px="6px"
                  py="2px"
                >
                  {delta > 0 ? `+${delta}%` : `${delta}%`}
                </Badge>
                <Text fontSize="xs" fontWeight="bold" color="fg.muted">
                  vs prev. period
                </Text>
              </>
            ) : (
              <Text fontSize="xs" fontWeight="bold" color="fg.muted">
                No previous period data
              </Text>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Triage Failure Indicator Pill */}
      <Flex justify="center" w="full">
        <Box
          bg={pillBg}
          borderRadius="full"
          px={3.5}
          py={1}
          display="inline-flex"
          alignItems="center"
          gap={2}
          border={isWarningPill ? 'none' : '1px solid'}
          borderColor={isWarningPill ? 'transparent' : 'border.muted'}
        >
          {isWarningPill ? (
            <Icon as={FiAlertTriangle} color={pillIconColor} boxSize="12px" />
          ) : (
            <Circle size="6px" bg={pillIconColor} />
          )}
          <Text fontSize="xs" fontWeight="bold" color={pillTextColor} letterSpacing="tight">
            {unlinkedRate.toFixed(1)}% failures pending triage
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
};


