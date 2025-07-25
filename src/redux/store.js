import { configureStore } from '@reduxjs/toolkit'
import hospitalReducer from './hospitalSlice'
import authReducer from './authSlice'
import patientListReducer from './patientListSlice'
import PatientSingleDateSliceReducer from './PatientSingleDateSlice'
import chatSliceReducer from './chatSlice'

export const store = configureStore({
  reducer: {
    hospitalnames:hospitalReducer,
    auth: authReducer,
    patientnames:patientListReducer,
    patientsingledata:PatientSingleDateSliceReducer,
    askQ:chatSliceReducer,
  },
})