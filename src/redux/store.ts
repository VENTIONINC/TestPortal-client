import { configureStore } from '@reduxjs/toolkit';

import { baseApi } from './apis/baseApi';
import dialogReducer from './slices/dialog';
import drawerReducer from './slices/drawer';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    dialog: dialogReducer,
    drawer: drawerReducer,
  },
  devTools: import.meta.env.DEV,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
