<script>
    const MAX_MESSAGE_LENGTH = 100;

    let {specGroups} = $props();
    let stats = $derived.by(() => {
        const specMap = new Map();
        const executionMap = new Map();
        const errorMap = new Map();
        const assumptionMap = new Map();
        const resultMap = new Map();
        const issueMap = new Map();

        const totals = {
            byStatus: {
                passed: 0,
                failed: 0,
                skipped: 0,
                timedOut: 0
            },
            byModels: {},
            byErrors: {},
            byIssueNames: {},
            byIssueCategories: {},
            byUnconfirmedAssumptions: {}
        };

        const durations = [];

        for (const model of specGroups) {
            const {spec, execution, result, assumptions, errors} = model;

            totals.byStatus[result.status] += 1;
            durations.push({
                specId: spec.id,
                duration: result.duration
            });

            if (!specMap.has(spec.id)) {
                specMap.set(spec.id, spec);
            }

            if (!executionMap.has(execution.id)) {
                executionMap.set(execution.id, execution);
            }

            if (!resultMap.has(result.id)) {
                resultMap.set(result.id, result);
            }

            if (assumptions && assumptions.length) {
                for (const assumption of assumptions) {
                    const {issue, ...assumptionData} = assumption;

                    if (!assumptionMap.has(assumption.id)) {
                        assumptionMap.set(assumption.id, assumptionData);
                    }

                    if (!issueMap.has(issue.id)) {
                        issueMap.set(issue.id, issue);
                    }

                    if (!totals.byIssueNames[issue.name]) {
                        totals.byIssueNames[issue.name] = 1;
                    } else {
                        totals.byIssueNames[issue.name] += 1;
                    }

                    if (!totals.byIssueCategories[issue.category]) {
                        totals.byIssueCategories[issue.category] = 1;
                    } else {
                        totals.byIssueCategories[issue.category] += 1;
                    }
                }
            }

            if (errors && errors.length) {
                for (const error of errors) {
                    if (!errorMap.has(error.id)) {
                        errorMap.set(error.id, error);

                        if (!totals.byErrors[error.message]) {
                            totals.byErrors[error.message] = 1;
                        } else {
                            totals.byErrors[error.message] += 1;
                        }
                    }
                }
            }
        }

        totals.byModels.specs = specMap.size;
        totals.byModels.results = resultMap.size;
        totals.byModels.executions = executionMap.size;
        totals.byModels.issues = issueMap.size;
        totals.byModels.errors = errorMap.size;
        totals.byModels.assumptions = assumptionMap.size;

        return totals;
    });
    let topErrors = $derived.by(() => {
        return Object.entries(stats.byErrors)
            .toSorted((a, b) => b[1] - a[1])
            .slice(0, 10);
    });
    let topIssues = $derived.by(() => {
        return Object.entries(stats.byIssueNames)
            .toSorted((a, b) => b[1] - a[1])
            .slice(0, 10);
    })

    function toSummary() {
        return Object.entries(stats.byStatus).map(([key, value]) => `Total ${key}: ${value}`).join(' | ');
    }

</script>

<details>
    <summary>{toSummary()}</summary>

    <div class="by-models">
        <p>Specs: {stats.byModels.specs}</p>
        <p>Results: {stats.byModels.results}</p>
        <p>Executions: {stats.byModels.executions}</p>
        <p>Issues: {stats.byModels.issues}</p>
        <p>Errors: {stats.byModels.errors}</p>
        <p>Assumptions: {stats.byModels.assumptions}</p>
    </div>

    <div class="top">
        {#if topErrors.length}
            <div class="top-errors">
                <p> <b>Top {topErrors.length} errors</b> </p>
                {#each topErrors as [error, count]}
                    <div class="top-stat">
                        <p>{count}x</p>
                        {#if error.length > MAX_MESSAGE_LENGTH}
                            <p>{error.slice(0, MAX_MESSAGE_LENGTH)}...</p>
                        {:else}
                            <p>{error}</p>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}

        {#if topIssues.length}
            <div class="top-issues">
                <p> <b>Top {topIssues.length} issues</b> </p>
                {#each topIssues as [issue, count]}
                    <div class="top-stat">
                        <p>{count}x</p>
                        {#if issue.length > MAX_MESSAGE_LENGTH}
                            <p>{issue.slice(0, MAX_MESSAGE_LENGTH)}...</p>
                        {:else}
                            <p>{issue}</p>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>

</details>

<style>
    .top {
        display: flex;
        gap: 1rem;
    }
    .by-models {
        display: flex;
        margin: 1rem;
        gap: 1rem;
    }
    .top-stat {
        display: flex;
        gap: 1rem;
    }
</style>