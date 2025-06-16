import { useCallback } from 'react';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { ResultsFilters } from '@/types';

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const today = new Date();
const weekAgo = new Date();
weekAgo.setDate(today.getDate() - 7);

export interface ResultsState {
  filters: ResultsFilters;
}

const initialFilters: ResultsFilters = {
  tag: '',
  specId: '',
  specFile: '',
  specName: '',
  environment: '',
  type: '',
  status: 'failed',
  reviewStatus: '',
  errorMessage: '',
  issueName: '',
  from: formatDate(weekAgo),
  to: formatDate(today),
  page: 1,
};

const initialState: ResultsState = {
  filters: initialFilters,
};

export const resultsSlice = createSlice({
  name: 'results',
  initialState: initialState,
  reducers: {
    reset: () => initialState,
    setFilters: (state, action: PayloadAction<Partial<ResultsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const useResultsActions = () => {
  const dispatch = useAppDispatch();

  return {
    setFilters: useCallback(
      (filters: Partial<ResultsFilters>) => {
        dispatch(resultsSlice.actions.setFilters(filters));
      },
      [dispatch],
    ),
  };
};

export const useResultsFilters = () => useAppSelector((state) => state.results.filters);

export default resultsSlice.reducer;
