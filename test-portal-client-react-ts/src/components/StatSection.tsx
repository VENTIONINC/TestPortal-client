import React, { useMemo } from 'react';
import type { ModelledResultRecord } from '../utils/toModels';
import type { Issue, ResultError } from '../utils/models'; // Corrected import for Issue and ResultError
// Confirming imports for Spec, Execution, Result, Assumption from models.ts might be needed if direct properties of these classes are accessed beyond what ModelledResultRecord exposes.
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
  byIssueCategories: { [issueCategory: string]: number }; // Svelte had this, ensure type for issue.category
  // durations: Array<{ specId: string | number; duration: number }>; // Svelte had this, not used in template
}

interface StatSectionProps {
  specGroups: ModelledResultRecord[];
}

const StatSection: React.FC<StatSectionProps> = ({ specGroups }) => {
  const stats: StatsData = useMemo(() => {
    const specMap = new Map<string | number, any>();
    const executionMap = new Map<string | number, any>();
    const errorMap = new Map<string | number, ResultError>(); // Store full error to access message
    const assumptionMap = new Map<string | number, any>();
    const resultMap = new Map<string | number, any>();
    const issueMap = new Map<string | number, Issue>(); // Store full issue for name/category

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
      // durations: [],
    };

    if (!specGroups) return newStats; // Guard against undefined or null specGroups

    for (const model of specGroups) {
      const { spec, execution, result, assumptions, errors } = model;

      if (result.status) {
        newStats.byStatus[result.status] =
          (newStats.byStatus[result.status] || 0) + 1;
      }
      // if (result.duration) { newStats.durations.push({ specId: spec.id, duration: result.duration }); }

      if (!specMap.has(spec.id)) specMap.set(spec.id, spec);
      if (!executionMap.has(execution.id))
        executionMap.set(execution.id, execution);
      if (!resultMap.has(result.id)) resultMap.set(result.id, result);

      assumptions?.forEach((assumption) => {
        // Assuming assumption has an id. The svelte code used assumption.id
        // The ModelledResultRecord types assumption as Assumption & { issue?: Issue }
        // Assumption class in models.ts is generic. Let's assume it has an 'id' or use a different unique key.
        // For now, let's use a simple counter or index if id is not guaranteed for assumption itself.
        // However, svelte code implies assumption.id existed.
        // Let's assume `assumption.id` from `assumptionData` in Svelte refers to a unique identifier for the assumption itself.
        // Our current Assumption class is `[key: string]: any;`. This might need refinement.
        // If assumption.id is not reliable, this count might be off.
        const assumptionKey =
          (assumption as any).id || Math.random().toString(); // Fallback if no id
        if (!assumptionMap.has(assumptionKey))
          assumptionMap.set(assumptionKey, assumption);

        if (assumption.issue) {
          const issue = assumption.issue;
          if (!issueMap.has(issue.id)) issueMap.set(issue.id, issue);

          const issueName = (issue as any).name || 'Unknown Issue Name';
          newStats.byIssueNames[issueName] =
            (newStats.byIssueNames[issueName] || 0) + 1;

          const issueCategory = (issue as any).category || 'Unknown Category';
          newStats.byIssueCategories[issueCategory] =
            (newStats.byIssueCategories[issueCategory] || 0) + 1;
        }
      });

      errors?.forEach((error) => {
        // Assuming error.id for uniqueness as in Svelte.
        // ResultError class in models.ts is generic. `error.message` is used.
        const errorKey = (error as any).id || error.message; // Fallback if no id
        if (!errorMap.has(errorKey)) errorMap.set(errorKey, error);

        const errorMessage = error.message || 'Unknown Error';
        newStats.byErrors[errorMessage] =
          (newStats.byErrors[errorMessage] || 0) + 1;
      });
    }

    newStats.byModels.specs = specMap.size;
    newStats.byModels.results = resultMap.size;
    newStats.byModels.executions = executionMap.size;
    newStats.byModels.issues = issueMap.size;
    newStats.byModels.errors = errorMap.size; // This counts unique errors by ID/message
    newStats.byModels.assumptions = assumptionMap.size;

    return newStats;
  }, [specGroups]);

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

  if (!specGroups || specGroups.length === 0) {
    return (
      <div className="stat-section-empty">
        No active results to display stats for.
      </div>
    );
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
                  {errorMsg.length > MAX_MESSAGE_LENGTH
                    ? `${errorMsg.slice(0, MAX_MESSAGE_LENGTH)}...`
                    : errorMsg}
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
                  {issueName.length > MAX_MESSAGE_LENGTH
                    ? `${issueName.slice(0, MAX_MESSAGE_LENGTH)}...`
                    : issueName}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </details>
  );
};

export default StatSection;
