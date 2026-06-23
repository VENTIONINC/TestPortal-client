import React, { useMemo } from 'react';
import { createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { DefaultDialogProps } from '@/types';

type DialogComponent<T> = React.ComponentType<T & DefaultDialogProps>;

export interface DialogState<T> {
  dialogs: {
    Component: DialogComponent<T>;
    props?: T;
    closeDialog: () => void;
    closeAllDialogs: () => void;
  }[];
}

const initialState: DialogState<object> = {
  dialogs: [],
};

export const dialogSlice = createSlice({
  name: 'dialog',
  initialState: initialState,
  reducers: {
    reset: () => initialState,
    openDialog: (state, action) => {
      // eslint-disable-next-line no-console
      if (!action.payload) return console.error('Dialog does not have an argument dispatched');

      const { Component, closeDialog, closeAllDialogs, props = {} } = action.payload;

      // eslint-disable-next-line no-console
      if (!Component) return console.error('Dialog does not have a Component. Aborting');

      state.dialogs.push({ Component, props, closeDialog, closeAllDialogs });
    },
    closeDialog: (state) => {
      state.dialogs.pop();
    },
    closeAllDialogs: (state) => {
      state.dialogs = [];
    },
  },
});

export const useDialogActions = () => {
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      openDialog: <T>(Component: DialogComponent<T>, props?: T) => {
        dispatch(
          dialogSlice.actions.openDialog({
            Component,
            props,
            closeDialog: () => dispatch(dialogSlice.actions.closeDialog()),
            closeAllDialogs: () => dispatch(dialogSlice.actions.closeAllDialogs()),
          }),
        );
      },
      closeDialog: () => {
        dispatch(dialogSlice.actions.closeDialog());
      },
      closeAllDialogs: () => {
        dispatch(dialogSlice.actions.closeAllDialogs());
      },
    }),
    [dispatch],
  );
};

export const useDialog = () => useAppSelector((state) => state.dialog.dialogs);

export default dialogSlice.reducer;
