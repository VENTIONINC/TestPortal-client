<script>
    import { onMount } from 'svelte';
    import { issueFilters } from '../state/issueFilters.js';
    import { get } from 'svelte/store';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    let issues = [];
    let totalPages = 1;
    let sidebarExpanded = true;
    const sidebarWidth = tweened(300, { duration: 300, easing: cubicOut }); // Sidebar transition

    // Load issues based on filters
    async function loadIssues() {
        const currentFilters = get(issueFilters);

        const queryParams = new URLSearchParams({
            tag: currentFilters.tag,
            specId: currentFilters.specId,
            specFile: currentFilters.specFile,
            specName: currentFilters.specName,
            environment: currentFilters.environment,
            type: currentFilters.type,
            category: currentFilters.category,
            name: currentFilters.name,
            from: currentFilters.fromDate,
            to: currentFilters.toDate,
            page: currentFilters.page,
            limit: 10,
        });

        const res = await fetch(`http://localhost:3001/api/issues?${queryParams}`);
        const data = await res.json();
        issues = data.issues;
        totalPages = data.totalPages;
    }

    onMount(() => {
        loadIssues();
    });

    // Apply filters and reset to the first page
    function applyFilters(updatedFilters) {
        issueFilters.update(current => ({
            ...current,
            ...updatedFilters,
            page: 1
        }));
        loadIssues();
    }

    // Pagination Controls
    function nextPage() {
        issueFilters.update(current => {
            if (current.page < totalPages) current.page += 1;
            return current;
        });
        loadIssues();
    }

    function prevPage() {
        issueFilters.update(current => {
            if (current.page > 1) current.page -= 1;
            return current;
        });
        loadIssues();
    }

    // Toggle Sidebar
    function toggleSidebar() {
        sidebarExpanded = !sidebarExpanded;
        sidebarWidth.set(sidebarExpanded ? 300 : 0);
    }
</script>

<!-- Main Layout: Sidebar + Content -->
<div class="main-container">
    <!-- Collapsible Sidebar -->
    <aside class="sidebar" style="width: {$sidebarWidth}px;">
        {#if sidebarExpanded}
            <!-- Spec Filters Group -->
            <div class="filter-group">
                <h3>Spec Filters</h3>
                <label>Tags: <input type="text" bind:value={$issueFilters.tag} on:input={() => applyFilters({ tag: $issueFilters.tag })} /></label>
                <label>Spec ID: <input type="number" bind:value={$issueFilters.specId} on:input={() => applyFilters({ specId: $issueFilters.specId })} /></label>
                <label>Spec File: <input type="text" bind:value={$issueFilters.specFile} on:input={() => applyFilters({ specFile: $issueFilters.specFile })} /></label>
                <label>Spec Name: <input type="text" bind:value={$issueFilters.specName} on:input={() => applyFilters({ specName: $issueFilters.specName })} /></label>
            </div>

            <!-- Execution Filters Group -->
            <div class="filter-group">
                <h3>Execution Filters</h3>
                <label>Environment: <input type="text" bind:value={$issueFilters.environment} on:input={() => applyFilters({ environment: $issueFilters.environment })} /></label>
                <label>Type: <input type="text" bind:value={$issueFilters.type} on:input={() => applyFilters({ type: $issueFilters.type })} /></label>
            </div>

            <!-- Issue Filters Group -->
            <div class="filter-group">
                <h3>Issue Filters</h3>
                <label>Category:
                    <select bind:value={$issueFilters.category} on:change={() => applyFilters({ category: $issueFilters.category })}>
                        <option value="">All</option>
                        <option value="Bug">Bug</option>
                        <option value="Improvement">Improvement</option>
                        <option value="Task">Task</option>
                    </select>
                </label>

                <label>Name:
                    <input type="text" bind:value={$issueFilters.name} on:input={() => applyFilters({ name: $issueFilters.name })} />
                </label>

                <label>From:
                    <input type="date" bind:value={$issueFilters.fromDate} on:change={() => applyFilters({ fromDate: $issueFilters.fromDate })} />
                </label>

                <label>To:
                    <input type="date" bind:value={$issueFilters.toDate} on:change={() => applyFilters({ toDate: $issueFilters.toDate })} />
                </label>
            </div>
        {/if}
    </aside>

    <!-- Issues Content Area -->
    <section class="content">
        <h2>Issues</h2>
        <div class="issues-list">
            {#if issues.length > 0}
                {#each issues as issue}
                    <div class="issue-card">
                        <h3>{issue.name}</h3>
                        <p><strong>Category:</strong> {issue.category}</p>
                        <p><strong>Description:</strong> {issue.description}</p>
                        <p><strong>Created At:</strong> {new Date(issue.createdAt).toLocaleDateString()}</p>
                    </div>
                {/each}
            {:else}
                <p>No issues found.</p>
            {/if}
        </div>

        <!-- Pagination Controls -->
        <div class="pagination">
            <button on:click={prevPage} disabled={$issueFilters.page === 1}>Previous</button>
            <span>Page {$issueFilters.page} of {totalPages}</span>
            <button on:click={nextPage} disabled={$issueFilters.page === totalPages}>Next</button>
        </div>
    </section>

    <!-- Toggle Sidebar Button -->
    <button class="toggle-btn" on:click={toggleSidebar}>
        {#if sidebarExpanded} &laquo; Hide Filters {/if}
        {#if !sidebarExpanded} &raquo; Show Filters {/if}
    </button>
</div>

<style>
    .main-container {
        display: flex;
        height: 100vh;
        position: relative;
    }

    .sidebar {
        background-color: #f7f7f7;
        border-right: 1px solid #ddd;
        overflow: hidden;
        transition: width 0.3s ease-in-out;
    }

    .filter-group {
        padding: 15px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        margin: 20px;
    }

    .filter-group h3 {
        margin-bottom: 10px;
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

    .content {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
    }

    .issues-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .issue-card {
        padding: 15px;
        background-color: #fafafa;
        border: 1px solid #ddd;
        border-radius: 5px;
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

    .toggle-btn {
        position: absolute;
        top: 10px;
        left: 20rem;
        transform: translateX(-50%);
        background-color: #007bff;
        color: white;
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: left 0.3s ease-in-out;
    }

    .toggle-btn:hover {
        background-color: #0056b3;
    }
</style>