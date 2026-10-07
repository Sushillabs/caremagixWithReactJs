import { configureStore, combineReducers} from '@reduxjs/toolkit'
import hospitalReducer from './hospitalSlice'
import authReducer from './authSlice'
import patientListReducer from './patientListSlice'
import PatientSingleDateSliceReducer from './PatientSingleDateSlice'
import chatSliceReducer from './chatSlice'
import bottomButtonsReducer from './bottomButtonsSlice'
import { logout, AUTH_STORAGE_KEY } from './authSlice';
import jobsIdReducer, { emptyJobsState, JOBS_STORAGE_KEY } from './jobsIdslice';
import finalJobsStatusReducer, { emptyFinalJobsState } from './finalJobsStatusSlice';
import codesReducer from'./codesSlice'
import notesReducer from './notesSlice'
import tabReducer, { tabSlice } from './tabSlice'

const appReducer = combineReducers({
  hospitalnames: hospitalReducer,
  auth: authReducer,
  patientnames: patientListReducer,
  patientsingledata: PatientSingleDateSliceReducer,
  askQ: chatSliceReducer,
  buttonNames: bottomButtonsReducer,
  jobsId: jobsIdReducer,
  finalJobStatus: finalJobsStatusReducer,
  codes:codesReducer,
  notes:notesReducer,
  tab:tabReducer,
});

const rootReducer = (state, action) => {
  if (action.type === logout.type) {
    // passed explicitly: if undefined, these slices' initializers would re-read the saved copies
    state = { auth: { value: {}, item: {} }, jobsId: emptyJobsState(), finalJobStatus: emptyFinalJobsState() };
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

let lastAuth = store.getState().auth.value;
let lastJobs = store.getState().jobsId;
store.subscribe(() => {
  const { auth, jobsId } = store.getState();
  try {
    if (auth.value !== lastAuth) {
      lastAuth = auth.value;
      if (lastAuth?.token) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(lastAuth));
      else localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    if (jobsId !== lastJobs) {
      lastJobs = jobsId;
      if (Object.values(jobsId).some((list) => list.length)) localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobsId));
      else localStorage.removeItem(JOBS_STORAGE_KEY);
    }
  } catch {
    // storage full or blocked; state just won't survive a refresh
  }
});