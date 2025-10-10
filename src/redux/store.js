import { configureStore, combineReducers} from '@reduxjs/toolkit'
import hospitalReducer from './hospitalSlice'
import authReducer from './authSlice'
import patientListReducer from './patientListSlice'
import PatientSingleDateSliceReducer from './PatientSingleDateSlice'
import chatSliceReducer from './chatSlice'
import bottomButtonsReducer from './bottomButtonsSlice'
import { logout } from './authSlice';

const appReducer = combineReducers({
  hospitalnames: hospitalReducer,
  auth: authReducer,
  patientnames: patientListReducer,
  patientsingledata: PatientSingleDateSliceReducer,
  askQ: chatSliceReducer,
  buttonNames: bottomButtonsReducer,
});

const rootReducer = (state, action) => {
  if (action.type === logout.type) {
    state = undefined; // reset everything
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});