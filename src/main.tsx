import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';

import { ChakraProvider, DialogPortal } from '@/components/ui';
import { store } from '@/redux/store';

import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <ChakraProvider>
        <App />

        <DialogPortal />
      </ChakraProvider>
    </ReduxProvider>
  </StrictMode>,
);
