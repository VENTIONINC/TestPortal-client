import { useMemo } from 'react';

import { Result, ResultSpec, ResultExecution, ResultErrorAssumption, ResultError, Issue } from '@/types';

import '../styles/StatSection.css';

const MAX_MESSAGE_LENGTH = 100;

interface StatsData {
  byStatus: {
    passed: number;
    failed: number;
    skipped: number;
    timedOut: number;
    [key: string]: number; // For other statuses if any
  };
  byModels: {
    specs: number;
    results: number;
    executions: number;
    issues: number;
    errors: number;
    assumptions: number;
  };
  byErrors: { [errorMessage: string]: number };
  byIssueNames: { [issueName: string]: number };
  byIssueCategories: { [issueCategory: string]: number };
}

interface StatSectionProps {
  results: Result[];
}

export const StatSection = ({ results }: StatSectionProps) => {
  const stats: StatsData = useMemo(() => {
    const specMap = new Map<string | number, ResultSpec>();
    const executionMap = new Map<string | number, ResultExecution>();
    const errorMap = new Map<string | number, ResultError>();
    const assumptionMap = new Map<string | number, ResultErrorAssumption>();
    const resultMap = new Map<string | number, Result>();
    const issueMap = new Map<string | number, Issue>();

    const newStats: StatsData = {
      byStatus: { passed: 0, failed: 0, skipped: 0, timedOut: 0 },
      byModels: {
        specs: 0,
        results: 0,
        executions: 0,
        issues: 0,
        errors: 0,
        assumptions: 0,
      },
      byErrors: {},
      byIssueNames: {},
      byIssueCategories: {},
    };

    if (!results) return newStats;

    for (const result of results) {
      if (result.status) {
        newStats.byStatus[result.status] = (newStats.byStatus[result.status] || 0) + 1;
      }

      if (!specMap.has(result.spec.id)) specMap.set(result.spec.id, result.spec);
      if (!executionMap.has(result.execution.id)) executionMap.set(result.execution.id, result.execution);
      if (!resultMap.has(result.id)) resultMap.set(result.id, result);

      result.errors?.forEach((error) => {
        const errorKey = error.id || error.message;
        if (!errorMap.has(errorKey)) errorMap.set(errorKey, error);

        const errorMessage = error.message || 'Unknown Error';
        newStats.byErrors[errorMessage] = (newStats.byErrors[errorMessage] || 0) + 1;

        error.assumptions?.forEach((assumption) => {
          const assumptionKey = assumption.id || Math.random().toString();
          if (!assumptionMap.has(assumptionKey)) assumptionMap.set(assumptionKey, assumption);

          if (assumption.issue) {
            const issue = assumption.issue;
            if (!issueMap.has(issue.id)) issueMap.set(issue.id, issue);

            const issueName = issue.name || 'Unknown Issue Name';
            newStats.byIssueNames[issueName] = (newStats.byIssueNames[issueName] || 0) + 1;

            const issueCategory = issue.category || 'Unknown Category';
            newStats.byIssueCategories[issueCategory] = (newStats.byIssueCategories[issueCategory] || 0) + 1;
          }
        });
      });
    }

    newStats.byModels.specs = specMap.size;
    newStats.byModels.results = resultMap.size;
    newStats.byModels.executions = executionMap.size;
    newStats.byModels.issues = issueMap.size;
    newStats.byModels.errors = errorMap.size;
    newStats.byModels.assumptions = assumptionMap.size;

    return newStats;
  }, [results]);

  const topErrors = useMemo(() => {
    return Object.entries(stats.byErrors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [stats.byErrors]);

  const topIssues = useMemo(() => {
    return Object.entries(stats.byIssueNames)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [stats.byIssueNames]);

  const summaryText = useMemo(() => {
    return Object.entries(stats.byStatus)
      .map(([key, value]) => `Total ${key}: ${value}`)
      .join(' | ');
  }, [stats.byStatus]);

  if (!results || results.length === 0) {
    return <div className="stat-section-empty">No active results to display stats for.</div>;
  }

  return (
    <details className="stat-section-details">
      <summary>{summaryText}</summary>

      <div className="by-models">
        <p>
          Specs: <span>{stats.byModels.specs}</span>
        </p>
        <p>
          Results: <span>{stats.byModels.results}</span>
        </p>
        <p>
          Executions: <span>{stats.byModels.executions}</span>
        </p>
        <p>
          Issues: <span>{stats.byModels.issues}</span>
        </p>
        <p>
          Errors: <span>{stats.byModels.errors}</span>
        </p>
        <p>
          Assumptions: <span>{stats.byModels.assumptions}</span>
        </p>
      </div>

      <div className="top-stats-container">
        {topErrors.length > 0 && (
          <div className="top-errors">
            <p>
              <b>Top {topErrors.length} errors</b>
            </p>
            {topErrors.map(([errorMsg, count]) => (
              <div key={errorMsg} className="top-stat-item">
                <p className="count">{count}x</p>
                <p className="message">
                  {errorMsg.length > MAX_MESSAGE_LENGTH ? `${errorMsg.slice(0, MAX_MESSAGE_LENGTH)}...` : errorMsg}
                </p>
              </div>
            ))}
          </div>
        )}

        {topIssues.length > 0 && (
          <div className="top-issues">
            <p>
              <b>Top {topIssues.length} issues</b>
            </p>
            {topIssues.map(([issueName, count]) => (
              <div key={issueName} className="top-stat-item">
                <p className="count">{count}x</p>
                <p className="message">
                  {issueName.length > MAX_MESSAGE_LENGTH ? `${issueName.slice(0, MAX_MESSAGE_LENGTH)}...` : issueName}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </details>
  );
};
