import { createSlice } from '@reduxjs/toolkit';

export const JOBS_STORAGE_KEY = "jobs";
const JOB_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_JOBS_PER_TYPE = 50;

export const emptyJobsState = () => ({
    eFaxJobs: [],
    ocrJobs: [],
    carePlanJobs: [],
    // Group B/C jobs (PCC, Epic, Metriport) — own status_url per job,
    // polled separately from Group A's shared /ocr-progress endpoint.
    pccJobs: [],
    pccUserJobs: [],
    epicJobs: [],
    epicUserJobs: [],
    metriportJobs: [],
    cms485Jobs: [],
});

const loadSavedJobs = () => {
    const state = emptyJobsState();
    try {
        const saved = JSON.parse(localStorage.getItem(JOBS_STORAGE_KEY));
        if (!saved || typeof saved !== "object") return state;
        const cutoff = Date.now() - JOB_MAX_AGE_MS;
        Object.keys(state).forEach((key) => {
            if (!Array.isArray(saved[key])) return;
            state[key] = saved[key]
                .filter((job) => job && typeof job === "object" && job.created_at > cutoff)
                .slice(-MAX_JOBS_PER_TYPE);
        });
    } catch {
        // ignore unreadable storage
    }
    return state;
};

export const savedJobIds = () =>
    new Set(Object.values(loadSavedJobs()).flat().map((job) => job.job_id).filter(Boolean));

const stamp = (job) => ({ ...job, created_at: job.created_at ?? Date.now() });

const jobsIdSlice = createSlice({
    name: 'jobsId',
    initialState: loadSavedJobs,
    reducers: {
        setJobsId: (state, action) => {
            if (Array.isArray(action.payload?.eFaxJobs)) {
                state.eFaxJobs.push(...action.payload.eFaxJobs.map(stamp));
            }

            if (action.payload?.ocrJobs && typeof action.payload.ocrJobs === "object") {
                state.ocrJobs.push(stamp(action.payload.ocrJobs));
            }

            if (action.payload?.carePlanJobs && typeof action.payload.carePlanJobs === "object") {
                state.carePlanJobs.push(stamp(action.payload.carePlanJobs));
            }

            if (action.payload?.pccJobs && typeof action.payload.pccJobs === "object") {
                state.pccJobs.push(stamp(action.payload.pccJobs));
            }

            if (action.payload?.pccUserJobs && typeof action.payload.pccUserJobs === "object") {
                state.pccUserJobs.push(stamp(action.payload.pccUserJobs));
            }

            if (action.payload?.epicJobs && typeof action.payload.epicJobs === "object") {
                state.epicJobs.push(stamp(action.payload.epicJobs));
            }

            if (action.payload?.epicUserJobs && typeof action.payload.epicUserJobs === "object") {
                state.epicUserJobs.push(stamp(action.payload.epicUserJobs));
            }

            if (action.payload?.metriportJobs && typeof action.payload.metriportJobs === "object") {
                state.metriportJobs.push(stamp(action.payload.metriportJobs));
            }

            if (action.payload?.cms485Jobs && typeof action.payload.cms485Jobs === "object") {
                state.cms485Jobs.push(stamp(action.payload.cms485Jobs));
            }
        },
        clearJobsId: () => emptyJobsState(),
    }
});

export const { setJobsId, clearJobsId } = jobsIdSlice.actions;
export default jobsIdSlice.reducer;
