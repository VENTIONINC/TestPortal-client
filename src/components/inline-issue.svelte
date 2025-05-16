<script>
    import IssueSidebar from './IssueSidebar.svelte';
    import {Assumption, Issue} from '../lib/models.svelte.js';

    let {resultError, assumptions} = $props();
    let showSidebar = $state(false);

    function toggleSidebar() {
        showSidebar = !showSidebar;
    }

    async function confirm(assumption, isConfirmed) {
        const response = await fetch(`http://localhost:3001/api/assumptions/${assumption.id}`, {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                madeBy: 'user',
                isConfirmed: isConfirmed
            })
        });

        if (response.status === 204) {
            assumption = null;
        }

        if (response.status === 200) {
            await response.json();
        }
    }

    async function createAssumption(issue) {
        if (!issue) {
            throw new Error('Unable to create assumption with no linked issue');
        }

        if(!issue.id) {
            const issueResponse = await fetch(`http://localhost:3001/api/issues`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(issue),
            });

            if (!issueResponse.ok) {
                throw new Error(`Cant post new issue ${issueResponse.status}`);
            }

            issue = await issueResponse.json();
        }

        const assumptionResponse = await fetch('http://localhost:3001/api/assumptions', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                madeBy: 'user',
                score: 1,
                isConfirmed: true,
                issueId: issue.id,
                resultErrorId: resultError.id
            }),
        });

        if (!assumptionResponse.ok) {
            throw new Error(`Cant post new assumption ${assumptionResponse.statusText}`)
        }

        const assumptionRecord = await assumptionResponse.json();

        if (assumptionRecord) {
            assumptionRecord.issue = new Issue(issue);
            assumptions.push(new Assumption(assumptionRecord));
            toggleSidebar();
        } else {
            console.error('Failed to assign issue');
        }
    }
</script>

{#if assumptions && assumptions.length}
    {#each assumptions as assumption}
        <div class="assumption-row col">
            {#if assumption && assumption.issue}
                <p class="col">{assumption.issue.name}</p>
            {/if}

            {#if assumption && !assumption.isConfirmed}
                <p>{Math.round(assumption.score * 100)}%</p>
                <button class="confirm-issue" onclick={() => confirm(assumption, true)}></button>
                <button class="reject-issue" onclick={() => confirm(assumption, false)}></button>
            {:else}
                <button class="edit-issue" onclick={toggleSidebar}></button>
            {/if}
        </div>
    {/each}
{:else}
    <button class="create-issue" onclick={toggleSidebar}></button>
    {#if showSidebar}
        <IssueSidebar {resultError} {toggleSidebar} {createAssumption}/>
    {/if}
{/if}

<style>
    button {
        padding-inline: 1.5rem;
    }
    .assumption-row {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 1rem;
        margin-inline: 1rem;
        border: 1px dashed #5bdd97;
        border-radius: 5px;
    }
    .create-issue {
        background: url('https://icongr.am/clarity/add.svg?size=20&color=currentColor') no-repeat left center;
    }
    .edit-issue {
        background: url('https://icongr.am/clarity/edit.svg?size=20&color=currentColor') no-repeat left center;
    }
    .confirm-issue {
        background: url('https://icongr.am/clarity/check.svg?size=17&color=03a50e') no-repeat left center;
    }
    .reject-issue {
        background: url('https://icongr.am/clarity/trash.svg?size=17&color=ce1212') no-repeat left center;
    }
</style>