import { useState, Fragment } from 'react';
import { HStack, Text } from '@chakra-ui/react';

import { useResultsErrorDialog } from '@/components/dialogs';
import { BaseResult, ResultExecution } from '@/types';
import { toDuration, toStartTime } from '../utils/date-time.converter';
import BulkActions from './BulkActions';

import '../styles/ExecutionCard.css';
import { InlineIssue } from './InlineIssue';

interface ExecutionCardProps {
  execution: ResultExecution;
  results: BaseResult[];
  selectedResultsIds: number[];
  onSelectResult: (resultId: number) => void;
}

const ExecutionCard = ({ execution, results, selectedResultsIds, onSelectResult }: ExecutionCardProps) => {
  const [selectAllExecutions, setSelectAllExecutions] = useState(false);

  const openResultsErrorDialog = useResultsErrorDialog();

  const toggleSelectAll = () => {
    const newSelectAll = !selectAllExecutions;
    setSelectAllExecutions(newSelectAll);
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
    <div className="execution-card">
      <HStack gap={6} px={2} bg="gray.200">
        <input type="checkbox" onChange={toggleSelectAll} checked={selectAllExecutions} />
        <Text>{execution.environment}</Text>
        <Text>{execution.type}</Text>
        <Text>{execution.name}</Text>
        <Text ms="auto" my={1}>
          Playwright v.{execution.version}
        </Text>

        <BulkActions selectedResults={results.filter(({ id }) => selectedResultsIds.includes(id))} />
      </HStack>

      {results.map((result) => (
        <div className="execution-result" key={result.id}>
          <input
            type="checkbox"
            checked={selectedResultsIds.includes(result.id)}
            onChange={() => {
              onSelectResult(result.id);
            }}
          />
          <p className={`status-box ${result.status}`}></p>
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
        </div>
      ))}
    </div>
  );
};

export default ExecutionCard;
