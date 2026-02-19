import { memo, useMemo, useState } from 'react';
import { Collapsible, HStack, Flex, Text, VStack, Box, Separator, Tag } from '@chakra-ui/react';
import { useDebounce } from 'use-debounce';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

import { Wrap } from '@/components/ui';
import { useGetApiV2ResultsStatsQuery } from '@/redux/apis/generatedApi';
import { useResultsActions, useSelectedDates } from '@/redux/slices/results';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { useResultsSurfaceColors } from '@/components/results/useResultsSurfaceColors';
import { getResultStatusStyle } from '@/utils';
import { getDatesBetween } from '@/utils/dateUtils';
import { ResultStatus } from '@/types';

import { configInfo } from '../../configs';

interface ResultsStatsProps {
  filter: { from: string; to: string };
}

export const ResultsStats = memo(({ filter }: ResultsStatsProps) => {
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const dateRange = getDatesBetween(filter.from, filter.to);
  const selectedDates = useSelectedDates();
  const selectedProjectId = useSelectedProjectId();

  const { updateFilters } = useResultsActions();

  const activeDates = selectedDates.length > 0 ? selectedDates : dateRange;

  const [debouncedDates] = useDebounce(activeDates, 200);
  const { data: statisticsData } = useGetApiV2ResultsStatsQuery(
    { dates: debouncedDates, projectId: selectedProjectId! },
    { skip: debouncedDates.length === 0 },
  );

  const statistics = debouncedDates.length === 0 ? undefined : statisticsData;
  const handleFilterChange = (name: string, value: string) => {
    updateFilters({ [name]: value });
  };
  const { stats } = useResultsSurfaceColors();

  if (!statistics || statistics.byStatusTotal === 0) {
    return (
      <Text alignSelf="center" color={stats.emptyText}>
        No statistics to display.
      </Text>
    );
  }

  return (
    <>
      <Wrap p="7px 15px">
        <HStack fontWeight={500}>
          <Tag.Root minH="26px" borderRadius="2xl" px={2} bg={`status.textColor/10`} color="text.main">
            <Tag.Label fontSize="xs">Total: {statistics.byStatusTotal}</Tag.Label>
          </Tag.Root>

          {Object.entries(statistics.byStatus).map(([status, count]) => {
            const { Icon, color, title } = getResultStatusStyle(status as ResultStatus);

            return (
              <Tag.Root key={status} bg={`${color}/10`} color="text.main" minH="26px" borderRadius="2xl" px={2}>
                <Tag.StartElement>
                  <Icon size={16} />
                </Tag.StartElement>
                <Tag.Label>
                  {title}: {count}
                </Tag.Label>
              </Tag.Root>
            );
          })}
        </HStack>
        <Separator orientation="vertical" height="28px" borderWidth="1px" borderColor={stats.cardBorder} />
        <HStack gap={4} textStyle="md">
          {configInfo.map(({ label, key }) => (
            <Tag.Root size="md" key={key} bg="transparent">
              <Tag.Label whiteSpace="normal">
                <Text as="span" color="text.secondary">
                  {label}:{' '}
                </Text>
                {statistics.entityCounts[key as keyof typeof statistics.entityCounts]}
              </Tag.Label>
            </Tag.Root>
          ))}
        </HStack>
      </Wrap>
      <Box bg="bg.section" p={4} borderRadius="xl" gap={4} mt={2}>
        <Box bg="bg.cardSecondary" p={1} border="1px solid" borderColor={stats.cardBorder} borderRadius="md" mb={3}>
          {statistics.topErrors.length > 0 && (
            <Collapsible.Root onOpenChange={() => setIsStatsOpen(!isStatsOpen)}>
              <Collapsible.Trigger asChild>
                <Flex align="center" minH="27px" pl="2px">
                  {isStatsOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  <Text fontWeight={500} cursor="pointer" whiteSpace="nowrap" pl="9px" fontSize="lg">
                    Top {statistics.topErrors.length} errors
                  </Text>
                </Flex>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <TopSection
                  results={statistics.topErrors}
                  label="errors"
                  onClick={(message) => handleFilterChange('errorMessage', message)}
                />
              </Collapsible.Content>
            </Collapsible.Root>
          )}
        </Box>

        <Box bg="bg.cardSecondary" p={1} border="1px solid" borderColor={stats.cardBorder} borderRadius="md">
          {statistics.topIssues.length > 0 && (
            <Collapsible.Root onOpenChange={() => setIsStatsOpen(!isStatsOpen)}>
              <Collapsible.Trigger asChild>
                <Flex align="center" minH="27px" pl="2px">
                  {isStatsOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  <Text fontWeight={500} cursor="pointer" whiteSpace="nowrap" pl="9px" fontSize="lg">
                    Top {statistics.topIssues.length} issues
                  </Text>
                </Flex>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <TopSection
                  results={statistics.topIssues}
                  label="issues"
                  onClick={(message) => handleFilterChange('issueName', message)}
                />
              </Collapsible.Content>
            </Collapsible.Root>
          )}
        </Box>
      </Box>
    </>
  );
});

interface TopSectionProps {
  results: { title: string; count: number }[];
  label: string;
  onClick: (message: string) => void;
}

const TopSection = ({ results, label, onClick }: TopSectionProps) => {
  const { stats } = useResultsSurfaceColors();

  return (
    <VStack align="stretch" flex={1} mt={4} px="3px" aria-label={label}>
      {results.map(({ title, count }, index) => (
        <HStack key={`${title}-${index}-${count}`} textStyle="md">
          <Text
            fontWeight={700}
            color={stats.countText}
            borderRadius="40px"
            border="1px solid"
            fontSize="xs"
            borderColor="status.error"
            px="7px"
            // py={1}
            bg="bg.card"
          >
            {count}x
          </Text>
          <Text
            onClick={() => onClick(title)}
            lineClamp={1}
            fontWeight={400}
            cursor="pointer"
            _hover={{ textDecoration: 'underline' }}
            fontSize="sm"
            color={stats.strongText}
          >
            {title}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
};
