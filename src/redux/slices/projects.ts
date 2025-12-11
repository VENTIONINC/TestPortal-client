import { useCallback } from 'react';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';

export interface ProjectsState {
  selectedProjectId: string;
  isInitialized: boolean;
}

const initialState: ProjectsState = {
  selectedProjectId: '',
  isInitialized: false,
};

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setSelectedProjectId: (state, action: PayloadAction<string>) => {
      state.selectedProjectId = action.payload;
    },
    setIsInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    reset: () => initialState,
  },
});

export const useProjectsActions = () => {
  const dispatch = useAppDispatch();

  return {
    setSelectedProjectId: useCallback(
      (projectId: string) => {
        dispatch(projectsSlice.actions.setSelectedProjectId(projectId));
      },
      [dispatch],
    ),
    setIsInitialized: useCallback(
      (isInitialized: boolean) => {
        dispatch(projectsSlice.actions.setIsInitialized(isInitialized));
      },
      [dispatch],
    ),
    reset: useCallback(() => {
      dispatch(projectsSlice.actions.reset());
    }, [dispatch]),
  };
};

export const useSelectedProjectId = () => useAppSelector((state) => state.projects.selectedProjectId);
export const useIsInitialized = () => useAppSelector((state) => state.projects.isInitialized);

export default projectsSlice.reducer;
