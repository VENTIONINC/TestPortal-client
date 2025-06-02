import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { RouterProvider } from 'react-router';

import { ChakraProvider, DialogPortal } from '@/components/ui';
import { store } from '@/redux/store';
import { router } from '@/router';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <ChakraProvider>
        <RouterProvider router={router} />

        <DialogPortal />
      </ChakraProvider>
    </ReduxProvider>
  </StrictMode>,
);
