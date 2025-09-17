import { useCallback } from 'react';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';

export interface ProjectsState {
  selectedProjectId: string;
}

const initialState: ProjectsState = {
  selectedProjectId: '',
};

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setSelectedProjectId: (state, action: PayloadAction<string>) => {
      state.selectedProjectId = action.payload;
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
    reset: useCallback(() => {
      dispatch(projectsSlice.actions.reset());
    }, [dispatch]),
  };
};

export const useSelectedProjectId = () => useAppSelector((state) => state.projects.selectedProjectId);

export default projectsSlice.reducer;
