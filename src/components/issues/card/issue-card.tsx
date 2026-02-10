import { memo, useMemo } from 'react';
import { HStack, Text, Flex, Card, Box, IconButton, Tag } from '@chakra-ui/react';
import { LuPencil } from 'react-icons/lu';
import dayjs from 'dayjs';

import { IssueTimeDiscributionChart } from '@/components/charts';
import { Tooltip, Wrap } from '@/components/ui';
import { useManageIssueDrawer } from '@/components/drawers';
import { getIssueCategoryStyle, ISSUE_CATEGORY_LABELS } from '@/utils';
import { IssueWithStats } from '@/types';
import { useSurfaceColors } from '@/theme';

interface IssueCardProps {
  issue: IssueWithStats;
}

export const IssueCard = memo(({ issue }: IssueCardProps) => {
  const { Icon, color } = getIssueCategoryStyle(issue.category);
  const { text } = useSurfaceColors();

  const openManageIssueDrawer = useManageIssueDrawer();

  const { statistics } = issue ?? {};
  const { firstOccurrence, impactedTestsCount, lastOccurrence, occurrenceCount } = statistics ?? {};

  const renderInfoSection = useMemo(
    () => (
      <Box as="ul" w="100%" listStyleType="none" m={0} p={0} display="flex" flexDirection="column" gap={2}>
        <Box as="li" display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <Text as="span">Occurrence count</Text>
          <Text as="span">{occurrenceCount}</Text>
        </Box>
        <Box as="li" display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <Text as="span">First seen</Text>
          <Text as="span">{formatOccurrence(firstOccurrence)}</Text>
        </Box>
        <Box as="li" display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <Text as="span">Last seen</Text>
          <Text as="span">{formatOccurrence(lastOccurrence)}</Text>
        </Box>
        <Box as="li" display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <Text as="span">Impacted tests</Text>
          <Text as="span">{impactedTestsCount}</Text>
        </Box>
      </Box>
    ),
    [occurrenceCount, firstOccurrence, lastOccurrence, impactedTestsCount],
  );

  return (
    <Card.Root w="100%" minW={0}>
      <Card.Header p="6px 8px">
        <HStack align="stretch" w="100%" justifyContent="space-between">
          <Flex>
            <Text fontWeight={600} color={text.primary}>
              {issue.name}
            </Text>
            <IconButton size="xs" variant="ghost" onClick={() => openManageIssueDrawer()} aria-label="Manage issue">
              <LuPencil size={16} />
            </IconButton>
          </Flex>
          <Flex align="center">
            <Tag.Root>
              <Tag.StartElement>
                <Icon size={16} />
              </Tag.StartElement>
              <Tag.Label>{ISSUE_CATEGORY_LABELS[issue.category]}</Tag.Label>
            </Tag.Root>

            <Text fontSize="xs">Created on: {dayjs(issue.createdAt).format('MMM D, YYYY')}</Text>
          </Flex>
        </HStack>
        <Tooltip
          content={issue.description}
          positioning={{ placement: 'top-start', strategy: 'absolute' }}
          interactive
          closeOnScroll={false}
          openDelay={0}
          closeDelay={100}
          disabled={!issue.description}
        >
          <Text fontSize="xs" lineClamp={1}>
            {issue.description}
          </Text>
        </Tooltip>
      </Card.Header>

      <Card.Body>
        <Box
          display="grid"
          gridTemplateColumns={occurrenceCount > 0 ? '1.2fr 1.8fr' : '1fr'}
          gap={4}
          alignItems="start"
          minW={0}
          mt="auto"
        >
          <Wrap w="100%">{renderInfoSection}</Wrap>
          {occurrenceCount > 0 && (
            <Box w="100%" h="100%" minW={0} bg="bg.cardSecondary">
              <IssueTimeDiscributionChart data={issue.statistics.timeDistribution} color={color} />
            </Box>
          )}
        </Box>
      </Card.Body>
    </Card.Root>
  );
});

const formatOccurrence = (date: string | null) => {
  if (!date) return 'N/A';

  const parsed = dayjs(date);

  if (parsed.isSame(dayjs(), 'day')) return 'Today';
  if (parsed.isSame(dayjs().subtract(1, 'day'), 'day')) return 'Yesterday';

  return parsed.format('MMM D');
};
