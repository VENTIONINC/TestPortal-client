<script>
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import SpecSection from './spec-section.svelte';
    import StatSection from './stat-section.svelte';
    import BulkActions from './bulk-actions.svelte';
    import {toModels} from '../state/toMaps.svelte.js';
    import {getDateRangeMap} from '../state/dateRange.svelte.js';
    import {FilterParams} from '../state/resultFilters.svelte.js';
    import {filterResults} from '../state/filteredResults.svelte.js';

    const {results} = $props();
    let selectAll = $state(false);
    const dateConfigs = $state(getDateRangeMap());
    const resultModels = $state(toModels(results));
    const activeDaysResults = $derived.by(() => {
        return resultModels.filter(({result}) => {
            const dayConfig = dateConfigs.find(config => config.date === result.dateKey);
            return dayConfig?.isActive;
        })
    });
    const filteredResults = $derived(filterResults(activeDaysResults));
    const groups = $derived.by(() => {
        const specMap = filteredResults.reduce((map, model) => {
            const {spec, ...rest} = model;

            if (!map.has(spec)) {
                map.set(spec, []);
            }

            map.get(spec).push(rest);

            return map;
        }, new Map());

        for (const model of resultModels) {
            const {spec, ...rest} = model;

            if (specMap.has(spec)) {
                const config = dateConfigs.find(config => config.date === rest.result.dateKey);

                if (!config.isActive) {
                    specMap.get(spec).push(rest);
                }
            }
        }

        return specMap;
    });
    let selectedResults = $derived.by(() => {
        return Array.from(groups.values()).flat().filter(model => model.result.isSelected);
    });

    let sidebarExpanded = $state(true);
    const sidebarWidth = tweened(250, { duration: 100, easing: cubicOut });
    let totalPages = 1;

    function applyFilters() {
        FilterParams.page = 1;
    }

    function nextPage() {
        if (FilterParams.page < totalPages) {
            FilterParams.page += 1;
        }
    }

    function prevPage() {
        if (FilterParams.page > 1) {
            FilterParams.page -= 1;
        }
    }

    function toggleSidebar() {
        sidebarExpanded = !sidebarExpanded;
        sidebarWidth.set(sidebarExpanded ? 250 : 0); // Collapse to 0px or expand to 300px
    }

    function toggleActive(day) {
        day.isActive = !day.isActive;
    }

    function toggleSelectAll() {
        selectAll = !selectAll;

        for (const group of groups.values()) {
            for (const model of group) {
                if (model.result.isActive) {
                    model.result.isSelected = selectAll;
                }
            }
        }
    }

    // tests
    const shownTotal = $derived(filteredResults.filter(r => r.result.isActive).length);
    const selectedTotal = $derived(filteredResults.filter(r => r.result.isSelected).length);
</script>

