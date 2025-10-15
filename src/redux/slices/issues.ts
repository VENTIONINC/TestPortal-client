import { useCallback } from 'react';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { IssueCategory, IssueFilters } from '@/types';

export interface IssuesState {
  filters: IssueFilters;
}

export const initialFilters: IssueFilters = {
  tag: '',
  specId: '',
  specFile: '',
  specName: '',
  environment: '',
  type: '',
  category: '' as IssueCategory,
  name: '',
  statFrom: '',
  statTo: '',
  page: 1,
};

const initialState: IssuesState = {
  filters: initialFilters,
};

export const issuesSlice = createSlice({
  name: 'issues',
  initialState: initialState,
  reducers: {
    reset: () => initialState,
    setFilters: (state, action: PayloadAction<Partial<IssueFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const useIssuesActions = () => {
  const dispatch = useAppDispatch();

  return {
    setFilters: useCallback(
      (filters: Partial<IssueFilters>) => {
        dispatch(issuesSlice.actions.setFilters(filters));
      },
      [dispatch],
    ),
  };
};

export const useIssuesFilters = () => useAppSelector((state) => state.issues.filters);

export default issuesSlice.reducer;
