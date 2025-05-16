import {SvelteURLSearchParams} from 'svelte/reactivity';
import {FilterParams} from './resultFilters.svelte.js';

export const loadResults = async () => {
    const queryParams = new SvelteURLSearchParams({
        from: FilterParams.from,
        to: FilterParams.to
    });
    const response = await fetch(`http://localhost:3001/api/results?${queryParams}`);

    if(!response.ok) {
        throw new Error(`Unable to load results, ${response.status} ${JSON.stringify(await response.json(), null, 4)}`);
    }

    const {results} = await response.json();

    return results;
}

export const results = $state(await loadResults());
