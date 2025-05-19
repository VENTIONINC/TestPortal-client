// Placeholder types - we'll define these more accurately later, possibly from models.ts
type Spec = any;
type Execution = any;
type Result = any;
type ResultRecord = {
  spec: Spec;
  execution: Execution;
  executionId: string | number;
  // ... other properties of resultRecord
  [key: string]: any; // Allow other properties
};

export function groupResults(
  resultRecords: ResultRecord[]
): Map<
  string | number,
  {
    spec: Spec;
    executions: Map<
      string | number,
      { execution: Execution; results: Result[] }
    >;
  }
> {
  const groupedBySpecs = new Map<
    string | number,
    {
      spec: Spec;
      executions: Map<
        string | number,
        { execution: Execution; results: Result[] }
      >;
    }
  >();

  for (const resultRecord of resultRecords) {
    const { spec, execution, ...result } = resultRecord; // result will contain remaining properties
    const specId = resultRecord.spec.id; // Assuming spec has an 'id'

    if (!groupedBySpecs.has(specId)) {
      groupedBySpecs.set(specId, {
        spec,
        executions: new Map<
          string | number,
          { execution: Execution; results: Result[] }
        >(),
      });
    }

    const group = groupedBySpecs.get(specId)!; // Using non-null assertion as we know it's set
    const executionId = resultRecord.executionId;

    if (!group.executions.has(executionId)) {
      group.executions.set(executionId, {
        execution,
        results: [],
      });
    }

    const executionGroup = group.executions.get(executionId)!; // Using non-null assertion
    executionGroup.results.push(result as Result); // Explicitly cast result if its type is different
  }

  return groupedBySpecs;
}

export function groupBySpecs(
  resultsParams: ResultRecord[]
): Record<
  string | number,
  {
    spec: Spec;
    executions: Record<
      string | number,
      { execution: Execution; results: Result[] }
    >;
  }
> {
  const groupedBySpecs: Record<
    string | number,
    {
      spec: Spec;
      executions: Record<
        string | number,
        { execution: Execution; results: Result[] }
      >;
    }
  > = {};

  // Changed parameter name from 'results' to 'resultsParams' to avoid conflict with 'result' variable inside loop
  for (const resultRecord of resultsParams) {
    const { spec, execution, ...result } = resultRecord; // result will contain remaining properties
    const specId = spec.id; // Assuming spec has an 'id'

    if (!groupedBySpecs[specId]) {
      groupedBySpecs[specId] = {
        spec,
        executions: {},
      };
    }

    const group = groupedBySpecs[specId];
    // Corrected to use resultRecord.executionId, assuming executionId is a direct property of the input records
    const executionId = resultRecord.executionId;

    if (!group.executions[executionId]) {
      group.executions[executionId] = {
        execution,
        results: [],
      };
    }

    const executionGroup = group.executions[executionId];
    executionGroup.results.push(result as Result); // Explicitly cast
  }

  return groupedBySpecs;
}
