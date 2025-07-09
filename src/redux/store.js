import { configureStore } from '@reduxjs/toolkit'
import hospitalReducer from './hospitalSlice'
import authReducer from './authSlice'

export const store = configureStore({
  reducer: {
    hospitalnames:hospitalReducer,
    auth: authReducer,
  },
})