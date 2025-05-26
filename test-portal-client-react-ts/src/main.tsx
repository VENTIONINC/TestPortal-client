import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';

import { ChakraProvider, DialogPortal } from '@/components/ui';
import { store } from '@/redux/store';

import App from './App';
import './index.css';
import './styles/global.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>
        <ChakraProvider>
          <App />

          <DialogPortal />
        </ChakraProvider>
      </ReduxProvider>
    </QueryClientProvider>
  </StrictMode>,
);
