// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';
import { createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { DefaultDrawerProps } from '@/types';

type DrawerComponent<T> = React.ComponentType<T & DefaultDrawerProps>;

export interface DrawerState<T> {
  drawers: {
    Component: DrawerComponent<T>;
    props?: T;
    closeDrawer: () => void;
    closeAllDrawers: () => void;
  }[];
}

const initialState: DrawerState<object> = {
  drawers: [],
};

export const drawerSlice = createSlice({
  name: 'drawer',
  initialState: initialState,
  reducers: {
    reset: () => initialState,
    openDrawer: (state, action) => {
      // eslint-disable-next-line no-console
      if (!action.payload) return console.error('Drawer does not have an argument dispatched');

      const { Component, closeDrawer, closeAllDrawers, props = {} } = action.payload;

      // eslint-disable-next-line no-console
      if (!Component) return console.error('Drawer does not have a Component. Aborting');

      state.drawers.push({ Component, props, closeDrawer, closeAllDrawers });
    },
    closeDrawer: (state) => {
      state.drawers.pop();
    },
    closeAllDrawers: (state) => {
      state.drawers = [];
    },
  },
});

export const useDrawerActions = () => {
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      openDrawer: <T>(Component: DrawerComponent<T>, props?: T) => {
        dispatch(
          drawerSlice.actions.openDrawer({
            Component,
            props,
            closeDrawer: () => dispatch(drawerSlice.actions.closeDrawer()),
            closeAllDrawers: () => dispatch(drawerSlice.actions.closeAllDrawers()),
          }),
        );
      },
      closeDrawer: () => {
        dispatch(drawerSlice.actions.closeDrawer());
      },
      closeAllDrawers: () => {
        dispatch(drawerSlice.actions.closeAllDrawers());
      },
    }),
    [dispatch],
  );
};

export const useDrawer = () => useAppSelector((state) => state.drawer.drawers);

export default drawerSlice.reducer;
