// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useCallback, MouseEvent, ElementType } from 'react';
import { createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../store';

interface ContextMenuOption {
  title: string;
  subTitle?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: ElementType;
  divider?: boolean;
}

interface ContextMenuState {
  position: {
    x: number;
    y: number;
  };
  options: ContextMenuOption[];
  show: boolean;
}

const initialState: ContextMenuState = {
  position: { x: 0, y: 0 },
  options: [],
  show: false,
};

export const contextMenuSlice = createSlice({
  name: 'contextMenu',
  initialState,
  reducers: {
    openContextMenu: (state, action) => {
      const { position, options } = action.payload as Omit<ContextMenuState, 'show'>;
      state.position = position;
      state.options = options;
      state.show = true;
    },
    closeContextMenu: (state) => {
      state.options = initialState.options;
      state.position = initialState.position;
      state.show = false;
    },
  },
});

const getPosition = (evt: MouseEvent) => {
  const GAP = 4;

  if (evt.type === 'contextmenu') {
    return {
      x: evt.pageX,
      y: evt.pageY,
    };
  }

  const target = evt.target as Element;
  const { top, right, height } = target.getBoundingClientRect();

  return {
    x: right,
    y: top + height + GAP,
  };
};

export const useOpenContextMenu = () => {
  const dispatch = useDispatch();

  return useCallback(
    (evt: MouseEvent, options: ContextMenuOption[]) => {
      evt.preventDefault();
      evt.stopPropagation();

      const position = getPosition(evt);

      dispatch(
        contextMenuSlice.actions.openContextMenu({
          position,
          options,
        }),
      );
    },
    [dispatch],
  );
};

export const useCloseContextMenu = () => {
  const dispatch = useDispatch();

  return useCallback(() => {
    dispatch(contextMenuSlice.actions.closeContextMenu());
  }, [dispatch]);
};

export const useContextMenuState = () => {
  const { position, options, show } = useSelector((state: RootState) => state.contextMenu);

  return { position, options, show };
};

export type { ContextMenuOption };
export default contextMenuSlice.reducer;
