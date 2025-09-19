import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { baseApi } from './apis/baseApi';
import { mcpApi } from './apis/mcp-api/mcpApi';
import authReducer from './slices/auth';
import contextMenuReducer from './slices/contextMenu';
import dialogReducer from './slices/dialog';
import drawerReducer from './slices/drawer';
import issuesReducer from './slices/issues';
import projectsReducer from './slices/projects';
import resultsReducer from './slices/results';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['accessToken', 'refreshToken', 'isAuthenticated'],
};

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  [mcpApi.reducerPath]: mcpApi.reducer,
  auth: persistReducer(authPersistConfig, authReducer),
  contextMenu: contextMenuReducer,
  dialog: dialogReducer,
  drawer: drawerReducer,
  issues: issuesReducer,
  projects: projectsReducer,
  results: resultsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.DEV,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware, mcpApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
