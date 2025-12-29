import { HStack, Mark, Text, VStack } from '@chakra-ui/react';
import { LuPencil, LuTrendingUp } from 'react-icons/lu';
import { format, isToday, isYesterday } from 'date-fns';

import { IssueTimeDiscributionChart } from '@/components/charts';
import { useManageIssueDrawer } from '@/components/drawers';
import { getIssueCategoryStyle, ISSUE_CATEGORY_LABELS } from '@/utils';
import { IssueWithStats } from '@/types';

interface IssueCardProps {
  issue: IssueWithStats;
}

export const IssueCard = ({ issue }: IssueCardProps) => {
  const { Icon, color } = getIssueCategoryStyle(issue.category);

  const openManageIssueDrawer = useManageIssueDrawer();

  return (
    <HStack
      align="stretch"
      gap={0}
      w="100%"
      bg="gray.50"
      border="1px solid"
      borderColor="gray.300"
      borderRadius="md"
      shadow="md"
      py={2}
      px={4}
    >
      <VStack align="flex-start" gap={1} me={4}>
        <HStack onClick={() => openManageIssueDrawer({ issue })} cursor="pointer" _hover={{ color: 'gray.600' }}>
          <Text fontWeight={600}>{issue.name}</Text>
          <LuPencil size={16} />
        </HStack>
        <HStack color={color}>
          <Text textStyle="sm">
            <Mark fontWeight={500} color="black">
              Category:
            </Mark>{' '}
            {ISSUE_CATEGORY_LABELS[issue.category]}
          </Text>
          <Icon size={16} />
        </HStack>
        <Text textStyle="sm">
          <Mark fontWeight={500}>Description:</Mark> {issue.description}
        </Text>
        <Text textStyle="sm">
          <Mark fontWeight={500}>Created At:</Mark> {new Date(issue.createdAt).toLocaleDateString()}
        </Text>
      </VStack>

      <VStack align="flex-start" gap={1} flexShrink={0} borderStart="1px solid" borderColor="gray.300" ps={4} ms="auto">
        <HStack>
          <LuTrendingUp size={16} />
          <Text fontWeight={600}>Statistics</Text>
        </HStack>

        {issue.statistics.occurrenceCount > 0 ? (
          <>
            <Text textStyle="sm">
              Occurrence Count: <Mark fontWeight={600}>{issue.statistics.occurrenceCount}</Mark>
            </Text>
            <Text textStyle="sm">
              First Occurrence: <Mark fontWeight={600}>{formatOccurrence(issue.statistics.firstOccurrence)}</Mark>
            </Text>
            <Text textStyle="sm">
              Last Occurrence: <Mark fontWeight={600}>{formatOccurrence(issue.statistics.lastOccurrence)}</Mark>
            </Text>
            <Text textStyle="sm">
              Impacted Tests Count: <Mark fontWeight={600}>{issue.statistics.impactedTestsCount}</Mark>
            </Text>
          </>
        ) : (
          <Text textStyle="sm">No statistics available</Text>
        )}
      </VStack>

      {issue.statistics.occurrenceCount > 0 && (
        <IssueTimeDiscributionChart data={issue.statistics.timeDistribution} color={color} />
      )}
    </HStack>
  );
};

const formatOccurrence = (date: string | null) => {
  if (!date) return 'N/A';

  const dateObj = new Date(date);

  if (isToday(dateObj)) return 'Today';
  if (isYesterday(dateObj)) return 'Yesterday';

  return format(dateObj, 'MMM d');
};
