import { useState, useEffect } from "react";
import { Text } from "@chakra-ui/react";

import type { Execution, Result, ResultError } from "../utils/models";
import type { ModelledResultRecord } from "../utils/toModels";
import { toDuration, toStartTime } from "../utils/date-time.converter";
import BulkActions from "./BulkActions";
import { ResultsErrorDialog } from "./dialogs";

import "../styles/ExecutionCard.css";

// Will need to create these components
// import InlineIssue from './InlineIssue';

interface ExecutionCardProps {
  execution: Execution;
  resultModels: ModelledResultRecord[];
}

const ExecutionCard = ({ execution, resultModels }: ExecutionCardProps) => {
  const [sortedResults, setSortedResults] = useState<ModelledResultRecord[]>(
    []
  );
  const [selectAllExecutions, setSelectAllExecutions] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedResultError, setSelectedResultError] =
    useState<ResultError | null>(null);

  // Sort results by retry
  useEffect(() => {
    setSortedResults(
      [...resultModels].sort((a, b) => a.result.retry - b.result.retry)
    );
  }, [resultModels]);

  useEffect(() => {
    for (const model of sortedResults) {
      model.result.isActive = true;
    }
  }, [sortedResults]);

  const selectedResults = sortedResults.filter(
    (model) => model.result.isSelected
  );

  const toggleDialog = (resultError: ResultError | null = null) => {
    setSelectedResultError(resultError);
    setShowDialog(!showDialog);
  };

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
      agg_m: "count",
      agg_m_source: "base",
      agg_t: "count",
      cols: "core_service,core_resource_name,log_duration,log_http.method,log_http.status_code",
      fromUser: "false",
      historicalData: "true",
      messageDisplay: "inline",
      query_translation_version: "v0",
      sort: "desc",
      sort_by: "time",
      sort_order: "asc",
      spanType: "all",
      storage: "hot",
      view: "spans",
      start: start.toString(),
      end: end.toString(),
      paused: "true",
    });

    return `https://app.datadoghq.com/apm/traces?${searchParams.toString()}`;
  };

  const handleResultUpdate = (updatedRecords: ModelledResultRecord[]) => {
    // Update the sorted results with the updated records
    updatedRecords.forEach((updatedRecord) => {
      const index = sortedResults.findIndex(
        (r) => r.result.id === updatedRecord.result.id
      );
      if (index !== -1) {
        sortedResults[index] = updatedRecord;
      }
    });

    // Force a re-render
    setSortedResults([...sortedResults]);
  };

  return (
    <div className="execution-card">
      <div className="execution-info">
        <input
          type="checkbox"
          onChange={toggleSelectAll}
          checked={selectAllExecutions}
        />
        <p>{execution.environment}</p>
        <p>{execution.type}</p>
        <p>{execution.name}</p>
        <p>Playwright v.{execution.version}</p>

        <BulkActions
          selectedResults={selectedResults}
          onResultsUpdate={handleResultUpdate}
        />
      </div>

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

          {model.result.allureLink.startsWith("http") ? (
            <a
              href={model.result.allureLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Allure
            </a>
          ) : (
            <p>No allure</p>
          )}

          <a
            href={toDataDogLink(execution, model.result)}
            target="_blank"
            rel="noopener noreferrer"
          >
            DataDog
          </a>
          <p>{toStartTime(model.result.startTime)}</p>
          <p>{toDuration(model.result.duration)}</p>

          {model.errors &&
            model.errors.length > 0 &&
            model.errors.map((resultError) => (
              <Text
                key={resultError.id}
                onClick={() => toggleDialog(resultError)}
                cursor="pointer"
              >
                {resultError.message}
                {/* InlineIssue component will need to be created */}
                {/* <InlineIssue 
                resultError={resultError} 
                assumptions={model.assumptions.filter(a => a.resultErrorId === resultError.id)} 
              /> */}
              </Text>
            ))}
        </div>
      ))}

      <ResultsErrorDialog
        open={showDialog}
        onClose={toggleDialog}
        title="Results Error"
        resultError={selectedResultError}
      />
    </div>
  );
};

export default ExecutionCard;
