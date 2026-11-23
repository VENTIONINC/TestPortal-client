// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { PropsWithChildren } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { expect, it } from 'vitest';

import dialog, { useDialogActions } from '@/redux/slices/dialog';

const ExampleDialog = () => null;

it('dismisses only the dialogs that belonged to a previous scope or unmounted owner', () => {
  const store = configureStore({
    reducer: { dialog },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  });
  const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
  const owner = renderHook(({ scope }) => useDialogActions(scope), { wrapper, initialProps: { scope: 'run-1' } });
  const other = renderHook(() => useDialogActions(), { wrapper });

  act(() => owner.result.current.openDialog(ExampleDialog, { target: 'run-1' }));
  const closeFirst = store.getState().dialog.dialogs[0].closeDialog;
  act(() => other.result.current.openDialog(ExampleDialog, { target: 'unrelated' }));

  owner.rerender({ scope: 'run-2' });
  expect(store.getState().dialog.dialogs.map(({ props }) => props)).toEqual([{ target: 'unrelated' }]);

  act(() => owner.result.current.openDialog(ExampleDialog, { target: 'run-2' }));
  act(closeFirst);
  expect(store.getState().dialog.dialogs.map(({ props }) => props)).toEqual([
    { target: 'unrelated' },
    { target: 'run-2' },
  ]);

  owner.unmount();
  expect(store.getState().dialog.dialogs.map(({ props }) => props)).toEqual([{ target: 'unrelated' }]);
});
