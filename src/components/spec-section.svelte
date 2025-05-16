<script>
    import DateToggle from './date-toggle.svelte';
    import ExecutionCard from './execution-card.svelte';
    import {toCleanTitle} from '../utils/date-time.converter.js';

    let {spec, results, dateConfigs} = $props();
    let dateFilters = $derived.by(() => {
        const result = $state((() => {
            return dateConfigs.map((focus) => {
                const statuses = results
                    .filter(({result}) => result.dateKey === focus.date)
                    .map(({result}) => result.status);

                return {
                    yyyy_mm_dd: focus.date,
                    stats: statuses,
                    isActive: focus.isActive,
                    display: focus.name
                };
            });
        })());

        return result;
    });
    let executionsMap = $derived.by(() => {
        return results
            .toSorted((a, b) => new Date(b.result.startTime).getTime() - new Date(a.result.startTime).getTime())
            .reduce((map, record) => {
                const {execution, ...rest} = record;
                const isActiveDayResult = dateFilters
                    .filter(d => d.isActive)
                    .some(d => d.yyyy_mm_dd === rest.result.dateKey);

                if (isActiveDayResult) {
                    if (!map.get(execution)) {
                        map.set(execution, []);
                    }

                    map.get(execution).push(rest);
                }

                return map;
            }, new Map());
    });

    function toggleActive(day) {
        day.isActive = !day.isActive;

        for (const model of results) {
            if (model.result.dateKey === day.yyyy_mm_dd) {
                model.result.isActive = day.isActive;
            }
        }
    }
</script>


<div>
    <div class="row">
        {#each dateFilters as day}
            <DateToggle {day} toggleHandler={toggleActive}/>
        {/each}
    </div>

    <div class="card">
        <div class="row">
            <p class="col-small">{spec.key}</p>
            <p class="col">{spec.file}</p>

            <div class="row">
                {#each spec.tags as tag}
                    <p class="col">
                        <img src="https://icongr.am/clarity/tag.svg?size=10&color=currentColor" alt="tag icon" class="icon">
                        {tag}
                    </p>
                {/each}
            </div>
        </div>

        <div class="row">
            {#if spec.annotations?.length}
                {#each spec.annotations as annotation}
                    {#if annotation.type === 'issue'}
                        <a href="{annotation.description}" target="_blank">
                            <img src="https://icongr.am/clarity/link.svg?size=10&color=currentColor" alt="link icon" class="icon">
                            Jira Issue
                        </a>
                    {/if}
                {/each}
            {/if}

            <p class="col">
                <img src="https://icongr.am/clarity/avatar.svg?size=10&color=currentColor" alt="avatar icon" class="icon">
                {toCleanTitle(spec.title)}
            </p>
        </div>
    </div>

    {#each executionsMap.entries() as [execution, resultModels]}
        <ExecutionCard {execution} {resultModels}/>
    {/each}
</div>


<style>
    .col-small {
        width: 6rem;
    }
</style>