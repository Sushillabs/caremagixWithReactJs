import { createSlice } from "@reduxjs/toolkit"

export const codeSlice = createSlice({
    name: 'codes',
    initialState: {
        icd_value: [],
        cpt_value: [],
    },
    reducers: {
        addICD: (state, action) => {
            state.icd_value = [...action.payload];
        },
         addCPT: (state, action) => {
            state.cpt_value = [...action.payload];
        }
    }
})

export const { addCPT,addICD } = codeSlice.actions;
export default codeSlice.reducer;