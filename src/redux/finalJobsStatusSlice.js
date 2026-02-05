import { createSlice } from '@reduxjs/toolkit';


const finalJobStatusSlice = createSlice({
    name: 'finalJobStatus',
    initialState: {
        finalJobs: [],
        serverFailMap: {},
    },
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
