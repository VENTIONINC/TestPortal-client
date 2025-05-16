<script>
    import InlineIssue from './inline-issue.svelte';
    import BulkActions from './bulk-actions.svelte';
    import Modal from './modal.svelte';
    import {toDuration, toStartTime} from '../utils/date-time.converter.js';

    let {execution, resultModels} = $props();
    let sortedResults = $derived(resultModels.toSorted((a, b) => a.result.retry - b.result.retry));
    let selectAllExecutions = $state(false);
    let selectedResults = $derived.by(() => {
        return sortedResults.filter(model => model.result.isSelected)
    });
    let showModal = $state(false);

    function toggleModal() {
        showModal = !showModal;
    }

    function toggleSelectAll() {
        selectAllExecutions = !selectAllExecutions;
        for (const model of sortedResults) {
            model.result.isSelected = selectAllExecutions;
        }
    }

    $effect.pre(() => {
        for (const model of sortedResults.values()) {
            model.result.isActive = true;
        }
    })

    function toDataDogLink(execution, result) {
        const env = execution.environment;
        const start = new Date(result.startTime).getTime();
        const end = start + result.duration;

        const searchParams = new URLSearchParams({
            'query': `env:${env}`,
            'agg_m': 'count',
            'agg_m_source': 'base',
            'agg_t': 'count',
            'cols': 'core_service,core_resource_name,log_duration,log_http.method,log_http.status_code',
            'fromUser': 'false',
            'historicalData': 'true',
            'messageDisplay': 'inline',
            'query_translation_version': 'v0',
            'sort': 'desc',
            'sort_by': 'time',
            'sort_order': 'asc',
            'spanType': 'all',
            'storage': 'hot',
            'view': 'spans',
            'start': start.toString(),
            'end': end.toString(),
            'paused': 'true'
        });

        return `https://app.datadoghq.com/apm/traces?${searchParams.toString()}`;
    }
</script>

<div class="card">
    <div class="row execution-info">
        <input type="checkbox" onchange={toggleSelectAll}>
        <p class="col-1">{execution.environment}</p>
        <p class="col-1">{execution.type}</p>
        <p class="col">{execution.name}</p>
        <p class="col-2">Playwright v.{execution.version}</p>

        <BulkActions {selectedResults}/>
    </div>

    {#each sortedResults as {result, errors, assumptions}}
        <div class="row">
            <input type="checkbox" bind:checked={result.isSelected}>
            <p class="status-box {result.status}"></p>
            <p>
                <img src="https://icongr.am/clarity/hashtag.svg?size=10&color=currentColor" alt="hashtag icon" class="icon">
                {result.retry}
            </p>

            {#if result.allureLink.startsWith('http')}
                <a class="col-small" href={result.allureLink} target="_blank">Allure</a>
            {:else}
                <p class="col-small">No allure</p>
            {/if}

            <a class="col-small" href={toDataDogLink(execution, result)} target="_blank">DataDog</a>
            <p class="col-1">{toStartTime(result.startTime)}</p>
            <p class="col-1">{toDuration(result.duration)}</p>

            {#if errors && errors.length}
                {#each errors as resultError}
                    <p class="col" onclick={() => toggleModal()}>{resultError.message}</p>
                    <InlineIssue {resultError} assumptions={assumptions.filter(a => a.resultErrorId === resultError.id)}/>

                    <Modal bind:showModal>
                        {#snippet header()}
                            <h2>Result Error</h2>
                        {/snippet}

                        <pre>{resultError.message}</pre>

                        {#if resultError.callLog?.length}
                            <pre>{resultError.callLog?.join('\n')}</pre>
                        {/if}

                        {#if resultError.callStack?.length}
                            <pre>{resultError.callStack?.join('\n')}</pre>
                        {/if}
                    </Modal>
                {/each}
            {/if}
        </div>
    {/each}
</div>

<style>
    .card {
        margin-block: 1rem;
    }
    .execution-info {
        background: var(--bg-secondary-color);
    }
    .status-box {
        width: 7px;
        border-radius: 2px;
        margin-inline: 1rem;
    }
</style>