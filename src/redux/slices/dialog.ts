// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import React, { useId, useLayoutEffect, useMemo } from 'react';
import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { DefaultDialogProps } from '@/types';

type DialogComponent<T> = React.ComponentType<T & DefaultDialogProps>;

export interface DialogState<T> {
  dialogs: {
    id: string;
    ownerId?: string;
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

      const { id, ownerId, Component, closeDialog, closeAllDialogs, props = {} } = action.payload;

      // eslint-disable-next-line no-console
      if (!Component) return console.error('Dialog does not have a Component. Aborting');

      state.dialogs.push({ id, ownerId, Component, props, closeDialog, closeAllDialogs });
    },
    closeDialog: (state) => {
      state.dialogs.pop();
    },
    dismissDialog: (state, { payload: id }: PayloadAction<string>) => {
      const index = state.dialogs.findIndex((dialog) => dialog.id === id);
      if (index !== -1) state.dialogs.splice(index, 1);
    },
    dismissOwnedDialogs: (state, { payload: ownerId }: PayloadAction<string>) => {
      if (state.dialogs.some((dialog) => dialog.ownerId === ownerId)) {
        state.dialogs = state.dialogs.filter((dialog) => dialog.ownerId !== ownerId);
      }
    },
    closeAllDialogs: (state) => {
      state.dialogs = [];
    },
  },
});

export const useDialogActions = (scopeKey?: string) => {
  const dispatch = useAppDispatch();
  const instanceId = useId();
  const ownerId = scopeKey === undefined ? undefined : `${instanceId}:${scopeKey}`;

  useLayoutEffect(() => {
    if (ownerId === undefined) return;
    return () => {
      dispatch(dialogSlice.actions.dismissOwnedDialogs(ownerId));
    };
  }, [dispatch, ownerId]);

  return useMemo(
    () => ({
      openDialog: <T>(Component: DialogComponent<T>, props?: T) => {
        const id = nanoid();
        dispatch(
          dialogSlice.actions.openDialog({
            id,
            ownerId,
            Component,
            props,
            closeDialog: () => dispatch(dialogSlice.actions.dismissDialog(id)),
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
    [dispatch, ownerId],
  );
};

export const useDialog = () => useAppSelector((state) => state.dialog.dialogs);

export default dialogSlice.reducer;
