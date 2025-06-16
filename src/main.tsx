import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { RouterProvider } from 'react-router';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from '@/redux/store';
import { LoadingFallback } from '@/components/LoadingFallback';
import { ChakraProvider, ColorModeProvider, DialogPortal, DrawerPortal, Toaster } from '@/components/ui';
import { router } from '@/router';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <PersistGate loading={<LoadingFallback />} persistor={persistor}>
        <ChakraProvider>
          <ColorModeProvider defaultTheme="light">
            <RouterProvider router={router} />

            <DialogPortal />
            <DrawerPortal />
            <Toaster />
          </ColorModeProvider>
        </ChakraProvider>
      </PersistGate>
    </ReduxProvider>
  </StrictMode>,
);
