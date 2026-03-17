import { createSlice } from '@reduxjs/toolkit';


const jobsIdSlice = createSlice({
    name: 'jobsId',
    initialState: {
        eFaxJobs: [],
        ocrJobs: [],
    },
    reducers: {
        setJobsId: (state, action) => {
            if (Array.isArray(action.payload?.eFaxJobs)) {
                state.eFaxJobs.push(...action.payload.eFaxJobs);
            }

            if (action.payload?.ocrJobs && typeof action.payload.ocrJobs === "object") {
                state.ocrJobs.push(action.payload.ocrJobs);
            }
        },
        clearJobsId: (state) => {
            state.eFaxJobs = [];
            state.ocrJobs = [];
        }
    }
});

export const { setJobsId, clearJobsId } = jobsIdSlice.actions;
export default jobsIdSlice.reducer;
