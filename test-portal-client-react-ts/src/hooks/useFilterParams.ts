import { useState } from 'react';

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const today = new Date();
const weekAgo = new Date();
weekAgo.setDate(today.getDate() - 7);

export interface FilterParamsState {
  tag: string;
  specId: string;
  specFile: string;
  specName: string;
  environment: string;
  type: string;
  status: string;
  reviewStatus: string;
  errorMessage: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  page: number;
}

const initialFilterParams: FilterParamsState = {
  tag: '',
  specId: '',
  specFile: '',
  specName: '',
  environment: '',
  type: '',
  status: 'failed',
  reviewStatus: '',
  errorMessage: '',
  from: formatDate(weekAgo),
  to: formatDate(today),
  page: 1,
};

export const useFilterParams = () => {
  const [filterParams, setFilterParams] =
    useState<FilterParamsState>(initialFilterParams);

  // Example of a specific updater function you might add:
  // const updateStatus = (newStatus: string) => {
  //   setFilterParams(prev => ({ ...prev, status: newStatus, page: 1 })); // Reset page on filter change
  // };

  return { filterParams, setFilterParams, initialFilterParams };
};
