import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { baseApi } from './apis/baseApi';
import authReducer from './slices/auth';
import dialogReducer from './slices/dialog';
import drawerReducer from './slices/drawer';
import issuesReducer from './slices/issues';
import resultsReducer from './slices/results';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['accessToken', 'refreshToken'],
};

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  dialog: dialogReducer,
  auth: persistReducer(authPersistConfig, authReducer),
  drawer: drawerReducer,
  issues: issuesReducer,
  results: resultsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.DEV,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
