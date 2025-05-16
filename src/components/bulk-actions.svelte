<script>
    import tippy from 'tippy.js';
    import 'tippy.js/dist/tippy.css';
    import {Assumption} from '../lib/models.svelte.js';

    const {selectedResults} = $props();
    const unreviewedResults = $derived(selectedResults.filter(({assumptions}) => !assumptions.length));
    const unreviewedCount = $derived(unreviewedResults.length);
    const unconfirmedResults = $derived(selectedResults.filter(({assumptions}) => {
        return assumptions.some(({isConfirmed}) => !isConfirmed)
    }));
    const unconfirmedCount = $derived(unconfirmedResults.length);

    function tooltip(node, fn) {
        $effect(() => {
            const tooltip = tippy(node, fn());

            return tooltip.destroy;
        });
    }

    function toggleSidebar() {
        for (const unreviewedResult of unreviewedResults) {
            for (const error of unreviewedResult.errors) {
                console.log(error.message);
            }
        }
    }

    async function runAutoReview() {
        const errorIds = [];

        for (const model of unreviewedResults) {
            if(model.errors && model.errors.length) {
                for (const error of model.errors) {
                    errorIds.push(error.id);
                }
            }
        }

        const response = await fetch('http://localhost:3001/api/result-errors/bulk-review', {
            method: 'PATCH',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ errorIds }),
        });

        if (!response.ok) {
            throw new Error(`Auto review failed, ${await response.json()}`);
        } else {
            const records = await response.json();

            for (const model of unreviewedResults) {
                const reviewedModel = records.find(r => r.result.id === model.result.id);

                if (reviewedModel) {
                    for (const assumption of reviewedModel.assumptions) {
                        model.assumptions.push(new Assumption(assumption));
                    }
                }
            }
        }
    }

    async function confirmAll() {
        for (const model of unconfirmedResults) {
            for (const assumption of model.assumptions) {
                const response = await fetch(`http://localhost:3001/api/assumptions/${assumption.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        madeBy: 'user',
                        isConfirmed: true
                    })
                });

                if (response.ok) {
                    assumption.isConfirmed = true;
                    assumption.madeBy = 'user';
                }
            }
        }
    }

    async function rejectAll() {
        for (const model of unconfirmedResults) {
            for (const assumption of model.assumptions) {
                const response = await fetch(`http://localhost:3001/api/assumptions/${assumption.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        madeBy: 'user',
                        isConfirmed: false
                    })
                });

                if (response.ok) {
                    model.assumptions.splice(model.assumptions.findIndex(a => a.id === assumption.id), 1);
                    console.log(`rejected assumption #${assumption.id}`);
                }
            }
        }
    }
</script>


{#if selectedResults.length > 1}
    <div class="bulk-section">
        <p class="bulk-title">Bulk actions</p>

        {#if unreviewedCount}
            <button
                    aria-label="aria label"
                    class="auto-review"
                    onclick={runAutoReview}
                    use:tooltip={() => ({
                        content: `Run auto review for ${unreviewedCount} results`,
                        arrow: true,
                    })}
            ></button>

<!--            <button-->
<!--                    aria-label="aria label"-->
<!--                    class="create-issue"-->
<!--                    onclick={toggleSidebar}-->
<!--                    use:tooltip={() => ({-->
<!--                        content: `Assign issue manually to ${unreviewedCount} results`,-->
<!--                        arrow: true,-->
<!--                    })}-->
<!--            ></button>-->
        {/if}

        {#if unconfirmedCount}
            <button
                    aria-label="aria label"
                    class="confirm-issue"
                    onclick={confirmAll}
                    use:tooltip={() => ({
                        content: `Confirm ${unconfirmedCount} assumptions`,
                        arrow: true,
                    })}
            ></button>

            <button
                    aria-label="aria label"
                    class="reject-issue"
                    onclick={rejectAll}
                    use:tooltip={() => ({
                        content: `Reject ${unconfirmedCount} assumptions`,
                        arrow: true,
                    })}
            ></button>
        {/if}
    </div>
{/if}

<style>
    button {
        padding-inline: 1.5rem;
    }
    .bulk-section {
        display: flex;
        justify-content: flex-end;
        border: 1px solid #6e049f;
        border-radius: 4px;
        background: var(--bg-color);
    }
    .bulk-title {
        padding-inline: 1rem;
    }
    .create-issue {
        background: url('https://icongr.am/clarity/add.svg?size=20&color=6e049f') no-repeat left center;
    }
    .auto-review {
        background: url('https://icongr.am/clarity/wand.svg?size=20&color=6e049f') no-repeat left center;
    }
    .confirm-issue {
        background: url('https://icongr.am/clarity/check.svg?size=17&color=03a50e') no-repeat left center;
    }
    .reject-issue {
        background: url('https://icongr.am/clarity/trash.svg?size=17&color=ce1212') no-repeat left center;
    }
</style>