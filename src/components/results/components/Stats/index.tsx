import { memo } from 'react';
import { HStack, Text, Separator, Tag } from '@chakra-ui/react';

import { Wrap } from '@/components/ui';
import { useResultsSurfaceColors } from '@/components/results/useResultsSurfaceColors';
import { type ResultsStats as ResultsStatsResponse } from '@/redux/apis/generatedApi';
import { getResultStatusStyle } from '@/utils';
import { ResultStatus } from '@/types';

import { configInfo } from '../../configs';

interface ResultsStatsProps {
  statistics?: ResultsStatsResponse;
}

export const ResultsStats = memo(({ statistics }: ResultsStatsProps) => {
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
                  {label}:
                </Text>
                {statistics.entityCounts[key as keyof typeof statistics.entityCounts]}
              </Tag.Label>
            </Tag.Root>
          ))}
        </HStack>
      </Wrap>
    </>
  );
});
