import {
  Assumption,
  Execution,
  Issue,
  Result,
  ResultError,
  Spec,
} from './models';
import type { ApiResult } from '../services/api'; // Import the refined ApiResult

// Define the structure of the transformed record
export interface ModelledResultRecord {
  result: Result;
  spec: Spec;
  execution: Execution;
  errors: ResultError[];
  assumptions: Array<Assumption & { issue?: Issue }>; // Assumption instances with an optional attached Issue
}

export const toModels = (apiResults: ApiResult[]): ModelledResultRecord[] => {
  const specsMap = new Map<string | number, Spec>();
  const executionsMap = new Map<string | number, Execution>();
  const issuesMap = new Map<string | number, Issue>();

  const modelsList: ModelledResultRecord[] = [];

  for (const record of apiResults) {
    const {
      spec: rawSpec,
      execution: rawExecution,
      errors: rawErrors,
      ...resultData
    } = record;

    let specInstance = specsMap.get(rawSpec.id);
    if (!specInstance) {
      specInstance = new Spec(rawSpec);
      specsMap.set(rawSpec.id, specInstance);
    }

    let executionInstance = executionsMap.get(rawExecution.id);
    if (!executionInstance) {
      executionInstance = new Execution(rawExecution);
      executionsMap.set(rawExecution.id, executionInstance);
    }

    // Ensure resultData has at least startTime, or provide a default/handle error
    // For now, assuming resultData will conform to ResultData requirements from models.ts
    const resultInstance = new Result(resultData as any); // Cast for now, ensure ResultData is compatible

    const modelledRecord: ModelledResultRecord = {
      result: resultInstance,
      spec: specInstance,
      execution: executionInstance,
      errors: [],
      assumptions: [],
    };

    if (rawErrors && rawErrors.length) {
      for (const error of rawErrors) {
        const { assumptions: rawAssumptions, ...resultErrorData } = error;
        modelledRecord.errors.push(new ResultError(resultErrorData));

        if (rawAssumptions && rawAssumptions.length) {
          for (const assumption of rawAssumptions) {
            const { issue: rawIssue, ...assumptionData } = assumption;

            let issueInstance = issuesMap.get(rawIssue.id);
            if (!issueInstance && rawIssue && rawIssue.id) {
              // Check rawIssue and id existence
              issueInstance = new Issue(rawIssue);
              issuesMap.set(rawIssue.id, issueInstance);
            }

            const assumptionInstance = new Assumption(assumptionData);
            if (issueInstance) {
              assumptionInstance.issue = issueInstance; // Attach issue directly
            }
            modelledRecord.assumptions.push(
              assumptionInstance as Assumption & { issue?: Issue }
            );
          }
        }
      }
    }
    modelsList.push(modelledRecord);
  }
  return modelsList;
};
