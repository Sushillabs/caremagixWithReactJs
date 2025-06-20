import { configureStore } from '@reduxjs/toolkit'
import hospitalReducer from './hospitalSlice'
export const store = configureStore({
  reducer: {
    hospitalnames:hospitalReducer,
  },
})