export function groupResults(resultRecords) {
    const groupedBySpecs = new Map();

    for (const resultRecord of resultRecords) {
        const {spec, execution, ...result} = resultRecord;
        const specId = resultRecord.spec.id;

        if (!groupedBySpecs.has(specId)) {
            groupedBySpecs.set(specId, {
                spec,
                executions: new Map()
            });
        }

        const group = groupedBySpecs.get(specId);
        const executionId = resultRecord.executionId;

        if (!group.executions.has(executionId)) {
            group.executions.set(executionId, {
                execution,
                results: []
            });
        }

        const executionGroup = group.executions.get(executionId);
        executionGroup.results.push(result);
    }

    return groupedBySpecs;
}

export function groupBySpecs(results) {
    const groupedBySpecs = {};

    for (const resultRecord of results) {
        const {spec, execution, ...result} = resultRecord;
        const specId = spec.id;

        if (!groupedBySpecs[specId]) {
            groupedBySpecs[specId] = {
                spec,
                executions: {}
            };
        }

        const group = groupedBySpecs[specId];
        const executionId = result.executionId;

        if (!group.executions[executionId]) {
            group.executions[executionId] = {
                execution,
                results: []
            };
        }

        const executionGroup = group.executions[executionId];
        executionGroup.results.push(result);
    }

    return groupedBySpecs;
}