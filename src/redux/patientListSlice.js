import { createSlice } from "@reduxjs/toolkit";


export const patientListSlice= createSlice({
    name:'patientnames',
    initialState:{
        value:[],
    },
    reducers:{
        addPatientNames:(state, action)=>{
            state.value=action.payload;
        }
    }
})

export const { addPatientNames}=patientListSlice.actions;
export default patientListSlice.reducer;