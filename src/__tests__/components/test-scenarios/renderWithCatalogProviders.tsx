// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import { ChakraProvider, DialogPortal } from '@/components/ui';
import dialog from '@/redux/slices/dialog';

export const renderWithCatalogProviders = (ui: ReactNode, initialEntries?: string[]) => {
  const store = configureStore({
    reducer: { dialog },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  });

  return render(ui, {
    wrapper: ({ children }) => (
      <Provider store={store}>
        <ChakraProvider>
          <MemoryRouter initialEntries={initialEntries}>
            {children}
            <DialogPortal />
          </MemoryRouter>
        </ChakraProvider>
      </Provider>
    ),
  });
};
