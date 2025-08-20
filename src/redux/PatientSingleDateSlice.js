import { createSlice } from "@reduxjs/toolkit";


export const PatientSingleDateSlice= createSlice({
    name:'patientsingledata',
    initialState:{
        value:null,
    },
    reducers:{
        addDischargePatientDate:(state, action)=>{
            state.value=action.payload;
        }
    }
})

export const { addDischargePatientDate}=PatientSingleDateSlice.actions;
export default PatientSingleDateSlice.reducer;
