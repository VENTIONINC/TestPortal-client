import { useState, useEffect, Fragment } from 'react';
import { HStack, Text } from '@chakra-ui/react';

import { useResultsErrorDialog } from '@/components/dialogs';
import type { Execution, Result } from '../utils/models';
import type { ModelledResultRecord } from '../utils/toModels';
import { toDuration, toStartTime } from '../utils/date-time.converter';
import BulkActions from './BulkActions';

import '../styles/ExecutionCard.css';
import { InlineIssue } from './InlineIssue';

interface ExecutionCardProps {
  execution: Execution;
  resultModels: ModelledResultRecord[];
}

const ExecutionCard = ({ execution, resultModels }: ExecutionCardProps) => {
  const [sortedResults, setSortedResults] = useState<ModelledResultRecord[]>([]);
  const [selectAllExecutions, setSelectAllExecutions] = useState(false);

  // Sort results by retry
  useEffect(() => {
    setSortedResults([...resultModels].sort((a, b) => a.result.retry - b.result.retry));
  }, [resultModels]);

  useEffect(() => {
    for (const model of sortedResults) {
      model.result.isActive = true;
    }
  }, [sortedResults]);

  const openResultsErrorDialog = useResultsErrorDialog();

  const selectedResults = sortedResults.filter((model) => model.result.isSelected);

  const toggleSelectAll = () => {
    const newSelectAll = !selectAllExecutions;
    setSelectAllExecutions(newSelectAll);

    // Update all result models
    sortedResults.forEach((model) => {
      model.result.isSelected = newSelectAll;
    });
  };

  const toDataDogLink = (execution: Execution, result: Result) => {
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

  const handleResultUpdate = (updatedRecords: ModelledResultRecord[]) => {
    // Update the sorted results with the updated records
    updatedRecords.forEach((updatedRecord) => {
      const index = sortedResults.findIndex((r) => r.result.id === updatedRecord.result.id);
      if (index !== -1) {
        sortedResults[index] = updatedRecord;
      }
    });

    // Force a re-render
    setSortedResults([...sortedResults]);
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

        <BulkActions selectedResults={selectedResults} onResultsUpdate={handleResultUpdate} />
      </HStack>

      {sortedResults.map((model) => (
        <div className="execution-result" key={model.result.id}>
          <input
            type="checkbox"
            checked={model.result.isSelected}
            onChange={() => {
              model.result.isSelected = !model.result.isSelected;
              setSortedResults([...sortedResults]); // Force re-render
            }}
          />
          <p className={`status-box ${model.result.status}`}></p>
          <p># {model.result.retry}</p>

          {model.result.allureLink.startsWith('http') ? (
            <a href={model.result.allureLink} target="_blank" rel="noopener noreferrer">
              Allure
            </a>
          ) : (
            <p>No allure</p>
          )}

          <a href={toDataDogLink(execution, model.result)} target="_blank" rel="noopener noreferrer">
            DataDog
          </a>
          <p>{toStartTime(model.result.startTime)}</p>
          <p>{toDuration(model.result.duration)}</p>

          {model.errors &&
            model.errors.length > 0 &&
            model.errors.map((resultError) => (
              <Fragment key={resultError.id}>
                <Text onClick={() => openResultsErrorDialog(resultError)} cursor="pointer">
                  {resultError.message}
                </Text>
                <InlineIssue
                  resultError={resultError}
                  assumptions={model.assumptions.filter((a) => a.resultErrorId === resultError.id)}
                />
              </Fragment>
            ))}
        </div>
      ))}
    </div>
  );
};

export default ExecutionCard;
