// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { memo, useMemo, useState, useEffect } from 'react';
import { HStack, Text, Flex, Card, Box, IconButton, Tag } from '@chakra-ui/react';
import { LuPencil, LuDot } from 'react-icons/lu';
import dayjs from 'dayjs';
import { useIntersectionObserver } from 'usehooks-ts';

import { IssueTimeDiscributionChart } from '@/components/ui/components/Charts';
import { Wrap, Skeleton } from '@/components/ui';
import { useFilterContext } from '@/contexts/FilterContext';
import { useManageIssueDrawer } from '@/components/drawers';
import { getIssueCategoryStyle, ISSUE_CATEGORY_LABELS } from '@/utils';
import { IssueWithStats } from '@/types';

interface IssueCardProps {
  issue: IssueWithStats;
}

export const IssueCard = memo(({ issue }: IssueCardProps) => {
  const { Icon, color } = getIssueCategoryStyle(issue.category);

  const openManageIssueDrawer = useManageIssueDrawer();

  const { statistics } = issue ?? {};
  const { firstOccurrence, impactedTestsCount, lastOccurrence, occurrenceCount } = statistics ?? {};

  const renderInfoSection = useMemo(
    () => (
      <Box
        as="ul"
        w="100%"
        fontSize="xs"
        listStyleType="none"
        m={0}
        p={0}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <Box as="li" display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <Text as="span" fontWeight={500} color="text.secondary">
            Occurrence count
          </Text>
          <Text as="span" fontWeight={400} color="text.main">
            {occurrenceCount}
          </Text>
        </Box>
        <Box as="li" display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <Text as="span" fontWeight={500} color="text.secondary">
            First seen
          </Text>
          <Text as="span" fontWeight={400} color="text.main">
            {formatOccurrence(firstOccurrence)}
          </Text>
        </Box>
        <Box as="li" display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <Text as="span" fontWeight={500} color="text.secondary">
            Last seen
          </Text>
          <Text as="span" fontWeight={400} color="text.main">
            {formatOccurrence(lastOccurrence)}
          </Text>
        </Box>
        <Box as="li" display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <Text as="span" fontWeight={500} color="text.secondary">
            Impacted tests
          </Text>
          <Text as="span" fontWeight={400} color="text.main">
            {impactedTestsCount}
          </Text>
        </Box>
      </Box>
    ),
    [occurrenceCount, firstOccurrence, lastOccurrence, impactedTestsCount],
  );

  return (
    <Card.Root w="100%" minW={0} bg="bg.section">
      <Card.Header p="2px 8px 7px 7px">
        <HStack align="stretch" w="100%" minH="37px" alignItems="center" justifyContent="space-between">
          <Flex>
            <Text fontWeight={600} color="text.main" pr={2}>
              {issue.name}
            </Text>
            <IconButton
              minW={4}
              h={4}
              fontSize={1}
              mt={1}
              size="xs"
              variant="ghost"
              onClick={() => openManageIssueDrawer({ issue })}
              aria-label="Manage issue"
            >
              <LuPencil size={16} />
            </IconButton>
          </Flex>
          <Flex align="center">
            <Tag.Root
              color={color}
              bg="transparent"
              border="1px solid"
              borderColor={color}
              borderRadius="full"
              size="sm"
              p="4px 8px"
            >
              <Tag.StartElement>
                <Icon size={16} />
              </Tag.StartElement>
              <Tag.Label fontWeight={500} color="category.text">
                {ISSUE_CATEGORY_LABELS[issue.category]}
              </Tag.Label>
            </Tag.Root>

            <LuDot size={16} color="text.secondary" />
            <Text fontSize="xs" color="text.secondary">
              Created on: {dayjs(issue.createdAt).format('MMM D, YYYY')}
            </Text>
          </Flex>
        </HStack>

        <Text fontSize="xs" w="60%">
          {issue.description}
        </Text>
      </Card.Header>

      <Card.Body p="9px 8px">
        <Box
          display="grid"
          gridTemplateColumns={occurrenceCount > 0 ? '1.04fr 1.96fr' : '1fr'}
          gap="8px"
          alignItems="start"
          minW={0}
          mt="auto"
        >
          <Wrap w="100%" bg="bg.cardSecondary" borderRadius="xl" p="13px 7px 11px 7px" boxShadow="none">
            {renderInfoSection}
          </Wrap>
          {occurrenceCount > 0 && <IssueChartWrapper issue={issue} color={color} />}
        </Box>
      </Card.Body>
    </Card.Root>
  );
});

// A wrapper component to defer rendering of the heavy chart
const IssueChartWrapper = memo(({ issue, color }: { issue: IssueWithStats; color: string }) => {
  const { isTransitioning } = useFilterContext();
  const [hasRendered, setHasRendered] = useState(false);
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0,
    rootMargin: '200px', // Render slightly before coming into view
  });

  useEffect(() => {
    if (isIntersecting && !hasRendered) {
      setHasRendered(true);
    }
  }, [isIntersecting, hasRendered]);

  return (
    <Box ref={ref} w="100%" h="100%" minW={0} bg="bg.cardSecondary" p="4px 7px 6px 3px" borderRadius="xl">
      {hasRendered && !isTransitioning ? (
        <IssueTimeDiscributionChart data={issue.statistics.timeDistribution} color={color} />
      ) : (
        <Skeleton w="100%" h="100%" minH="120px" borderRadius="md" />
      )}
    </Box>
  );
});

const formatOccurrence = (date: string | null) => {
  if (!date) return 'N/A';

  const parsed = dayjs(date);

  if (parsed.isSame(dayjs(), 'day')) return 'Today';
  if (parsed.isSame(dayjs().subtract(1, 'day'), 'day')) return 'Yesterday';

  return parsed.format('MMM D');
};
