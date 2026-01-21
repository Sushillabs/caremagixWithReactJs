import { createSlice } from '@reduxjs/toolkit';


const jobsIdSlice = createSlice({
    name: 'jobsId',
    initialState: {
        eFaxJobs: null,
        ocrJobs: null,    
    },
    reducers: {
        setJobsId: (state, action) => {
            state.eFaxJobs = action.payload.eFaxJobs;
            state.ocrJobs = action.payload.ocrJobs;
        },
        clearJobsId: (state) => {
            state.eFaxJobs = null;
            state.ocrJobs = null;
        }
    }
});

export const { setJobsId, clearJobsId } = jobsIdSlice.actions;
export default jobsIdSlice.reducer;
