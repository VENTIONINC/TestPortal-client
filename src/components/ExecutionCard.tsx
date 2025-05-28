import { Fragment } from 'react';
import { Flex, HStack, Text, VStack } from '@chakra-ui/react';

import { useResultsErrorDialog } from '@/components/dialogs';
import { toDuration, toStartTime } from '@/utils/date-time.converter';
import { BaseResult, ResultExecution } from '@/types';

import { BulkActions } from './BulkActions';
import { InlineIssue } from './InlineIssue';

interface ExecutionCardProps {
  execution: ResultExecution;
  results: BaseResult[];
  selectedResultsIds: number[];
  onSelectResult: (resultId: number | number[]) => void;
}

export const ExecutionCard = ({ execution, results, selectedResultsIds, onSelectResult }: ExecutionCardProps) => {
  const openResultsErrorDialog = useResultsErrorDialog();

  const toggleSelectAll = () => {
    onSelectResult(results.map(({ id }) => id));
  };

  const toDataDogLink = (execution: ResultExecution, result: BaseResult) => {
    const env = execution.environment;
    const start = new Date(result.startTime).getTime();
    const end = start + result.duration;

    const searchParams = new URLSearchParams({
      query: `env:${env}`,
      agg_m: 'count',
      agg_m_source: 'base',
      agg_t: 'count',
      cols: 'core_service,core_resource_name,log_duration,log_http.method,log_http.status_code',
      fromUser: 'false',
      historicalData: 'true',
      messageDisplay: 'inline',
      query_translation_version: 'v0',
      sort: 'desc',
      sort_by: 'time',
      sort_order: 'asc',
      spanType: 'all',
      storage: 'hot',
      view: 'spans',
      start: start.toString(),
      end: end.toString(),
      paused: 'true',
    });

    return `https://app.datadoghq.com/apm/traces?${searchParams.toString()}`;
  };

  return (
    <VStack align="stretch" p={2} border="1px solid" borderColor="gray.200" borderRadius="md">
      <HStack gap={6} px={2} bg="gray.200" borderRadius="sm">
        <input
          type="checkbox"
          checked={results.every(({ id }) => selectedResultsIds.includes(id))}
          onChange={toggleSelectAll}
        />
        <Text>{execution.environment}</Text>
        <Text>{execution.type}</Text>
        <Text>{execution.name}</Text>
        <Text ms="auto" my={1}>
          Playwright v.{execution.version}
        </Text>

        <BulkActions selectedResults={results.filter(({ id }) => selectedResultsIds.includes(id))} />
      </HStack>

      {results.map((result) => (
        <HStack key={result.id} align="center" gap={4} px={2}>
          <input
            type="checkbox"
            checked={selectedResultsIds.includes(result.id)}
            onChange={() => {
              onSelectResult(result.id);
            }}
          />
          <Flex alignSelf="stretch" w={2} borderRadius="xs" className={result.status} />
          <p># {result.retry}</p>

          {result.allureLink.startsWith('http') ? (
            <a href={result.allureLink} target="_blank" rel="noopener noreferrer">
              Allure
            </a>
          ) : (
            <p>No allure</p>
          )}

          <a href={toDataDogLink(execution, result)} target="_blank" rel="noopener noreferrer">
            DataDog
          </a>
          <p>{toStartTime(result.startTime)}</p>
          <p>{toDuration(result.duration)}</p>

          {result.errors &&
            result.errors.length > 0 &&
            result.errors.map((resultError) => (
              <Fragment key={resultError.id}>
                <Text onClick={() => openResultsErrorDialog(resultError)} cursor="pointer">
                  {resultError.message}
                </Text>
                <InlineIssue resultError={resultError} />
              </Fragment>
            ))}
        </HStack>
      ))}
    </VStack>
  );
};
