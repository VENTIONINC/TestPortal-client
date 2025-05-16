import { writable } from 'svelte/store';

// Load saved filters from localStorage or set defaults
const savedIssueFilters = JSON.parse(localStorage.getItem('issueFilters')) || {
    // Spec Filters
    tag: '',
    specId: '',
    specFile: '',
    specName: '',

    // Execution Filters
    environment: '',
    type: '',

    // Issue Filters
    category: '',
    name: '',
    fromDate: '',
    toDate: '',

    // Pagination
    page: 1,
};

// Writable store with saved or default values
export const issueFilters = writable(savedIssueFilters);

// Persist filters automatically to localStorage
issueFilters.subscribe((value) => {
    localStorage.setItem('issueFilters', JSON.stringify(value));
});