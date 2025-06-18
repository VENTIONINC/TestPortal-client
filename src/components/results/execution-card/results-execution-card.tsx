import { Fragment, memo } from 'react';
import { Flex, HStack, Link, Text, VStack } from '@chakra-ui/react';

import { Checkbox, ClipboardCopyText } from '@/components/ui';
import { InlineIssue } from '@/components/issues';
import { useResultsErrorDialog } from '@/components/dialogs';
import { useResultsSelection } from '@/contexts/results-selection';
import { getResultStatusStyle } from '@/utils';
import { toDuration, toStartTime } from '@/utils/date-time.converter';
import { BaseResult, ResultExecution } from '@/types';

import { BulkActions } from '../../BulkActions';

interface ResultsExecutionCardProps {
  execution: ResultExecution;
  results: BaseResult[];
}

export const ResultsExecutionCard = memo(({ execution, results }: ResultsExecutionCardProps) => {
  const { isSelected, toggleSelection, toggleMultiple, getSelectedIds } = useResultsSelection();

  const openResultsErrorDialog = useResultsErrorDialog();

  const toggleSelectAll = () => {
    toggleMultiple(results.map(({ id }) => id));
  };

  const selectedResults = results.filter(({ id }) => getSelectedIds().includes(id));

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
    <VStack align="stretch" p={2} bg="white" border="1px solid" borderColor="gray.200" borderRadius="md">
      <HStack gap={6} px={2} bg="gray.200" borderRadius="sm" textStyle="sm" minH={8}>
        <Checkbox
          checked={results.every(({ id }) => isSelected(id))}
          onCheckedChange={toggleSelectAll}
          size="sm"
          controlProps={{ borderColor: 'black' }}
        />
        <ClipboardCopyText value={execution.environment}>{execution.environment}</ClipboardCopyText>
        <ClipboardCopyText value={execution.type}>{execution.type}</ClipboardCopyText>
        <Text>{execution.name}</Text>
        <Text ms="auto" my={1}>
          Playwright v.{execution.version}
        </Text>

        <BulkActions selectedResults={selectedResults} />
      </HStack>

      {results.map((result) => (
        <HStack key={result.id} align="center" gap={4} ps={2} textStyle="sm">
          <Checkbox
            checked={isSelected(result.id)}
            onCheckedChange={() => {
              toggleSelection(result.id);
            }}
            size="sm"
            controlProps={{ borderColor: 'black' }}
          />
          <Flex w={2} h={4} borderRadius="xs" bg={getResultStatusStyle(result.status).color} />
          <Text whiteSpace="nowrap" minW={6}>
            # {result.retry}
          </Text>

          {result.allureLink.startsWith('http') ? (
            <Link href={result.allureLink} target="_blank" rel="noopener noreferrer" color="blue.600">
              Allure
            </Link>
          ) : (
            <Text>No allure</Text>
          )}

          <Link href={toDataDogLink(execution, result)} target="_blank" rel="noopener noreferrer" color="blue.600">
            DataDog
          </Link>
          <Text>{toStartTime(result.startTime)}</Text>
          <Text>{toDuration(result.duration)}</Text>

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
});
