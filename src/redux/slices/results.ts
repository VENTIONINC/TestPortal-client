import { useCallback } from 'react';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { DateConfig, getDateRangeMap } from '@/utils';
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
  dateConfigs: DateConfig[];
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
  dateConfigs: getDateRangeMap(initialFilters.from, initialFilters.to),
};

export const resultsSlice = createSlice({
  name: 'results',
  initialState: initialState,
  reducers: {
    reset: () => initialState,
    setFilters: (state, action: PayloadAction<Partial<ResultsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setDateConfigs: (state, action: PayloadAction<DateConfig[]>) => {
      state.dateConfigs = action.payload;
    },
    toggleDateConfig: (state, action: PayloadAction<DateConfig>) => {
      state.dateConfigs = state.dateConfigs.map((d) =>
        d.date === action.payload.date ? { ...d, isActive: !d.isActive } : d,
      );
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
    setDateConfigs: useCallback(
      (dateConfigs: DateConfig[]) => {
        dispatch(resultsSlice.actions.setDateConfigs(dateConfigs));
      },
      [dispatch],
    ),
    toggleDateConfig: useCallback(
      (dateConfig: DateConfig) => {
        dispatch(resultsSlice.actions.toggleDateConfig(dateConfig));
      },
      [dispatch],
    ),
  };
};

export const useResultsFilters = () => useAppSelector((state) => state.results.filters);
export const useResultsDateConfigs = () => useAppSelector((state) => state.results.dateConfigs);

export default resultsSlice.reducer;
