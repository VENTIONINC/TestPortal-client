import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { RouterProvider } from 'react-router';

import { ChakraProvider, ColorModeProvider, DialogPortal, DrawerPortal, Toaster } from '@/components/ui';
import { store } from '@/redux/store';
import { router } from '@/router';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <ChakraProvider>
        <ColorModeProvider defaultTheme="light">
          <RouterProvider router={router} />

          <DialogPortal />
          <DrawerPortal />
          <Toaster />
        </ColorModeProvider>
      </ChakraProvider>
    </ReduxProvider>
  </StrictMode>,
);
