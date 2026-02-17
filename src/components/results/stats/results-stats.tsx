import { memo, useState } from 'react';
import {
  Collapsible,
  HStack,
  Spinner,
  Grid,
  GridItem,
  Flex,
  Text,
  VStack,
  Box,
  Separator,
  Tag,
} from '@chakra-ui/react';
import { LuArrowBigRight } from 'react-icons/lu';
import { useDebounce } from 'use-debounce';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

import { Wrap } from '@/components/ui';
import { useGetApiV2ResultsStatsQuery } from '@/redux/apis/generatedApi';
import { useResultsActions, useSelectedDates } from '@/redux/slices/results';
import { useSelectedProjectId } from '@/redux/slices/projects';
import { useResultsSurfaceColors } from '@/components/results/useResultsSurfaceColors';
import { getIssueCategoryStyle, getResultStatusStyle } from '@/utils';
import { IssueCategory, ResultStatus } from '@/types';

const configInfo = [
  {
    label: 'Specs',
    key: 'specs',
  },
  {
    label: 'Results',
    key: 'results',
  },
  {
    label: 'Executions',
    key: 'executions',
  },
  {
    label: 'Issues',
    key: 'issues',
  },
  {
    label: 'Errors',
    key: 'errors',
  },
  {
    label: 'Assumptions',
    key: 'assumptions',
  },
];

export const ResultsStats = memo(() => {
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const selectedDates = useSelectedDates();
  const selectedProjectId = useSelectedProjectId();

  const { updateFilters } = useResultsActions();

  const [debouncedDates] = useDebounce(selectedDates, 200);
  const { data: statistics, isFetching } = useGetApiV2ResultsStatsQuery({
    dates: debouncedDates,
    projectId: selectedProjectId!,
  });

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

      <Grid bg="bg.section" p={4} borderRadius="xl" templateColumns="repeat(2, minmax(0, 1fr))" gap={4} mt={2}>
        <GridItem colSpan={1}>
          <Box bg="bg.cardSecondary" p={1} border="1px solid" borderColor={stats.cardBorder} borderRadius="md">
            {/* <Collapsible.Root onOpenChange={() => setIsStatsOpen(!isStatsOpen)}>
        <Collapsible.Trigger asChild>
          <HStack flex={1} w="100%" cursor="pointer" _hover={{ bg: stats.triggerHover }} borderRadius="sm">
            <LuArrowBigRight
              size={16}
              style={{
                transform: isStatsOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease-in-out',
              }}
            />

          

            {isFetching && <Spinner size="sm" />}
          </HStack>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <HStack gap={4} textStyle="md" mt={2} ms={2}>
            <Text>Specs: {statistics.entityCounts.specs}</Text>
            <Text>Results: {statistics.entityCounts.results}</Text>
            <Text>Executions: {statistics.entityCounts.executions}</Text>
            <Text>Issues: {statistics.entityCounts.issues}</Text>
            <Text>Errors: {statistics.entityCounts.errors}</Text>
            <Text>Assumptions: {statistics.entityCounts.assumptions}</Text>
          </HStack>

          <HStack align="flex-start" mt={2}>
            {statistics.topIssues.length > 0 && (
              <VStack flex={1} align="stretch">
                <TopSection
                  results={statistics.topIssues}
                  label="issues"
                  onClick={(message) => handleFilterChange('issueName', message)}
                />
                <VStack
                  align="stretch"
                  bg={stats.cardBg}
                  p={2}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={stats.cardBorder}
                >
                  <Text fontWeight={700}>Issue Categories</Text>
                  <HStack>
                    {Object.values(IssueCategory).map((category) => {
                      const { Icon, color, name } = getIssueCategoryStyle(category);

                      return (
                        <HStack
                          key={category}
                          border="1px solid"
                          borderColor={color}
                          borderRadius="md"
                          color={color}
                          px={1}
                        >
                          <Icon size={16} color="currentColor" />
                          <Text textStyle="sm" color={stats.strongText}>
                            {name}
                          </Text>
                        </HStack>
                      );
                    })}
                  </HStack>
                </VStack>
              </VStack>
            )}
          </HStack>
        </Collapsible.Content>
      </Collapsible.Root> */}

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
        </GridItem>
        <GridItem colSpan={1}>
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
        </GridItem>
      </Grid>
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
    <VStack align="stretch" flex={1} mt={4} px="3px">
      {results.map(({ title, count }, index) => (
        <HStack key={title} textStyle="md">
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
