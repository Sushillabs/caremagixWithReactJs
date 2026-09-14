import { createSlice } from '@reduxjs/toolkit';


const jobsIdSlice = createSlice({
    name: 'jobsId',
    initialState: {
        eFaxJobs: [],
        ocrJobs: [],
        carePlanJobs: [],
        // Group B/C jobs (PCC, Epic, Metriport) — own status_url per job,
        // polled separately from Group A's shared /ocr-progress endpoint.
        pccJobs: [],
        epicJobs: [],
        metriportJobs: [],
    },
    reducers: {
        setJobsId: (state, action) => {
            if (Array.isArray(action.payload?.eFaxJobs)) {
                state.eFaxJobs.push(...action.payload.eFaxJobs);
            }

            if (action.payload?.ocrJobs && typeof action.payload.ocrJobs === "object") {
                state.ocrJobs.push(action.payload.ocrJobs);
            }

            if (action.payload?.carePlanJobs && typeof action.payload.carePlanJobs === "object") {
                state.carePlanJobs.push(action.payload.carePlanJobs);
            }

            if (action.payload?.pccJobs && typeof action.payload.pccJobs === "object") {
                state.pccJobs.push(action.payload.pccJobs);
            }

            if (action.payload?.epicJobs && typeof action.payload.epicJobs === "object") {
                state.epicJobs.push(action.payload.epicJobs);
            }

            if (action.payload?.metriportJobs && typeof action.payload.metriportJobs === "object") {
                state.metriportJobs.push(action.payload.metriportJobs);
            }
        },
        clearJobsId: (state) => {
            state.eFaxJobs = [];
            state.ocrJobs = [];
            state.carePlanJobs = [];
            state.pccJobs = [];
            state.epicJobs = [];
            state.metriportJobs = [];
        }
    }
});

export const { setJobsId, clearJobsId } = jobsIdSlice.actions;
export default jobsIdSlice.reducer;
