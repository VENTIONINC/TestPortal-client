import { writable } from 'svelte/store';

// Load filters from localStorage if available, else use defaults
const savedFilters = JSON.parse(localStorage.getItem('filters')) || {
    tag: '',
    specId: '',
    specFile: '',
    specName: '',
    environment: '',
    type: '',
    status: '',
    reviewStatus: '',
    fromDate: '',
    toDate: '',
    page: 1
};

// Create writable store with initial filter values
export const filters = writable(savedFilters);

// Subscribe to changes and save to localStorage automatically
filters.subscribe((value) => {
    localStorage.setItem('filters', JSON.stringify(value));
});