<div class="main-container">

    <aside class="sidebar" style="width: {$sidebarWidth}px;">
        {#if sidebarExpanded}
            <div class="filter-group">
                <h3>Result Filters</h3>
                <label>Status:
                    <select bind:value={FilterParams.status} onchange={applyFilters}>
                        <option value="">All</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                        <option value="skipped">Skipped</option>
                    </select>
                </label>

                <label>Review Status:
                    <select bind:value={FilterParams.reviewStatus} onchange={applyFilters}>
                        <option value="">All</option>
                        <option value="completed">Completed</option>
                        <option value="inCompleted">Not Completed</option>
                    </select>
                </label>

                <label>Error Message: <input type="text" bind:value={FilterParams.errorMessage} onchange={applyFilters} /></label>

                <label>From: <input type="date" bind:value={FilterParams.from} onchange={applyFilters} /></label>
                <label>To: <input type="date" bind:value={FilterParams.to} onchange={applyFilters} /></label>
            </div>

            <div class="filter-group">
                <h3>Spec Filters</h3>
                <label>Tags: <input type="text" bind:value={FilterParams.tag} oninput={applyFilters} /></label>
                <label>Spec ID: <input type="text" bind:value={FilterParams.specId} oninput={applyFilters} /></label>
                <label>Spec File: <input type="text" bind:value={FilterParams.specFile} oninput={applyFilters} /></label>
                <label>Spec Name: <input type="text" bind:value={FilterParams.specName} oninput={applyFilters} /></label>
            </div>

            <div class="filter-group">
                <h3>Execution Filters</h3>
                <label>Environment: <input type="text" bind:value={FilterParams.environment} oninput={applyFilters} /></label>
                <label>Type: <input type="text" bind:value={FilterParams.type} oninput={applyFilters} /></label>
            </div>
        {/if}
    </aside>

    <!-- Results Content -->
    <section class="content">
        <div class="card day-stats">
            <div class="row">
                {#each dateConfigs as day}
                    <div class="day-toggle col button {day.isActive ? 'dark' : 'outline'}" onclick={() => toggleActive(day)}>
                        <div>{day.name}</div>
                    </div>
                {/each}
            </div>

            <StatSection specGroups={activeDaysResults}/>
        </div>

        <h2>Results</h2>

        <div class="bulk-panel row">
            <label> <input type="checkbox" onchange={toggleSelectAll}/> Select all </label>
            <pre>Shown {shownTotal}. Selected {selectedTotal}</pre>
            <BulkActions {selectedResults}/>
        </div>

        <div class="results-list">
            {#if groups.size > 0}
                {#each groups.entries() as [spec, results]}
                    <div class="result-card">
                        <SpecSection {spec} {results} {dateConfigs}/>
                    </div>
                {/each}
            {:else}
                <p>No results found.</p>
            {/if}
        </div>

        <!-- Pagination Controls -->
        <div class="pagination">
            <button onclick={prevPage} disabled={FilterParams.page === 1}>Previous</button>
            <span>Page {FilterParams.page} of {totalPages}</span>
            <button onclick={nextPage} disabled={FilterParams.page === totalPages}>Next</button>
        </div>
    </section>

    <!-- Toggle Button (Outside Sidebar) -->
    <button class="toggle-btn" onclick={toggleSidebar}>
        {#if sidebarExpanded} &laquo; Hide Filters {/if}
        {#if !sidebarExpanded} &raquo; Show Filters {/if}
    </button>
</div>

<style>
    .bulk-panel {
        border: 1px solid var(--color-lightGrey);
        border-radius: 4px;
        margin-block: 0.5rem;
    }
    .day-toggle {
        padding: 1rem;
    }
    .day-stats {
        background-color: #f7f7f7;
        margin-bottom: 2rem;
        top: 0;
        position: sticky;
        z-index: 7;
    }

    /* Main Container: Flex Layout */
    .main-container {
        display: flex;
        height: 100vh;
        position: relative; /* For positioning the toggle button */
    }

    /* Sidebar (Filters) */
    .sidebar {
        background-color: #f7f7f7;
        border-right: 1px solid #ddd;
        overflow: hidden;
        transition: width 0.3s ease-in-out;
    }

    .filter-group {
        margin-bottom: 20px;
        padding: 15px;
        border: 1px solid #ccc;
        border-radius: 8px;
        background-color: #fff;
    }

    .filter-group h3 {
        margin-bottom: 10px;
        color: #333;
    }

    label {
        display: block;
        margin-bottom: 10px;
    }

    input, select {
        width: 100%;
        padding: 8px;
        margin-top: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    /* Content Area (Results) */
    .content {
        flex: 1;
        padding: 0 20px 20px;
        overflow-y: auto;
    }

    .results-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .result-card {
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: var(--bg-secondary-color);
    }

    .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* Toggle Button Positioned Outside Sidebar */
    .toggle-btn {
        position: absolute;
        top: 10px;
        left: 20rem;  /* Position relative to sidebar width */
        transform: translateX(-50%);
        background-color: #007bff;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: left 0.3s ease-in-out; /* Smoothly move the button */
    }

    .toggle-btn:hover {
        background-color: #0056b3;
    }
</style>