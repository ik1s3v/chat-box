import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { snackBarSlice } from '@widy/react';

export const rootReducer = combineReducers({
  snackBarState: snackBarSlice.reducer,
});

export const setupStore = (preloadedState?: Partial<AppState>) => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    preloadedState,
    devTools: process.env.NODE_ENV !== 'production',
  });
};

export const store = setupStore();
export type AppState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = typeof store.dispatch;
