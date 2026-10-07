import { createSlice } from '@reduxjs/toolkit';
import { savedJobIds } from './jobsIdslice';

export const emptyFinalJobsState = () => ({
    finalJobs: [],
    serverFailMap: {},
});

const loadSavedFinalJobs = () => {
    const state = emptyFinalJobsState();
    try {
        const ids = savedJobIds();
        const saved = JSON.parse(localStorage.getItem("completed_jobs") || "[]");
        if (ids.size && Array.isArray(saved)) {
            state.finalJobs = saved.filter((job) => job?.jobId && ids.has(job.jobId));
        }
    } catch {
        // ignore unreadable storage
    }
    return state;
};

const finalJobStatusSlice = createSlice({
    name: 'finalJobStatus',
    initialState: loadSavedFinalJobs,
    reducers: {
        saveFinalJobStatus: (state, action) => {
            state.finalJobs.push(action.payload);
        },
        clearFinalJobStatus: (state) => {
            state.finalJobs = [];
        },
        saveServerFailMap: (state, action) => {
            const jobId = action.payload;
            state.serverFailMap[jobId] = true;
        },
        clearServerFailMap: (state) => {
            const jobId = action.payload;
            delete state.serverFailMap[jobId];
        }
    }
});

export const { saveFinalJobStatus, clearFinalJobStatus, saveServerFailMap, clearServerFailMap } = finalJobStatusSlice.actions;
export default finalJobStatusSlice.reducer;
