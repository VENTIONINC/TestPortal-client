import {SvelteMap} from 'svelte/reactivity';
import {Assumption, Execution, Issue, Result, ResultError, Spec} from '../lib/models.svelte.js';

export const toModels = (results) => {
    const specsMap = new SvelteMap();
    const executionsMap = new SvelteMap();
    const issuesMap = new SvelteMap();

    const modelsList = [];

    for (const record of results) {
        const resultRecord = {};
        const {spec, execution, errors, ...resultData} = record;

        if (!specsMap.has(spec.id)) {
            specsMap.set(spec.id, new Spec(spec));
        }

        if (!executionsMap.has(execution.id)) {
            executionsMap.set(execution.id, new Execution(execution));
        }

        resultRecord.result = new Result(resultData);
        resultRecord.spec = specsMap.get(spec.id);
        resultRecord.execution = executionsMap.get(execution.id);
        resultRecord.errors = [];
        resultRecord.assumptions = [];

        if (errors && errors.length) {
            for (const error of errors) {
                const {assumptions, ...resultError} = error;

                resultRecord.errors.push(new ResultError(resultError));

                if (assumptions && assumptions.length) {
                    for (const assumption of assumptions) {
                        const {issue, ...assumptionData} = assumption;
                        const assumptionRecord = new Assumption(assumptionData);

                        if (!issuesMap.has(issue.id)) {
                            issuesMap.set(issue.id, new Issue(issue));
                        }

                        assumptionRecord.issue = issuesMap.get(issue.id);
                        resultRecord.assumptions.push(assumptionRecord);
                    }
                }
            }
        }

        modelsList.push(resultRecord);
    }

    return modelsList;
}