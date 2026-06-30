// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { projectsSlice } from '@/redux/slices/projects';
import { issuesSlice } from '@/redux/slices/issues';
import { resultsSlice } from '@/redux/slices/results';
import { dialogSlice } from '@/redux/slices/dialog';
import { drawerSlice } from '@/redux/slices/drawer';
import { baseApi } from '@/redux/apis/baseApi';

export const useResetState = () => {
  const dispatch = useDispatch();

  const resetState = useCallback(() => {
    dispatch(projectsSlice.actions.reset());
    dispatch(issuesSlice.actions.reset());
    dispatch(resultsSlice.actions.reset());
    dispatch(dialogSlice.actions.reset());
    dispatch(drawerSlice.actions.reset());
    dispatch(baseApi.util.resetApiState());
  }, [dispatch]);

  return resetState;
};
