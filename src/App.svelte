<script>
  import Issues from './components/issues.svelte';
  import Results from './components/results.svelte';
  import {loadResults} from './state/resultLoader.svelte.js';

  let activeTab = $state('results');

  function switchTab(tab) {
    activeTab = tab;
  }
</script>

<div class="tabs">
  <div class="tab {activeTab === 'results' ? 'active' : ''}" on:click={() => switchTab('results')}>
    Results
  </div>
  <div class="tab {activeTab === 'issues' ? 'active' : ''}" on:click={() => switchTab('issues')}>
    Issues
  </div>
</div>

<div class="content">
  {#if activeTab === 'results'}
    {#await loadResults()}
      <p>....loading</p>
    {:then results}
      <Results {results}/>
    {/await}
  {:else}
    <Issues/>
  {/if}
</div>

<style>
  .tabs {
    display: flex;
  }
  .tab {
    flex: 1;
    padding: 10px;
    text-align: center;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }
  .tab.active {
    border-bottom: 2px solid #007bff;
    color: #007bff;
  }
  .content {
    padding: 20px;
    font-size: 1.2rem;
  }
</style>

