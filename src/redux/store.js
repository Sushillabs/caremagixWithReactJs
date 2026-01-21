import { configureStore, combineReducers} from '@reduxjs/toolkit'
import hospitalReducer from './hospitalSlice'
import authReducer from './authSlice'
import patientListReducer from './patientListSlice'
import PatientSingleDateSliceReducer from './PatientSingleDateSlice'
import chatSliceReducer from './chatSlice'
import bottomButtonsReducer from './bottomButtonsSlice'
import { logout } from './authSlice';
import jobsIdReducer from './jobsIdslice';

const appReducer = combineReducers({
  hospitalnames: hospitalReducer,
  auth: authReducer,
  patientnames: patientListReducer,
  patientsingledata: PatientSingleDateSliceReducer,
  askQ: chatSliceReducer,
  buttonNames: bottomButtonsReducer,
  jobsId: jobsIdReducer,
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