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
  selectedDates: string[];
}

export const initialFilters: ResultsFilters = {
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
  selectedDates: [initialFilters.to],
};

export const resultsSlice = createSlice({
  name: 'results',
  initialState: initialState,
  reducers: {
    reset: () => initialState,
    updateFilters: (state, action: PayloadAction<Partial<ResultsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setSelectedDates: (state, action: PayloadAction<string[]>) => {
      state.selectedDates = action.payload;
    },
    toggleDate: (state, action: PayloadAction<string>) => {
      const date = action.payload;
      if (state.selectedDates.includes(date)) {
        state.selectedDates = state.selectedDates.filter((d) => d !== date);
      } else {
        state.selectedDates = [...state.selectedDates, date];
      }
    },
    clearFilterGroup: (state, action: PayloadAction<(keyof ResultsFilters)[]>) => {
      const filtersToClear = action.payload;
      const filtersToReset = Object.fromEntries(filtersToClear.map((key) => [key, initialFilters[key]]));
      state.filters = { ...state.filters, ...filtersToReset, page: 1 };
    },
  },
});

export const useResultsActions = () => {
  const dispatch = useAppDispatch();

  return {
    updateFilters: useCallback(
      (filters: Partial<ResultsFilters>) => {
        dispatch(resultsSlice.actions.updateFilters(filters));
      },
      [dispatch],
    ),
    setSelectedDates: useCallback(
      (dates: string[]) => {
        dispatch(resultsSlice.actions.setSelectedDates(dates));
      },
      [dispatch],
    ),
    toggleDate: useCallback(
      (date: string) => {
        dispatch(resultsSlice.actions.toggleDate(date));
      },
      [dispatch],
    ),
    clearFilterGroup: useCallback(
      (filters: (keyof ResultsFilters)[]) => {
        dispatch(resultsSlice.actions.clearFilterGroup(filters));
      },
      [dispatch],
    ),
  };
};

export const useResultsFilters = () => useAppSelector((state) => state.results.filters);
export const useSelectedDates = () => useAppSelector((state) => state.results.selectedDates);

export default resultsSlice.reducer;
