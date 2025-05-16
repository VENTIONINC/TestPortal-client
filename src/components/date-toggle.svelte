<script>
    let {day, toggleHandler} = $props();
    let statMatrix = $derived.by(() => {
        const max = 3;
        const matrix = [];

        for (let i = 0; i < day.stats.length; i += max) {
            const chunk = day.stats.slice(i, i + max);
            matrix.push(chunk);
        }

        return matrix;
    });
</script>

<div class="day-toggle col button {day.isActive ? 'primary' : 'secondary'}" onclick={() => toggleHandler(day)}>
    <div>{day.display}</div>
    {#each statMatrix as stats}
        <div class="indicator-container">
            {#each stats as status}
                <div class="indicator {status}"></div>
            {/each}
        </div>
    {/each}
</div>

<style>
    .day-toggle {
        display: flex;
        padding: 1rem;
    }
    .indicator-container {
        margin-left: auto;
        background: #ffffff;
        border-radius: 4px;
    }
    .indicator:first-child {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
    }
    .indicator {
        margin: 1px;
        width: 4px;
        height: 4px;
    }
    .indicator:last-child {
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
    }
</style>