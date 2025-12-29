import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { RouterProvider } from 'react-router';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from '@/redux/store';
import { AppGuard, ErrorBoundary, LoadingFallback } from '@/components';
import { ChakraProvider, ColorModeProvider, DialogPortal, DrawerPortal, Toaster } from '@/components/ui';
import { ContextMenu } from '@/components/context-menu';
import { router } from '@/router';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <PersistGate loading={<LoadingFallback />} persistor={persistor}>
        <ChakraProvider>
          <ColorModeProvider defaultTheme="light">
            <ErrorBoundary>
              <AppGuard>
                <RouterProvider router={router} />
                <DialogPortal />
                <DrawerPortal />
                <ContextMenu />
                <Toaster />
              </AppGuard>
            </ErrorBoundary>
          </ColorModeProvider>
        </ChakraProvider>
      </PersistGate>
    </ReduxProvider>
  </StrictMode>,
);
