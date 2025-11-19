import { configureStore } from '@reduxjs/toolkit'
import { githubApi } from './githubApi'

export const makeStore = () => {
  return configureStore({
    reducer: {
      [githubApi.reducerPath]: githubApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(githubApi.middleware),
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
